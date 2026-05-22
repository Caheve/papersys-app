namespace PaperSys.Api.DTOs
{
    public class GananciaReporteDto
    {
        public decimal TotalVendido { get; set; }

        public decimal TotalCosto { get; set; }

        public decimal Ganancia { get; set; }

        public decimal MargenPorcentaje { get; set; }
    }
}