import { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import ManageProducts from "./components/ManageProducts";
import Cart from "./components/Cart";
import Sales from "./components/Sales";
import Reports from "./components/Reports";

import { API_URL } from "./api/api";

import "../src/App.css";
import "./styles/Reports.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [ventasPorDia, setVentasPorDia] = useState([]);
  const [productos, setProductos] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [carrito, setCarrito] = useState([]);

  // 🔥 CARGAR DATOS
  const cargarDatos = useCallback(async () => {
    try {
      const [prodRes, dashRes, semanaRes] = await Promise.all([
        fetch(`${API_URL}/Productos`).then((res) => res.json()),
        fetch(`${API_URL}/Ventas/dashboard`).then((res) => res.json()),
        fetch(`${API_URL}/Ventas/ultimos-7-dias`).then((res) =>
          res.json()
        ),
      ]);

      // 🔥 FORZAR ACTUALIZACIÓN REACT
      setProductos([...(prodRes.data || prodRes)]);

      console.log("📊 Dashboard actualizado:", dashRes);

      setDashboard({ ...dashRes });

      setVentasPorDia([...semanaRes]);
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
    }
  }, []);

  // 🔥 CARGA INICIAL
  useEffect(() => {
    cargarDatos();

    const handler = () => cargarDatos();

    window.addEventListener(
      "productos:changed",
      handler
    );

    return () =>
      window.removeEventListener(
        "productos:changed",
        handler
      );
  }, [cargarDatos]);

  // 🔥 AGREGAR AL CARRITO
  const agregarAlCarrito = (producto, cantidad) => {
    if (cantidad <= 0) return;

    setCarrito((prev) => {
      const existente = prev.find(
        (p) => p.id === producto.id
      );

      if (existente) {
        return prev.map((p) =>
          p.id === producto.id
            ? {
                ...p,
                cantidad: p.cantidad + cantidad,
              }
            : p
        );
      }

      return [
        ...prev,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precioVenta,
          cantidad,
        },
      ];
    });
  };

  // 🔥 ACTUALIZAR CANTIDAD
  const actualizarCantidad = (
    id,
    nuevaCantidad
  ) => {
    if (nuevaCantidad <= 0) return;

    setCarrito((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              cantidad: nuevaCantidad,
            }
          : item
      )
    );
  };

  // 🔥 ELIMINAR DEL CARRITO
  const eliminarDelCarrito = (id) => {
    setCarrito((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  // 🔥 VACIAR CARRITO
  const vaciarCarrito = () => setCarrito([]);

  // 🔥 RESETEAR BASE DE DATOS
  const resetearBaseDatos = async () => {
    const confirmacion = window.confirm(
      "⚠️ ¡ADVERTENCIA!\n\nEsta acción eliminará TODOS los datos:\n• Todas las ventas\n• Todos los productos\n\n¿Estás seguro de que deseas continuar?"
    );

    if (!confirmacion) return;

    const dobleConfirmacion = window.confirm(
      "Esta es tu última oportunidad.\n¿Deseas continuar? Esta acción NO se puede deshacer."
    );

    if (!dobleConfirmacion) return;

    try {
      const response = await fetch(
        `${API_URL}/Productos/reset-database`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (!response.ok) {
        let errorMsg =
          "No se pudo limpiar la BD";

        if (
          contentType &&
          contentType.includes(
            "application/json"
          )
        ) {
          const errorData =
            await response.json();

          errorMsg =
            errorData.error || errorMsg;
        } else {
          errorMsg = `Error ${response.status}: ${response.statusText}`;
        }

        alert("❌ " + errorMsg);

        return;
      }

      if (
        contentType &&
        contentType.includes(
          "application/json"
        )
      ) {
        const data = await response.json();

        alert(
          data.mensaje ||
            "✅ Base de datos limpiada correctamente"
        );
      } else {
        alert(
          "✅ Base de datos limpiada correctamente"
        );
      }

      setCarrito([]);

      cargarDatos();
    } catch (error) {
      console.error(
        "❌ Error al limpiar BD:",
        error
      );

      alert(
        "❌ Error de conexión: " +
          error.message
      );
    }
  };

  // 🔥 CONFIRMAR VENTA
  const confirmarVenta = async () => {
    try {
      const response = await fetch(
        `${API_URL}/Ventas`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            productos: carrito.map(
              (item) => ({
                productoId: item.id,
                cantidad: item.cantidad,
              })
            ),
          }),
        }
      );

      if (response.ok) {
        alert("💰 Venta registrada");

        setCarrito([]);

        // 🔥 ESPERAR A QUE SQL GUARDE
        setTimeout(() => {
          cargarDatos();
        }, 500);
      } else {
        alert("❌ Error al vender");
      }
    } catch (error) {
      console.error(
        "❌ Error al confirmar venta:",
        error
      );
    }
  };

  return (
    <Router>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "100vh",
          width: "100vw",
        }}
      >
        <Sidebar onReset={resetearBaseDatos} />

        <div
          style={{
            flex: 1,
            padding: "20px",
            paddingTop:
              "var(--topbar-height)",
          }}
        >
          <Routes>
            {/* 🔥 DASHBOARD */}
            <Route
              path="/"
              element={
                <Dashboard
                  dashboard={dashboard}
                  ventasPorDia={
                    ventasPorDia
                  }
                />
              }
            />

            {/* 🔥 INVENTARIO */}
            <Route
              path="/inventario"
              element={
                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <div className="products-scroll">
                    <Inventory
                      productos={
                        productos
                      }
                      agregarAlCarrito={
                        agregarAlCarrito
                      }
                    />
                  </div>

                  <div className="cart-bottom">
                    <div className="cart-inner">
                      <Cart
                        carrito={carrito}
                        actualizarCantidad={
                          actualizarCantidad
                        }
                        eliminarDelCarrito={
                          eliminarDelCarrito
                        }
                        vaciarCarrito={
                          vaciarCarrito
                        }
                        confirmarVenta={
                          confirmarVenta
                        }
                      />
                    </div>
                  </div>
                </div>
              }
            />

            {/* 🔥 REPORTES */}
            <Route
              path="/reportes"
              element={<Reports />}
            />

            {/* 🔥 VENTAS */}
            <Route
              path="/ventas"
              element={<Sales />}
            />

            {/* 🔥 PRODUCTOS */}
            <Route
              path="/productos"
              element={
                <ManageProducts />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;