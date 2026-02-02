import React, { useState, useEffect } from 'react';
import { 
  Plus, RefreshCw, Calculator, Edit2, Trash2, 
  AlertTriangle, Search, ChevronLeft, ChevronRight, X 
} from 'lucide-react';
import api from '../../services/api';
import { formatearMoneda, formatearNumero } from '../../utils/formatters';

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');

  // --- ESTADOS PARA BÚSQUEDA Y PAGINACIÓN ---
  const [filtro, setFiltro] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);

  // --- ESTADOS DE MODALES ---
  const [modalProducto, setModalProducto] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalStock, setModalStock] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [mostrarTasas, setMostrarTasas] = useState(false);

  // --- ESTADOS DE FORMULARIOS ---
  const [nuevoProducto, setNuevoProducto] = useState({
    codigo: '', nombre: '', descripcion: '', precio_venta: '', precio_compra: '',
    stock_actual: '', stock_minimo: '', categoria: '', moneda_base: 'USD', porcentaje_ganancia: ''
  });
  const [productoEditando, setProductoEditando] = useState({});
  const [ajusteStock, setAjusteStock] = useState({ cantidad: '', motivo: '' });
  const [tasasCambio, setTasasCambio] = useState({ usd_cop: 4000, bs_cop: 0.1, usd_bs: 40000 });
  const [nuevasTasas, setNuevasTasas] = useState({ usd_cop: '', bs_cop: '', usd_bs: '' });

  useEffect(() => {
    fetchProductos();
    fetchTasasCambio();
  }, []);

  const fetchProductos = async () => {
    try {
      const data = await api.getProductos();
      setProductos(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasasCambio = async () => {
    try {
      const data = await api.getTasasActual();
      setTasasCambio({
        usd_cop: parseFloat(data.usd_cop) || 4000,
        bs_cop: parseFloat(data.bs_cop) || 0.1,
        usd_bs: parseFloat(data.usd_bs) || 40000
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ==========================================
  // LÓGICA DE FILTRADO Y PAGINACIÓN
  // ==========================================
  
  // 1. Filtrar productos según el input de búsqueda (por nombre o código)
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
    p.codigo.toLowerCase().includes(filtro.toLowerCase())
  );

  // 2. Calcular índices para la página actual
  const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina);
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  
  // 3. Obtener solo los productos que se mostrarán en la tabla
  const productosPaginados = productosFiltrados.slice(indicePrimerItem, indiceUltimoItem);

  const cambiarPagina = (numero) => {
    if (numero >= 1 && numero <= totalPaginas) {
      setPaginaActual(numero);
    }
  };

  const handleSearch = (e) => {
    setFiltro(e.target.value);
    setPaginaActual(1); // Resetear a la página 1 al buscar
  };

  // ==========================================
  // HANDLERS DE API (Sincronización y CRUD)
  // ==========================================

  const sincronizarBCV = async () => {
    try {
      await api.sincronizarBCV();
      setMensaje('Tasa BCV sincronizada');
      fetchTasasCambio();
      fetchProductos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al sincronizar');
    }
  };

  const actualizarTasas = async (e) => {
    e.preventDefault();
    try {
      await api.updateTasas(nuevasTasas);
      setMostrarTasas(false);
      setMensaje('Tasas actualizadas');
      fetchTasasCambio();
      fetchProductos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al actualizar tasas');
    }
  };

  const crearProducto = async (e) => {
    e.preventDefault();
    try {
      await api.createProducto(nuevoProducto);
      setMensaje('Producto creado');
      setModalProducto(false);
      setNuevoProducto({
        codigo: '', nombre: '', descripcion: '', precio_venta: '', precio_compra: '',
        stock_actual: '', stock_minimo: '', categoria: '', moneda_base: 'USD', porcentaje_ganancia: ''
      });
      fetchProductos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al crear producto');
    }
  };

  const editarProducto = async (e) => {
    e.preventDefault();
    try {
      await api.updateProducto(productoEditando.id, productoEditando);
      setMensaje('Producto actualizado');
      setModalEditar(false);
      fetchProductos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al actualizar');
    }
  };

  const ajustarStockProducto = async (e) => {
    e.preventDefault();
    try {
      await api.updateStock(modalStock.id, ajusteStock);
      setMensaje('Stock actualizado');
      setModalStock(null);
      setAjusteStock({ cantidad: '', motivo: '' });
      fetchProductos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al actualizar stock');
    }
  };

  const eliminarProducto = async () => {
    try {
      await api.deleteProducto(modalEliminar.id);
      setMensaje('Producto eliminado');
      setModalEliminar(null);
      fetchProductos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al eliminar');
    }
  };

  const calcularPrecioConGanancia = (precio, porcentaje) => {
    if (!precio || !porcentaje) return '';
    return (parseFloat(precio) * (1 + parseFloat(porcentaje) / 100)).toFixed(2);
  };

  if (loading) {
    return <div className="d-flex justify-content-center p-5"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="container-fluid py-4">
      {/* Encabezado Principal */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Gestión de Inventario</h2>
          <span className="text-muted small">Total: {productosFiltrados.length} productos</span>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-info btn-sm" onClick={sincronizarBCV}>
            <RefreshCw size={16} className="me-1" /> Sync BCV
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => {
            setNuevasTasas(tasasCambio);
            setMostrarTasas(true);
          }}>
            <Calculator size={16} className="me-1" /> Tasas
          </button>
          <button className="btn btn-dark" onClick={() => setModalProducto(true)}>
            <Plus size={18} className="me-1" /> Nuevo Producto
          </button>
        </div>
      </div>

      {mensaje && (
        <div className={`alert ${mensaje.includes('Error') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`}>
          {mensaje}
          <button className="btn-close" onClick={() => setMensaje('')}></button>
        </div>
      )}

      {/* Barra de Tasas */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body py-2 bg-light rounded">
          <div className="row text-center align-items-center">
            <div className="col-md-4 border-end"><small className="text-muted">USD → COP:</small> <strong>{formatearNumero(tasasCambio.usd_cop, 0)}</strong></div>
            <div className="col-md-4 border-end"><small className="text-muted">USD → Bs:</small> <strong>{formatearNumero(tasasCambio.usd_bs, 0)}</strong></div>
            <div className="col-md-4"><small className="text-muted">Bs → COP:</small> <strong>{formatearNumero(tasasCambio.bs_cop, 4)}</strong></div>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA (FILTRO) */}
      <div className="row mb-3">
        <div className="col-md-6 col-lg-4">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <Search size={18} className="text-muted" />
            </span>
            <input 
              type="text" 
              className="form-control border-start-0 ps-0" 
              placeholder="Buscar por nombre o código..." 
              value={filtro}
              onChange={handleSearch}
            />
            {filtro && (
              <button className="btn btn-outline-secondary border-start-0" onClick={() => {setFiltro(''); setPaginaActual(1);}}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Código</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Moneda</th>
                  <th>Precio Venta</th>
                  <th>Stock</th>
                  <th className="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosPaginados.length > 0 ? (
                  productosPaginados.map((p) => (
                    <tr key={p.id}>
                      <td className="ps-4"><code>{p.codigo}</code></td>
                      <td>
                        <div className="fw-bold">{p.nombre}</div>
                        <div className="text-muted small">{p.descripcion?.substring(0, 40)}</div>
                      </td>
                      <td><span className="badge bg-light text-dark border">{p.categoria || 'Gral'}</span></td>
                      <td>
                        <span className={`badge ${p.moneda_base === 'USD' ? 'bg-success' : p.moneda_base === 'COP' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                          {p.moneda_base}
                        </span>
                      </td>
                      <td>{formatearMoneda(p.precio_venta, p.moneda_base)}</td>
                      <td>
                        <span className={`badge ${p.stock_actual <= p.stock_minimo ? 'bg-danger' : 'bg-success'}`}>
                          {p.stock_actual}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <div className="btn-group">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => {
                            setProductoEditando({...p, porcentaje_ganancia: ''});
                            setModalEditar(true);
                          }}><Edit2 size={14} /></button>
                          <button className="btn btn-sm btn-outline-info" onClick={() => setModalStock(p)}>Stock</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => setModalEliminar(p)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No se encontraron resultados para "{filtro}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* COMPONENTE DE PAGINACIÓN */}
        {totalPaginas > 1 && (
          <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
            <small className="text-muted">
              Mostrando {indicePrimerItem + 1} - {Math.min(indiceUltimoItem, productosFiltrados.length)} de {productosFiltrados.length}
            </small>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => cambiarPagina(paginaActual - 1)}>
                    <ChevronLeft size={14} />
                  </button>
                </li>
                {[...Array(totalPaginas)].map((_, i) => (
                  <li key={i} className={`page-item ${paginaActual === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => cambiarPagina(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => cambiarPagina(paginaActual + 1)}>
                    <ChevronRight size={14} />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* --- MODALES (Manteniendo la funcionalidad original) --- */}
      
      {/* Modal Nuevo Producto */}
      {modalProducto && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="mb-0">Nuevo Producto</h5>
                <button className="btn-close btn-close-white" onClick={() => setModalProducto(false)}></button>
              </div>
              <form onSubmit={crearProducto}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Código</label>
                      <input className="form-control" value={nuevoProducto.codigo} onChange={(e) => setNuevoProducto({...nuevoProducto, codigo: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Nombre</label>
                      <input className="form-control" value={nuevoProducto.nombre} onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Moneda Base</label>
                      <select className="form-select" value={nuevoProducto.moneda_base} onChange={(e) => setNuevoProducto({...nuevoProducto, moneda_base: e.target.value})}>
                        <option value="USD">USD</option>
                        <option value="COP">COP</option>
                        <option value="BS">BS</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Precio Compra</label>
                      <input type="number" step="0.01" className="form-control" value={nuevoProducto.precio_compra} onChange={(e) => setNuevoProducto({
                        ...nuevoProducto,
                        precio_compra: e.target.value,
                        precio_venta: nuevoProducto.porcentaje_ganancia ? calcularPrecioConGanancia(e.target.value, nuevoProducto.porcentaje_ganancia) : nuevoProducto.precio_venta
                      })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">% Ganancia</label>
                      <input type="number" step="0.01" className="form-control" value={nuevoProducto.porcentaje_ganancia} onChange={(e) => setNuevoProducto({
                        ...nuevoProducto,
                        porcentaje_ganancia: e.target.value,
                        precio_venta: calcularPrecioConGanancia(nuevoProducto.precio_compra, e.target.value)
                      })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalProducto(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-dark">Guardar Producto</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajuste Stock */}
      {modalStock && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="mb-0">Ajustar Stock: {modalStock.nombre}</h5>
                <button className="btn-close btn-close-white" onClick={() => setModalStock(null)}></button>
              </div>
              <form onSubmit={ajustarStockProducto}>
                <div className="modal-body p-4 text-center">
                  <p className="mb-1 text-muted">Stock actual</p>
                  <h2 className="mb-4">{modalStock.stock_actual}</h2>
                  <div className="text-start mb-3">
                    <label className="form-label fw-bold">Cantidad a sumar/restar</label>
                    <input type="number" className="form-control form-control-lg" value={ajusteStock.cantidad} onChange={(e) => setAjusteStock({...ajusteStock, cantidad: e.target.value})} required placeholder="Ej: 10 o -5" />
                  </div>
                  <div className="text-start">
                    <label className="form-label fw-bold">Motivo</label>
                    <select className="form-select" value={ajusteStock.motivo} onChange={(e) => setAjusteStock({...ajusteStock, motivo: e.target.value})} required>
                      <option value="">Seleccione...</option>
                      <option value="compra">Compra</option>
                      <option value="ajuste">Ajuste Manual</option>
                      <option value="perdida">Pérdida</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalStock(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-info text-white">Actualizar Stock</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body p-4 text-center">
                <AlertTriangle size={50} className="text-danger mb-3" />
                <h5>¿Eliminar {modalEliminar.nombre}?</h5>
                <p className="text-muted">Esta acción es irreversible.</p>
                <div className="d-flex justify-content-center gap-2 mt-4">
                  <button className="btn btn-light" onClick={() => setModalEliminar(null)}>Cancelar</button>
                  <button className="btn btn-danger" onClick={eliminarProducto}>Confirmar Eliminación</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tasas */}
      {mostrarTasas && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="mb-0">Ajuste de Tasas de Cambio</h5>
                <button className="btn-close" onClick={() => setMostrarTasas(false)}></button>
              </div>
              <form onSubmit={actualizarTasas}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold">USD a COP</label>
                    <input type="number" step="0.01" className="form-control" value={nuevasTasas.usd_cop} onChange={(e) => setNuevasTasas({...nuevasTasas, usd_cop: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">USD a BS</label>
                    <input type="number" step="0.01" className="form-control" value={nuevasTasas.usd_bs} onChange={(e) => setNuevasTasas({...nuevasTasas, usd_bs: e.target.value})} />
                  </div>
                  <div className="mb-0">
                    <label className="form-label fw-bold">BS a COP</label>
                    <input type="number" step="0.0001" className="form-control" value={nuevasTasas.bs_cop} onChange={(e) => setNuevasTasas({...nuevasTasas, bs_cop: e.target.value})} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setMostrarTasas(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;