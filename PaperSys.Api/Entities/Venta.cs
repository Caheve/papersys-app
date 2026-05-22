namespace PaperSys.Api.Entities
{
    public class Venta
    {
        public int Id { get; set; }

        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        public decimal Total { get; set; }

        public List<VentaDetalle> Detalles { get; set; } = new();
    }
}