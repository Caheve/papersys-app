import "../styles/Inventory.css";
import ProductCard from "./ProductCard";
import { useEffect, useState } from "react";

function Inventory({ productos = [], agregarAlCarrito }) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(productos);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(
      productos.filter((p) => p.nombre.toLowerCase().includes(query.toLowerCase()))
    );
  }, [productos, query]);

  useEffect(() => {
    const handler = () => {
      // parent App must refresh productos prop; this forces re-evaluation
      setVisible(productos.filter((p) => p.nombre.toLowerCase().includes(query.toLowerCase())));
    };
    window.addEventListener('productos:changed', handler);
    return () => window.removeEventListener('productos:changed', handler);
  }, [productos, query]);

  if (!productos || productos.length === 0) {
    return <p>No hay productos disponibles 📭</p>;
  }

  return (
    <div className="content-products">
      <div style={{ marginBottom: 10 }}>
        <input placeholder="Buscar productos..." value={query} onChange={(e) => setQuery(e.target.value)} className="search-input" />
      </div>

      <div className="inventory-grid">
        {visible.map((p) => (
          <ProductCard
            key={p.id}
            producto={p}
            agregarAlCarrito={agregarAlCarrito}
          />
        ))}
      </div>
    </div>
  );
}

export default Inventory;