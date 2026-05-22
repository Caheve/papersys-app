namespace PaperSys.Api.DTOs
{
    public class ProductoMasVendidoDto
    {
        public int ProductoId { get; set; }

        public string NombreProducto { get; set; } = string.Empty;

        public int CantidadVendida { get; set; }
    }
}