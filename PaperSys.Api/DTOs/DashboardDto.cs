namespace PaperSys.Api.DTOs
{
    public class DashboardDto
    {
        public int TotalProductos { get; set; }

        public int ProductosBajoStock { get; set; }

        public decimal ValorInventarioCompra { get; set; }

        public decimal ValorInventarioVenta { get; set; }

        public int TotalUnidades { get; set; }
    }
}