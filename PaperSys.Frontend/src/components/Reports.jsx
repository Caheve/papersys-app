import { useState, useEffect } from "react";
import "../styles/Reports.css";

function Reports() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [ganancias, setGanancias] = useState(null);
  const [productosVendidos, setProductosVendidos] = useState([]);
  const [ventasData, setVentasData] = useState(null);
  const [cargando, setCargando] = useState(false);

  const cargarReportes = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append("fechaInicio", fechaInicio);
      if (fechaFin) params.append("fechaFin", fechaFin);
      const queryString = params.toString();

      const [ganResponse, prodResponse, ventasResponse] = await Promise.all([
        fetch(
          `http://localhost:5239/api/Ventas/ganancias${queryString ? "?" + queryString : ""}`
        ).then((res) => res.json()),
        fetch(
          `http://localhost:5239/api/Ventas/producto-mas-vendido${queryString ? "?" + queryString : ""}`
        ).then((res) => res.json()),
        fetch(
          `http://localhost:5239/api/Ventas${queryString ? "?" + queryString : ""}`
        ).then((res) => res.json()),
      ]);

      setGanancias(ganResponse);
      setProductosVendidos(Array.isArray(prodResponse) ? prodResponse : []);
      setVentasData(ventasResponse);
    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setCargando(false);
    }
  };

  const descargarPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append("fechaInicio", fechaInicio);
      if (fechaFin) params.append("fechaFin", fechaFin);

      const response = await fetch(
        `http://localhost:5239/api/Ventas/reporte-pdf${params.toString() ? "?" + params.toString() : ""}`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Reporte_Ventas_${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Error al descargar el PDF");
      }
    } catch (error) {
      console.error("Error descargando PDF:", error);
      alert("Error al descargar el reporte");
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>📊 Reportes y Estadísticas</h2>
      </div>

      <div className="reports-filters">
        <div className="filter-group">
          <label>Desde</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Hasta</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>

        <button
          className="btn-filter"
          onClick={cargarReportes}
          disabled={cargando}
        >
          {cargando ? "Cargando..." : "🔍 Filtrar"}
        </button>

        <button
          className="btn-download"
          onClick={descargarPDF}
          disabled={cargando}
        >
          📥 Descargar PDF
        </button>
      </div>

      {/* Estadísticas principales */}
      {ganancias && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Vendido</div>
            <div className="stat-value">${ganancias.totalVendido.toFixed(2)}</div>
            <div className="stat-icon">💰</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Total Costo</div>
            <div className="stat-value">${ganancias.totalCosto.toFixed(2)}</div>
            <div className="stat-icon">📦</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Ganancia</div>
            <div className="stat-value" style={{ color: "#28a745" }}>
              ${ganancias.ganancia.toFixed(2)}
            </div>
            <div className="stat-icon">📈</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Margen %</div>
            <div className="stat-value">{ganancias.margenPorcentaje.toFixed(2)}%</div>
            <div className="stat-icon">📊</div>
          </div>
        </div>
      )}

      {/* Resumen de ventas */}
      {ventasData && (
        <div className="summary-card">
          <h3>📋 Resumen de Ventas</h3>
          <div className="summary-content">
            <div className="summary-item">
              <span>Total de ventas:</span>
              <strong>{ventasData.cantidadVentas}</strong>
            </div>
            <div className="summary-item">
              <span>Monto total vendido:</span>
              <strong>${ventasData.totalVendido.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Productos más vendidos */}
      {productosVendidos.length > 0 && (
        <div className="products-table-container">
          <h3>🔥 Productos Más Vendidos</h3>
          <table className="products-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad Vendida</th>
              </tr>
            </thead>
            <tbody>
              {productosVendidos.map((p, idx) => (
                <tr key={idx}>
                  <td>{p.nombreProducto}</td>
                  <td>{p.cantidadVendida}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!cargando && !ganancias && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>No hay datos para el período seleccionado</p>
        </div>
      )}
    </div>
  );
}

export default Reports;
