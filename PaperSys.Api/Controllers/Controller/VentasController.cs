using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PaperSys.Api.Data;
using PaperSys.Api.DTOs;
using PaperSys.Api.Entities;

using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace PaperSys.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VentasController : ControllerBase
    {
        private readonly PaperSysDbContext _context;

        public VentasController(PaperSysDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult> CrearVenta(VentaCrearDto dto)
        {
            if (!dto.Productos.Any())
                return BadRequest("La venta debe contener productos.");

            var venta = new Venta();
            decimal total = 0;

            foreach (var item in dto.Productos)
            {
                var producto = await _context.Productos
                    .FirstOrDefaultAsync(p => p.Id == item.ProductoId && p.Activo);

                if (producto == null)
                    return BadRequest($"Producto {item.ProductoId} no existe.");

                if (producto.Stock < item.Cantidad)
                    return BadRequest($"Stock insuficiente para {producto.Nombre}.");

                var subtotal = producto.PrecioVenta * item.Cantidad;

                producto.Stock -= item.Cantidad;

                var detalle = new VentaDetalle
                {
                    ProductoId = producto.Id,
                    Cantidad = item.Cantidad,
                    PrecioUnitario = producto.PrecioVenta,
                    SubTotal = subtotal
                };

                total += subtotal;
                venta.Detalles.Add(detalle);
            }

            venta.Total = total;

            _context.Ventas.Add(venta);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Venta registrada correctamente", ventaId = venta.Id });
        }

        [HttpGet]
        public async Task<ActionResult> GetVentas( DateTime? fechaInicio, DateTime? fechaFin)
        {
            var query = _context.Ventas.AsQueryable();

            if (fechaInicio.HasValue)
                query = query.Where(v => v.Fecha >= fechaInicio.Value);

            if (fechaFin.HasValue)
                query = query.Where(v => v.Fecha <= fechaFin.Value);

            var ventas = await query
                .OrderByDescending(v => v.Fecha)
                .Select(v => new VentaHistorialDto
                {
                    Id = v.Id,
                    Fecha = v.Fecha,
                    Total = v.Total
                })
                .ToListAsync();

            var totalPeriodo = ventas.Sum(v => v.Total);

            return Ok(new
            {
                cantidadVentas = ventas.Count,
                totalVendido = totalPeriodo,
                ventas
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VentaCompletaDto>> GetVentaPorId(int id)
        {
            var venta = await _context.Ventas
                .Include(v => v.Detalles)
                .ThenInclude(d => d.Producto)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (venta == null)
                return NotFound();

            var resultado = new VentaCompletaDto
            {
                Id = venta.Id,
                Fecha = venta.Fecha,
                Total = venta.Total,
                Detalles = venta.Detalles.Select(d => new VentaDetalleDto
                {
                    ProductoId = d.ProductoId,
                    NombreProducto = d.Producto.Nombre,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario,
                    SubTotal = d.SubTotal
                }).ToList()
            };

            return Ok(resultado);
        }

        [HttpGet("reporte-pdf")]
        public async Task<IActionResult> GenerarReportePdf(
    DateTime? fechaInicio,
    DateTime? fechaFin)
        {
            var query = _context.Ventas
                .Include(v => v.Detalles)
                .ThenInclude(d => d.Producto)
                .AsQueryable();

            if (fechaInicio.HasValue)
                query = query.Where(v => v.Fecha >= fechaInicio.Value);

            if (fechaFin.HasValue)
                query = query.Where(v => v.Fecha <= fechaFin.Value);

            var ventas = await query
                .OrderBy(v => v.Fecha)
                .ToListAsync();

            var totalVendido = ventas.Sum(v => v.Total);

            // Calcular ganancias
            var totalCosto = ventas
                .SelectMany(v => v.Detalles)
                .Sum(d => d.Producto.PrecioCompra * d.Cantidad);

            var ganancia = totalVendido - totalCosto;
            var margen = totalVendido == 0 ? 0 : (ganancia / totalVendido) * 100;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(30);

                    page.Header()
                        .Text("Reporte de Ventas - PaperSys")
                        .FontSize(20)
                        .Bold();

                    page.Content().Column(column =>
                    {
                        column.Spacing(10);

                        column.Item().Text($"Desde: {fechaInicio?.ToShortDateString() ?? "Inicio"}");
                        column.Item().Text($"Hasta: {fechaFin?.ToShortDateString() ?? "Hoy"}");

                        // Tabla de ganancias
                        column.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });

                            table.Cell().Text("Total Vendido").Bold().BackgroundColor("E8F5E9");
                            table.Cell().Text($"${totalVendido:F2}").BackgroundColor("E8F5E9");

                            table.Cell().Text("Total Costo").Bold().BackgroundColor("FFF3E0");
                            table.Cell().Text($"${totalCosto:F2}").BackgroundColor("FFF3E0");

                            table.Cell().Text("Ganancia").Bold().BackgroundColor("E3F2FD");
                            table.Cell().Text($"${ganancia:F2}").BackgroundColor("E3F2FD");

                            table.Cell().Text("Margen %").Bold().BackgroundColor("F3E5F5");
                            table.Cell().Text($"{margen:F2}%").BackgroundColor("F3E5F5");
                        });

                        column.Item().PaddingTop(20).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });

                            table.Header(header =>
                            {
                                header.Cell().Text("ID").Bold();
                                header.Cell().Text("Fecha").Bold();
                                header.Cell().Text("Total").Bold();
                            });

                            foreach (var venta in ventas)
                            {
                                table.Cell().Text(venta.Id.ToString());
                                table.Cell().Text(venta.Fecha.ToShortDateString());
                                table.Cell().Text($"${venta.Total}");
                            }
                        });

                        column.Item().Text($"Total Vendido: ${totalVendido}")
                            .Bold()
                            .FontSize(14);
                    });
                });
            });

            var pdf = document.GeneratePdf();

            return File(pdf, "application/pdf", "ReporteVentas.pdf");
        }

        [HttpGet("estadisticas-por-dia")]
        public async Task<ActionResult<List<EstadisticaVentaPorDiaDto>>>
        GetEstadisticasPorDia(DateTime? fechaInicio, DateTime? fechaFin)
        {
            var query = _context.Ventas.AsQueryable();

            if (fechaInicio.HasValue)
            {
                var inicio = fechaInicio.Value.Date;
                query = query.Where(v => v.Fecha >= inicio);
            }

            if (fechaFin.HasValue)
            {
                var fin = fechaFin.Value.Date.AddDays(1);
                query = query.Where(v => v.Fecha < fin);
            }

            var resultado = await query
                .GroupBy(v => v.Fecha.Date)
                .Select(g => new EstadisticaVentaPorDiaDto
                {
                    Fecha = g.Key,
                    TotalVendido = g.Sum(v => v.Total)
                })
                .OrderBy(x => x.Fecha)
                .ToListAsync();

            return Ok(resultado);
        }

        [HttpGet("ganancias")]
        public async Task<ActionResult<GananciaReporteDto>>
    GetGanancias(DateTime? fechaInicio, DateTime? fechaFin)
        {
            var query = _context.Ventas
                .Include(v => v.Detalles)
                .ThenInclude(d => d.Producto)
                .AsQueryable();

            if (fechaInicio.HasValue)
                query = query.Where(v => v.Fecha >= fechaInicio.Value);

            if (fechaFin.HasValue)
                query = query.Where(v => v.Fecha <= fechaFin.Value);

            var ventas = await query.ToListAsync();

            var totalVendido = ventas.Sum(v => v.Total);

            var totalCosto = ventas
                .SelectMany(v => v.Detalles)
                .Sum(d => d.Producto.PrecioCompra * d.Cantidad);

            var ganancia = totalVendido - totalCosto;

            var margen = totalVendido == 0
                ? 0
                : (ganancia / totalVendido) * 100;

            return Ok(new GananciaReporteDto
            {
                TotalVendido = totalVendido,
                TotalCosto = totalCosto,
                Ganancia = ganancia,
                MargenPorcentaje = margen
            });
        }

        [HttpGet("producto-mas-vendido")]
        public async Task<ActionResult<List<ProductoMasVendidoDto>>>
    GetProductoMasVendido(DateTime? fechaInicio, DateTime? fechaFin)
        {
            var query = _context.Ventas
                .Include(v => v.Detalles)
                .ThenInclude(d => d.Producto)
                .AsQueryable();

            if (fechaInicio.HasValue)
                query = query.Where(v => v.Fecha >= fechaInicio.Value);

            if (fechaFin.HasValue)
                query = query.Where(v => v.Fecha <= fechaFin.Value);

            var resultado = await query
                .SelectMany(v => v.Detalles)
                .GroupBy(d => new { d.ProductoId, d.Producto.Nombre })
                .Select(g => new ProductoMasVendidoDto
                {
                    ProductoId = g.Key.ProductoId,
                    NombreProducto = g.Key.Nombre,
                    CantidadVendida = g.Sum(x => x.Cantidad)
                })
                .OrderByDescending(x => x.CantidadVendida)
                .ToListAsync();

            return Ok(resultado);
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> Dashboard()
        {
            var hoy = DateTime.Today;
            var manana = hoy.AddDays(1);

            var ventasHoy = _context.Ventas
                .Where(v => v.Fecha >= hoy && v.Fecha < manana);

            var totalVendido = await ventasHoy.SumAsync(v => v.Total);

            var cantidadVentas = await ventasHoy.CountAsync();

            var productoMasVendido = await _context.VentaDetalles
                .Where(d => d.Venta.Fecha >= hoy && d.Venta.Fecha < manana)
                .GroupBy(d => d.Producto.Nombre)
                .Select(g => new {
                    Nombre = g.Key,
                    Cantidad = g.Sum(x => x.Cantidad)
                })
                .OrderByDescending(x => x.Cantidad)
                .FirstOrDefaultAsync();

            var stockBajo = await _context.Productos
                .Where(p => p.Stock <= 5)
                .CountAsync();

            return Ok(new
            {
                totalVendido,
                cantidadVentas,
                productoMasVendido = productoMasVendido?.Nombre ?? "Ninguno",
                stockBajo
            });
        }

        [HttpGet("ultimos-7-dias")]
        public async Task<IActionResult> Ultimos7Dias()
        {
            var hoy = DateTime.Today;
            var hace7Dias = hoy.AddDays(-6); // incluye hoy

            var ventas = await _context.Ventas
                .Where(v => v.Fecha >= hace7Dias && v.Fecha < hoy.AddDays(1))
                .GroupBy(v => v.Fecha.Date)
                .Select(g => new
                {
                    Fecha = g.Key,
                    Total = g.Sum(v => v.Total)
                })
                .ToListAsync();

            // Generamos los 7 días aunque no haya ventas
            var resultado = Enumerable.Range(0, 7)
                .Select(i =>
                {
                    var fecha = hace7Dias.AddDays(i);
                    var ventaDia = ventas.FirstOrDefault(v => v.Fecha == fecha);

                    return new
                    {
                        fecha = fecha.ToString("yyyy-MM-dd"),
                        total = ventaDia?.Total ?? 0
                    };
                })
                .ToList();

            return Ok(resultado);
        }

    }
}