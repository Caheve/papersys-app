namespace PaperSys.Api.Entities
{
    public class VentaDetalle
    {
        public int Id { get; set; }

        public int ProductoId { get; set; }

        public Producto Producto { get; set; }

        public int Cantidad { get; set; }

        public decimal PrecioUnitario { get; set; }

        public decimal SubTotal { get; set; }

        public int VentaId { get; set; }

        public Venta Venta { get; set; }
    }
}