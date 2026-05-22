import { Link } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar({ onReset }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="logo">📦 PaperSys</div>
        <nav className="topnav">
          <Link to="/">🏠 Dashboard</Link>
          <Link to="/inventario">📦 Inventario</Link>
          <Link to="/productos">⚙️ Gestionar productos</Link>
          <Link to="/ventas">🛒 Ventas</Link>
          <Link to="/reportes">📊 Reportes</Link>
          <button
            onClick={onReset}
            style={{
              padding: "8px 12px",
              background: "#ff6b6b",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#ff5252")}
            onMouseLeave={(e) => (e.target.style.background = "#ff6b6b")}
            title="Eliminar todos los datos de la BD"
          >
            🗑️ Limpiar BD
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Sidebar;
