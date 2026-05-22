import "../styles/Cart.css";

function Cart({ carrito, actualizarCantidad, eliminarDelCarrito, vaciarCarrito, confirmarVenta }) {
  const totalCarrito = carrito.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0
  );

  return (
    <div className="cart-root" style={{ width: '95%' }}>
      <div className="cart-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h3 style={{ margin: "auto" }}>🛒 Carrito</h3>
          <ul className="cart-items">
            {carrito.map((item) => (
              <li key={item.id} className="cart-item">
                <span style={{ fontWeight: 600 }}>{item.nombre}</span>
                <input
                  type="number"
                  min="1"
                  value={item.cantidad}
                  onChange={(e) => actualizarCantidad(item.id, +e.target.value)}
                />
                <button onClick={() => eliminarDelCarrito(item.id)}>🗑️</button>
                <span>= ${item.precio * item.cantidad}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="actions">
          <div style={{ fontWeight: 700}}>Total: ${totalCarrito}</div>
          <button className="btn-secondary" style={{ color:"black"}} onClick={vaciarCarrito}>Vaciar</button>
          <button className="btn-primary" onClick={confirmarVenta}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

export default Cart;