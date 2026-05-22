using Microsoft.EntityFrameworkCore;
using PaperSys.Api.Entities;

namespace PaperSys.Api.Data
{
    public class PaperSysDbContext : DbContext
    {
        public PaperSysDbContext(DbContextOptions<PaperSysDbContext> options)
            : base(options)
        {
        }

        public DbSet<Producto> Productos { get; set; }

        public DbSet<Venta> Ventas { get; set; }
        public DbSet<VentaDetalle> VentaDetalles { get; set; }
    }


}