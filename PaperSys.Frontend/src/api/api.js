const API_URL = "http://localhost:5239/api";

export const getProductos = async () => {
  return fetch(`${API_URL}/Productos`).then((res) => res.json());
};

export const createProducto = (producto) =>
  fetch(`${API_URL}/Productos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  }).then((res) => res.json());

export const updateProducto = (id, producto) =>
  fetch(`${API_URL}/Productos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  }).then((res) => {
    if (!res.ok) throw new Error(res.statusText);
    // Might return 204 No Content, so avoid parsing in that case
    return res.text().then((t) => (t ? JSON.parse(t) : null));
  });

export const deleteProducto = (id) =>
  fetch(`${API_URL}/Productos/${id}`, {
    method: "DELETE",
  }).then((res) => {
    if (!res.ok) throw new Error(res.statusText);
    return res.text().then((t) => (t ? JSON.parse(t) : null));
  });

export const getDashboard = () =>
  fetch(`${API_URL}/Ventas/dashboard`).then((res) => res.json());

export const getTotalHoy = (hoy) =>
  fetch(
    `${API_URL}/Ventas/estadisticas-por-dia?fechaInicio=${hoy}&fechaFin=${hoy}`,
  ).then((res) => res.json());

export const getVentasSemana = () =>
  fetch(`${API_URL}/Ventas/ultimos-7-dias`).then((res) => res.json());

export const registrarVenta = (productos) =>
  fetch(`${API_URL}/Ventas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productos }),
  }).then((res) => res.json());
