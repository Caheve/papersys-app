import { useState } from "react";

function ProductCard({ producto, agregarAlCarrito }) {
  const [cantidad, setCantidad] = useState(1);

  const handleFocus = (e) => {
    e.target.value = "";
    setCantidad("");
  };

  const handleChange = (e) => {
    const valor = e.target.value;
    if (valor === "") {
      setCantidad("");
    } else {
      setCantidad(parseInt(valor) || "");
    }
  };

  const handleBlur = (e) => {
    if (cantidad === "" || cantidad === 0) {
      setCantidad(1);
      e.target.value = 1;
    }
  };

  return (
    <div className="inventory-card">
      <h3>{producto.nombre}</h3>
      <p>💲 Precio: ${producto.precioVenta}</p>
      <p className={producto.stock <= 5 ? "low-stock" : ""}>
        📦 Stock: {producto.stock}
      </p>

      <input
        className="quantity-input"
        type="number"
        min="1"
        max={producto.stock}
        value={cantidad}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Cantidad"
      />

      <button
        className={producto.stock <= 0 ? "btn-disabled" : "btn-primary"}
        disabled={producto.stock <= 0}
        onClick={() => agregarAlCarrito(producto, cantidad)}
      >
        {producto.stock <= 0 ? "Sin stock" : "Agregar"}
      </button>
    </div>
  );
}

export default ProductCard;
