import { useState, useEffect, useCallback } from "react";
import "./index.css";

const API = "http://localhost:5000";

const CATEGORIAS = ["", "collar", "aros", "anillo", "pulsera"];
const METALES = ["", "oro", "plata", "platino"];
const ORDER_BY_OPTIONS = [
  { value: "stock", label: "Stock" },
  { value: "precio", label: "Precio" },
  { value: "nombre", label: "Nombre" },
];

const getStockClass = (stock) =>
  stock > 5 ? "verde" : stock > 0 ? "naranja" : "rojo";

export default function App() {
  const [joyas, setJoyas] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("catalogo");

  const [limit, setLimit] = useState(3);
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState("stock");
  const [order, setOrder] = useState("ASC");

  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [categoria, setCategoria] = useState("");
  const [metal, setMetal] = useState("");

  const fetchCatalogo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit, page, orderBy, order });
      const res = await fetch(`${API}/joyas?${params}`);
      const data = await res.json();
      setJoyas(data.results || []);
      setMeta({ total_pages: data.total_pages, page: data.page });
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [limit, page, orderBy, order]);

  const fetchFiltros = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (precioMin) params.append("precio_min", precioMin);
      if (precioMax) params.append("precio_max", precioMax);
      if (categoria) params.append("tipo_categoria", categoria);
      if (metal) params.append("tipo_metal", metal);
      const res = await fetch(`${API}/joyas/filtros?${params}`);
      const data = await res.json();
      setJoyas(Array.isArray(data) ? data : []);
      setMeta({});
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [precioMin, precioMax, categoria, metal]);

  useEffect(() => {
    if (mode === "catalogo") fetchCatalogo();
  }, [mode, fetchCatalogo]);

  const handleFiltrar = (e) => {
    e.preventDefault();
    fetchFiltros();
  };

  const formatPrecio = (n) => `$${Number(n).toLocaleString("es-CL")}`;

  return (
    <div className="root">
      <header className="header">
        <div className="header-inner">
          <div>
            <div className="eyebrow">MY PRECIOUS SPA</div>
            <h1 className="logo">✦ Colección</h1>
          </div>
          <nav className="nav">
            <button
              className={`nav-btn ${mode === "catalogo" ? "active" : ""}`}
              onClick={() => { setMode("catalogo"); setPage(1); }}
            >
              Catálogo
            </button>
            <button
              className={`nav-btn ${mode === "filtros" ? "active" : ""}`}
              onClick={() => setMode("filtros")}
            >
              Filtros
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        <aside className="aside">
          {mode === "catalogo" ? (
            <div className="panel">
              <div className="panel-title">ORDENAR & PAGINAR</div>

              <label className="label">Ordenar por</label>
              <select className="select" value={orderBy} onChange={e => { setOrderBy(e.target.value); setPage(1); }}>
                {ORDER_BY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              <label className="label">Dirección</label>
              <div className="toggle">
                {["ASC", "DESC"].map(d => (
                  <button
                    key={d}
                    className={`toggle-btn ${order === d ? "active" : ""}`}
                    onClick={() => { setOrder(d); setPage(1); }}
                  >
                    {d === "ASC" ? "↑ Ascendente" : "↓ Descendente"}
                  </button>
                ))}
              </div>

              <label className="label">Por página</label>
              <div className="toggle">
                {[2, 3, 6].map(n => (
                  <button
                    key={n}
                    className={`toggle-btn ${limit === n ? "active" : ""}`}
                    onClick={() => { setLimit(n); setPage(1); }}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {meta.total_pages > 0 && (
                <>
                  <label className="label">Página</label>
                  <div className="pagination">
                    <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>←</button>
                    <span className="page-info">{page} / {meta.total_pages}</span>
                    <button className="page-btn" disabled={page >= meta.total_pages} onClick={() => setPage(p => p + 1)}>→</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="panel">
              <div className="panel-title">FILTRAR JOYAS</div>
              <form onSubmit={handleFiltrar}>
                <label className="label">Precio mínimo</label>
                <input className="input" type="number" placeholder="Ej: 10000" value={precioMin} onChange={e => setPrecioMin(e.target.value)} />

                <label className="label">Precio máximo</label>
                <input className="input" type="number" placeholder="Ej: 40000" value={precioMax} onChange={e => setPrecioMax(e.target.value)} />

                <label className="label">Categoría</label>
                <select className="select" value={categoria} onChange={e => setCategoria(e.target.value)}>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c || "Todas"}</option>)}
                </select>

                <label className="label">Metal</label>
                <select className="select" value={metal} onChange={e => setMetal(e.target.value)}>
                  {METALES.map(m => <option key={m} value={m}>{m || "Todos"}</option>)}
                </select>

                <button type="submit" className="btn-primary">Buscar joyas</button>
              </form>
            </div>
          )}
        </aside>

        <section className="section">
          {error && <div className="error">{error}</div>}
          {loading ? (
            <div className="loading-wrap">
              <div className="loading-text">Cargando joyas...</div>
            </div>
          ) : joyas.length === 0 ? (
            <div className="empty">No se encontraron joyas con esos criterios.</div>
          ) : (
            <div className="grid">
              {joyas.map((joya) => (
                <div key={joya.id} className="card">
                  <div className="card-top">
                    <span className={`badge ${joya.metal}`}>
                      {joya.metal?.toUpperCase()}
                    </span>
                    <span className="categoria">{joya.categoria}</span>
                  </div>
                  <div className="card-gem">✦</div>
                  <h3 className="card-name">{joya.nombre}</h3>
                  <div className="card-price">{formatPrecio(joya.precio)}</div>
                  <div className="card-stock">
                    <span className={`stock-dot ${getStockClass(joya.stock)}`}></span>
                    {joya.stock} en stock
                  </div>
                  {joya.href && <div className="card-href">{joya.href}</div>}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
