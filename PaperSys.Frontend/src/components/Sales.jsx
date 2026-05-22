import { useEffect, useState, useRef } from "react";
import "../styles/Sales.css";

function Sales() {
  const [ventas, setVentas] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(false);
  const printRef = useRef();

  const fetchVentas = async () => {
    setCargando(true);
    try {
      let url = "http://localhost:5239/api/Ventas";
      const params = new URLSearchParams();
      if (fechaInicio) params.append("fechaInicio", fechaInicio);
      if (fechaFin) params.append("fechaFin", fechaFin);
      if ([...params].length) url += "?" + params.toString();

      const res = await fetch(url);
      const data = await res.json();
      setVentas(data.ventas || []);
    } catch (error) {
      console.error("Error cargando ventas:", error);
    } finally {
      setCargando(false);
    }
  };

  const verDetalle = async (id) => {
    try {
      const res = await fetch(`http://localhost:5239/api/Ventas/${id}`);
      const data = await res.json();
      setDetalle(data);
    } catch (error) {
      console.error("Error obteniendo detalle:", error);
    }
  };

  const cerrarDetalle = () => setDetalle(null);

  const handlePrint = () => {
    if (!detalle) return;

    const ventana = window.open("", "_blank", "width=400,height=600");

    ventana.document.write(`
    <html>
      <head>
        <title>Comprobante Venta #${detalle.id}</title>
        <style>
          body {
            font-family: monospace;
            width: 80mm;
            margin: 0;
            padding: 10px;
          }

          h2 {
            text-align: center;
            margin-bottom: 5px;
          }

          .info {
            border-bottom: 1px dashed black;
            margin-bottom: 10px;
            padding-bottom: 5px;
            font-size: 12px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          th, td {
            padding: 4px 0;
          }

          th {
            text-align: left;
          }

          .right {
            text-align: right;
          }

          .center {
            text-align: center;
          }

          .total {
            margin-top: 10px;
            border-top: 1px dashed black;
            padding-top: 5px;
            text-align: right;
            font-weight: bold;
          }

          .footer {
            text-align: center;
            margin-top: 10px;
            font-size: 10px;
          }
        </style>
      </head>
      <body>

      <h2>COMPROBANTE DE VENTA</h2>
        <div style="text-align:center;font-size:12px;">
        PaperSys - Sistema de Ventas
        </div>

        <div class="info">
          <div>Venta ID: #${detalle.id}</div>
          <div>Fecha: ${formatearFechaCorta(detalle.fecha)}</div>
          <div>Hora: ${formatearHora(detalle.fecha)}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th class="center">Cant</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${detalle.detalles
              .map(
                (d) => `
              <tr>
                <td>${d.nombreProducto}</td>
                <td class="center">${d.cantidad}</td>
                <td class="right">$${parseFloat(d.subTotal).toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="total">
          TOTAL: $${parseFloat(detalle.total).toFixed(2)}
        </div>

        <div class="footer">
          Gracias por su compra<br/>
          ${new Date().toLocaleString("es-ES")}
        </div>

      </body>
    </html>
  `);

    ventana.document.close();
    ventana.focus();

    setTimeout(() => {
      ventana.print();
      ventana.close();
    }, 500);
  };
  useEffect(() => {
    fetchVentas();
  }, []);

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearFechaCorta = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatearHora = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatearPrecio = (precio) => {
    return parseFloat(precio).toFixed(2);
  };

  return (
    <>
      {/* Contenedor para la impresión */}
      {detalle && (
        <div className="print-container" ref={printRef}>
          <div className="receipt-header">
            <div className="receipt-title">COMPROBANTE DE VENTA</div>
            <div className="receipt-info">PaperSys - Sistema de Ventas</div>
          </div>

          <div
            className="receipt-info"
            style={{
              marginBottom: "10px",
              borderBottom: "1px dashed #000",
              paddingBottom: "8px",
            }}
          >
            <div style={{ marginBottom: "2px" }}>
              <strong>Venta ID:</strong> #{detalle.id}
            </div>
            <div style={{ marginBottom: "2px" }}>
              <strong>Fecha:</strong> {formatearFechaCorta(detalle.fecha)}
            </div>
            <div>
              <strong>Hora:</strong> {formatearHora(detalle.fecha)}
            </div>
          </div>

          <div className="receipt-items">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "50%", textAlign: "left" }}>Producto</th>
                  <th style={{ width: "15%", textAlign: "center" }}>Cant.</th>
                  <th style={{ width: "17%", textAlign: "right" }}>Precio</th>
                  <th style={{ width: "18%", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {detalle.detalles && detalle.detalles.length > 0 ? (
                  detalle.detalles.map((d) => (
                    <tr key={d.productoId}>
                      <td style={{ wordBreak: "break-word" }}>
                        {d.nombreProducto}
                      </td>
                      <td style={{ textAlign: "center" }}>{d.cantidad}</td>
                      <td style={{ textAlign: "right" }}>
                        ${formatearPrecio(d.precioUnitario)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        ${formatearPrecio(d.subTotal)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      Sin productos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="receipt-total">
            TOTAL: ${formatearPrecio(detalle.total)}
          </div>

          <div className="receipt-footer">
            <p>Gracias por su compra</p>
            <p style={{ fontSize: "8px", marginTop: "5px" }}>
              Documento válido de transacción comercial
            </p>
            <p style={{ fontSize: "7px", marginTop: "8px" }}>
              {new Date().toLocaleString("es-ES")}
            </p>
          </div>
        </div>
      )}

      {/* Interfaz principal */}
      <div className="sales-container">
        <div className="sales-header">
          <h2>📋 Historial de Ventas</h2>
        </div>

        <div className="sales-filters">
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
            className="filter-btn"
            onClick={fetchVentas}
            disabled={cargando}
          >
            {cargando ? "Cargando..." : "🔍 Filtrar"}
          </button>
        </div>

        {ventas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>No se encontraron ventas en el período seleccionado</p>
          </div>
        ) : (
          <div className="sales-table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v.id} onClick={() => verDetalle(v.id)}>
                    <td className="cell-id">#{v.id}</td>
                    <td>{formatearFecha(v.fecha)}</td>
                    <td className="cell-total">${v.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {detalle && (
          <div className="detail-overlay" onClick={cerrarDetalle}>
            <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="detail-header">
                <h3>Venta #{detalle.id}</h3>
              </div>

              <div className="detail-info">
                <div className="detail-info-item">
                  <div className="detail-info-label">Fecha</div>
                  <div className="detail-info-value">
                    {formatearFecha(detalle.fecha)}
                  </div>
                </div>
                <div className="detail-info-item">
                  <div className="detail-info-label">Productos</div>
                  <div className="detail-info-value">
                    {detalle.detalles.length}
                  </div>
                </div>
              </div>

              <table className="detail-items-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>SubTotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.detalles.map((d) => (
                    <tr key={d.productoId}>
                      <td>{d.nombreProducto}</td>
                      <td>{d.cantidad}</td>
                      <td>${d.precioUnitario.toFixed(2)}</td>
                      <td>${d.subTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="detail-total">
                <span>Total</span>
                <span>${detalle.total.toFixed(2)}</span>
              </div>

              <div className="detail-actions">
                <button className="close-btn" onClick={cerrarDetalle}>
                  Cerrar
                </button>
                <button className="print-btn" onClick={handlePrint}>
                  🖨️ Imprimir Comprobante
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Sales;
