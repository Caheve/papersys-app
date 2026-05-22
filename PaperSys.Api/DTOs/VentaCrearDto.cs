namespace PaperSys.Api.DTOs
{
    public class VentaCrearDto
    {
        public List<VentaDetalleCrearDto> Productos { get; set; } = new();
    }

    public class VentaDetalleCrearDto
    {
        public int ProductoId { get; set; }
        public int Cantidad { get; set; }
    }
}