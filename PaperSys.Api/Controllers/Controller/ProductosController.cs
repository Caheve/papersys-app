using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PaperSys.Api.Data;
using PaperSys.Api.Entities;
using PaperSys.Api.DTOs;

namespace PaperSys.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductosController : ControllerBase
    {
        private readonly PaperSysDbContext _context;

        public ProductosController(PaperSysDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Producto>>> GetProductos()
        {
            var productos = await _context.Productos.ToListAsync();
            return Ok(productos);
        }

        [HttpPost("reset-database")]
        public async Task<ActionResult> ResetearBaseDatos()
        {
            try
            {
                // Eliminar todas las ventas detalles primero (por constraint de FK)
                var detalles = await _context.VentaDetalles.ToListAsync();
                _context.VentaDetalles.RemoveRange(detalles);
                
                // Eliminar todas las ventas
                var ventas = await _context.Ventas.ToListAsync();
                _context.Ventas.RemoveRange(ventas);
                
                // Eliminar todos los productos
                var productos = await _context.Productos.ToListAsync();
                _context.Productos.RemoveRange(productos);

                await _context.SaveChangesAsync();

                return Ok(new { mensaje = "✅ Base de datos limpiada correctamente. Todos los datos han sido eliminados." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "❌ Error al limpiar la base de datos: " + ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Producto>> GetProductoPorId(int id)
        {
            var producto = await _context.Productos.FindAsync(id);

            if (producto == null)
                return NotFound();

            return Ok(producto);
        }

        [HttpPost]
        public async Task<ActionResult> CrearProducto([FromBody] ProductoDto dto)
        {
            var producto = new Producto
            {
                Nombre = dto.Nombre,
                PrecioCompra = dto.PrecioCompra,
                PrecioVenta = dto.PrecioVenta,
                PrecioMayorista = dto.PrecioMayorista,
                Stock = dto.Stock,
                StockMinimo = dto.StockMinimo
            };

            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();

            return Ok(producto);
        }
        [HttpPut("{id}")]
        public async Task<ActionResult> ActualizarProducto(int id, ProductoDto dto)
        {
            var producto = await _context.Productos.FindAsync(id);

            if (producto == null)
                return NotFound();

            // Actualizamos los campos
            producto.Nombre = dto.Nombre;
            producto.PrecioCompra = dto.PrecioCompra;
            producto.PrecioVenta = dto.PrecioVenta;
            producto.PrecioMayorista = dto.PrecioMayorista;
            producto.Stock = dto.Stock;
            producto.StockMinimo = dto.StockMinimo;

            await _context.SaveChangesAsync();

            return NoContent(); // 204
        }

        [HttpGet("bajo-stock")]
        public async Task<ActionResult<IEnumerable<Producto>>> GetProductosBajoStock()
        {
            var productos = await _context.Productos
                .Where(p => p.Stock <= p.StockMinimo && p.Activo)
                .ToListAsync();

            return Ok(productos);
        }

        [HttpGet("dashboard")]
        public async Task<ActionResult<DashboardDto>> GetDashboard()
        {
            var productos = await _context.Productos
                .Where(p => p.Activo)
                .ToListAsync();

            var dashboard = new DashboardDto
            {
                TotalProductos = productos.Count,

                ProductosBajoStock = productos
                    .Count(p => p.Stock <= p.StockMinimo),

                ValorInventarioCompra = productos
                    .Sum(p => p.PrecioCompra * p.Stock),

                ValorInventarioVenta = productos
                    .Sum(p => p.PrecioVenta * p.Stock),

                TotalUnidades = productos
                    .Sum(p => p.Stock)
            };

            return Ok(dashboard);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> EliminarProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null)
                return NotFound();

            _context.Productos.Remove(producto);
            await _context.SaveChangesAsync();

            return NoContent(); // 204
        }
    }
}