namespace PaperSys.Api.DTOs
{
    public class VentaCompletaDto
    {
        public int Id { get; set; }

        public DateTime Fecha { get; set; }

        public decimal Total { get; set; }

        public List<VentaDetalleDto> Detalles { get; set; } = new();
    }
}