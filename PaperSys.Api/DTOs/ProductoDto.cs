namespace PaperSys.Api.DTOs
{
    public class ProductoDto
    {
        public int Id { get; set; }

        public required string Nombre { get; set; }

        public decimal PrecioCompra { get; set; }

        public decimal PrecioVenta { get; set; }

        public decimal PrecioMayorista { get; set; }

        public int Stock { get; set; }

        public int StockMinimo { get; set; }
    }
}