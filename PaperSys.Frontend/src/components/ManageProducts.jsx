import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProductos, createProducto, updateProducto, deleteProducto } from "../api/api";
import "../styles/ManageProducts.css";

function emptyProduct() {
  return {
    nombre: "",
    precioCompra: 0,
    precioVenta: 0,
    precioMayorista: 0,
    stock: 0,
    stockMinimo: 0,
    activo: true,
  };
}

export default function ManageProducts() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct());
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getProductos();
      const list = Array.isArray(data) ? data : data.data || [];
      // only keep active products (in case some records were previously deactivated)
      setProductos(list.filter((p) => (p.activo ?? p.Activo ?? true)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleNumberChange = (k, valor) => {
    if (valor === "") {
      handleChange(k, "");
    } else if (k === "precioCompra" || k === "precioVenta" || k === "precioMayorista") {
      handleChange(k, parseFloat(valor) || "");
    } else {
      handleChange(k, parseInt(valor) || "");
    }
  };

  const handleNumberBlur = (k) => {
    if (form[k] === "") {
      handleChange(k, 0);
    }
  };

const handleCreate = async () => {
  try {

    const payload = {
      nombre: form.nombre,
      precioCompra: Number(form.precioCompra),
      precioVenta: Number(form.precioVenta),
      precioMayorista: Number(form.precioMayorista),
      stock: Number(form.stock),
      stockMinimo: Number(form.stockMinimo)
    };

    await createProducto(payload);

    window.dispatchEvent(new Event("productos:changed"));
    await load();
    navigate('/inventario');
    setForm(emptyProduct());

  } catch (e) {
    console.error(e);
  }
};

  const handleUpdate = async () => {
    if (editing == null) return;
    try {
      await updateProducto(editing, form);
      setEditing(null);
      setForm(emptyProduct());
      window.dispatchEvent(new Event("productos:changed"));
      await load();
      navigate('/inventario');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Eliminar producto?")) return;
    try {
      await deleteProducto(id);
      // remove from local list immediately
      setProductos((prev) => prev.filter((x) => (x.id ?? x.Id) !== id));
      window.dispatchEvent(new Event("productos:changed"));
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (p) => {
    const id = p.id ?? p.Id;
    setEditing(id);
    setForm({
      nombre: p.nombre ?? p.Nombre ?? "",
      precioCompra: p.precioCompra ?? p.PrecioCompra ?? 0,
      precioVenta: p.precioVenta ?? p.PrecioVenta ?? 0,
      precioMayorista: p.precioMayorista ?? p.PrecioMayorista ?? 0,
      stock: p.stock ?? p.Stock ?? 0,
      stockMinimo: p.stockMinimo ?? p.StockMinimo ?? 0,
      activo: p.activo ?? p.Activo ?? true,
    });
  };

  return (
    <div className="manage-container">
      <h2>Gestionar Productos</h2>
      {loading && <p>Cargando...</p>}

      {/* search moved into the right column */}

      <div className="manage-grid">
        <div className="manage-form">
          <h3>{editing ? "Editar producto" : "Nuevo producto"}</h3>

          <div className="form-row">
            <label>Nombre</label>
            <input
              className="form-input"
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
            />
          </div>

          <div className="form-row">
            <label>Precio compra</label>
            <input
              className="form-input"
              type="number"
              value={form.precioCompra}
              onChange={(e) => handleNumberChange("precioCompra", e.target.value)}
              onBlur={() => handleNumberBlur("precioCompra")}
              placeholder="0.00"
            />
          </div>

          <div className="form-row">
            <label>Precio venta</label>
            <input
              className="form-input"
              type="number"
              value={form.precioVenta}
              onChange={(e) => handleNumberChange("precioVenta", e.target.value)}
              onBlur={() => handleNumberBlur("precioVenta")}
              placeholder="0.00"
            />
          </div>

          <div className="form-row">
            <label>Precio mayorista</label>
            <input
              className="form-input"
              type="number"
              value={form.precioMayorista}
              onChange={(e) => handleNumberChange("precioMayorista", e.target.value)}
              onBlur={() => handleNumberBlur("precioMayorista")}
              placeholder="0.00"
            />
          </div>

          <div className="form-row">
            <label>Stock</label>
            <input
              className="form-input"
              type="number"
              value={form.stock}
              onChange={(e) => handleNumberChange("stock", e.target.value)}
              onBlur={() => handleNumberBlur("stock")}
              placeholder="0"
            />
          </div>

          <div className="form-row">
            <label>Stock mínimo</label>
            <input
              className="form-input"
              type="number"
              value={form.stockMinimo}
              onChange={(e) => handleNumberChange("stockMinimo", e.target.value)}
              onBlur={() => handleNumberBlur("stockMinimo")}
              placeholder="0"
            />
          </div>

          <div className="actions">
            {editing ? (
              <>
                <button className="btn-primary" onClick={handleUpdate}>
                  Guardar
                </button>
                <button style={{color:"black"}}
                  className="btn-secondary"
                  onClick={() => {
                    setEditing(null);
                    setForm(emptyProduct());
                  }}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={handleCreate}>
                Crear
              </button>
            )}
          </div>
        </div>

        <div className="manage-list">
          <h3>Lista</h3>
          <div style={{ marginBottom: 12 }}>
            <input
              className="search-input"
              placeholder="Buscar productos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="inventory-grid">
            {productos
              .filter((p) =>
                (p.nombre ?? p.Nombre ?? "")
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((p) => {
                const id = p.id ?? p.Id;
                const nombre = p.nombre ?? p.Nombre;
                const precioVenta = p.precioVenta ?? p.PrecioVenta;
                const precioMayorista = p.precioMayorista ?? p.PrecioMayorista;
                const precioCompra = p.precioCompra ?? p.PrecioCompra;
                const stock = p.stock ?? p.Stock;
                const stockMinimo = p.stockMinimo ?? p.StockMinimo;
                const activo = p.activo ?? p.Activo ?? true;
                return (
                  <div
                    key={id}
                    className={`inventory-card ${!activo ? "inactive" : ""}`}
                    style={{ marginBottom: 10 }}
                  >
                    <h3>{nombre}</h3>
                    <div>💲 Detal: ${precioVenta}</div>
                    <div>💲 Mayorista: ${precioMayorista}</div>
                    <div>💲 Compra: ${precioCompra}</div>
                    <div className={stock <= 5 ? "low-stock" : ""}>
                      📦 {stock}
                    </div>
                    <div>⚠️ Stock mínimo: {stockMinimo}</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                      <button style={{color:"black"}}
                        className="btn-secondary"
                        onClick={() => startEdit(p)}
                      >
                        Editar
                      </button>
                      {activo ? (
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(id)}
                        >
                          Eliminar
                        </button>
                      ) : (
                        <span style={{ color: "#999" }}>Eliminado</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
          {productos.length === 0 && (
            <p className="empty-msg">No hay productos aún.</p>
          )}
        </div>
      </div>
    </div>
  );
}
