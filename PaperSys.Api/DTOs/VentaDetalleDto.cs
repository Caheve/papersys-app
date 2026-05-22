namespace PaperSys.Api.DTOs
{
    public class VentaDetalleDto
    {
        public int ProductoId { get; set; }

        public string NombreProducto { get; set; } = string.Empty;

        public int Cantidad { get; set; }

        public decimal PrecioUnitario { get; set; }

        public decimal SubTotal { get; set; }
    }
}