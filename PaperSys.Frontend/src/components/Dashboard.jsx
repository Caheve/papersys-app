import { Bar } from "react-chartjs-2";
import "../styles/Dashboard.css";

function Dashboard({ dashboard, ventasPorDia }) {
  return (
    <div className="dashboard-container">
      {dashboard && (
        <div className="dashboard-cards">
          <div>💰 Total Hoy: ${dashboard.totalVendido}</div>
          <div>🧾 Ventas Hoy: {dashboard.cantidadVentas}</div>
          <div>🔥 Más vendido: {dashboard.productoMasVendido}</div>
          <div>⚠️ Stock bajo: {dashboard.stockBajo}</div>
        </div>
      )}

      {ventasPorDia.length > 0 && (
        <div className="chart-container">
          <h2>📊 Ventas últimos 7 días</h2>
          <Bar
            data={{
              labels: ventasPorDia.map((v) => v.fecha),
              datasets: [
                {
                  label: "Ventas",
                  data: ventasPorDia.map((v) => v.total),
                  backgroundColor: "rgba(80, 199, 159, 0.6)",
                  borderColor: "#50C79F",
                  borderWidth: 2,
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  position: "top",
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Dashboard;