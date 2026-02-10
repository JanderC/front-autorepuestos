import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Calculator, Edit2, Trash2, AlertTriangle, Search } from 'lucide-react';
import api from '../../services/api';
import { formatearMoneda, formatearNumero } from '../../utils/formatters';

const ITEMS_POR_PAGINA = 10;

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [modalProducto, setModalProducto] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    codigo: '', nombre: '', descripcion: '', precio_venta: '', precio_compra: '',
    stock_actual: '', stock_minimo: '', categoria: '', marca: '', moneda_base: 'USD', porcentaje_ganancia: ''
  });
  const [productoEditando, setProductoEditando] = useState({});
  const [modalStock, setModalStock] = useState(null);
  const [ajusteStock, setAjusteStock] = useState({ cantidad: '', motivo: '' });
  const [modalEliminar, setModalEliminar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [tasasCambio, setTasasCambio] = useState({ usd_cop: 4000, bs_cop: 0.1, usd_bs: 40000 });
  const [mostrarTasas, setMostrarTasas] = useState(false);
  const [nuevasTasas, setNuevasTasas] = useState({ usd_cop: '', bs_cop: '', usd_bs: '' });

  // Búsqueda, filtro de marca y paginación
  const [busqueda, setBusqueda] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    fetchProductos();
    fetchTasasCambio();
  }, []);

  // Resetear a página 1 cuando cambia búsqueda o filtro de marca
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroMarca]);

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
        stock_actual: '', stock_minimo: '', categoria: '', marca: '', moneda_base: 'USD', porcentaje_ganancia: ''
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

  // Lista de marcas únicas para el select de filtro
  const marcasUnicas = [...new Set(
    productos.map((p) => p.marca).filter(Boolean)
  )].sort();

  // Filtrado por búsqueda y marca
  const productosFiltrados = productos.filter((p) => {
    const termino = busqueda.toLowerCase().trim();
    const coincideBusqueda = !termino || (
      p.codigo?.toLowerCase().includes(termino) ||
      p.nombre?.toLowerCase().includes(termino) ||
      p.categoria?.toLowerCase().includes(termino)
    );
    const coincideMarca = !filtroMarca || p.marca === filtroMarca;
    return coincideBusqueda && coincideMarca;
  });

  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA);
  const indiceInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const indiceFin = indiceInicio + ITEMS_POR_PAGINA;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceFin);

  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  const getPaginas = () => {
    const paginas = [];
    const rango = 2;
    for (let i = Math.max(1, paginaActual - rango); i <= Math.min(totalPaginas, paginaActual + rango); i++) {
      paginas.push(i);
    }
    return paginas;
  };

  if (loading) {
    return <div className="d-flex justify-content-center p-5"><div className="spinner-border"></div></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Inventario</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-info btn-sm" onClick={sincronizarBCV}>
            <RefreshCw size={16} /> Sync BCV
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => {
            setNuevasTasas(tasasCambio);
            setMostrarTasas(true);
          }}>
            <Calculator size={16} /> Tasas
          </button>
          <button className="btn btn-dark" onClick={() => setModalProducto(true)}>
            <Plus size={16} /> Nuevo Producto
          </button>
        </div>
      </div>

      {mensaje && (
        <div className={`alert ${mensaje.includes('Error') ? 'alert-danger' : 'alert-success'} alert-dismissible`}>
          {mensaje}
          <button className="btn-close" onClick={() => setMensaje('')}></button>
        </div>
      )}

      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="row text-center">
            <div className="col-md-4"><small>USD → COP:</small> <strong>{formatearNumero(tasasCambio.usd_cop, 0)}</strong></div>
            <div className="col-md-4"><small>USD → Bs:</small> <strong>{formatearNumero(tasasCambio.usd_bs, 0)}</strong></div>
            <div className="col-md-4"><small>Bs → COP:</small> <strong>{formatearNumero(tasasCambio.bs_cop, 4)}</strong></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">

          {/* Barra de búsqueda y filtro de marca */}
          <div className="row mb-3 g-2">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por código, nombre o categoría..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                {busqueda && (
                  <button className="btn btn-outline-secondary" onClick={() => setBusqueda('')}>
                    &times;
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filtroMarca}
                onChange={(e) => setFiltroMarca(e.target.value)}
              >
                <option value="">Todas las marcas</option>
                {marcasUnicas.map((marca) => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-center justify-content-end">
              <small className="text-muted">
                {productosFiltrados.length === productos.length
                  ? `${productos.length} productos`
                  : `${productosFiltrados.length} de ${productos.length} productos`}
              </small>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Marca</th>
                  <th>Categoría</th>
                  <th>Moneda</th>
                  <th>Precio Base</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosPaginados.length > 0 ? (
                  productosPaginados.map((p) => (
                    <tr key={p.id}>
                      <td><code>{p.codigo}</code></td>
                      <td>{p.nombre}</td>
                      <td>{p.marca || <span className="text-muted">—</span>}</td>
                      <td>{p.categoria}</td>
                      <td>
                        <span className={`badge ${p.moneda_base === 'USD' ? 'bg-success' : p.moneda_base === 'COP' ? 'bg-primary' : 'bg-warning'}`}>
                          {p.moneda_base}
                        </span>
                      </td>
                      <td>{formatearMoneda(p.precio_venta, p.moneda_base)}</td>
                      <td>
                        <span className={`badge ${p.stock_actual <= p.stock_minimo ? 'bg-warning' : 'bg-success'}`}>
                          {p.stock_actual}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button className="btn btn-sm btn-outline-success" onClick={() => {
                            setProductoEditando({...p, porcentaje_ganancia: ''});
                            setModalEditar(true);
                          }}><Edit2 size={14} /></button>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => setModalStock(p)}>Stock</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => setModalEliminar(p)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No se encontraron productos{busqueda ? ` para "${busqueda}"` : ''}{filtroMarca ? ` de la marca "${filtroMarca}"` : ''}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                Mostrando {indiceInicio + 1}–{Math.min(indiceFin, productosFiltrados.length)} de {productosFiltrados.length} productos
              </small>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => irAPagina(paginaActual - 1)}>&laquo;</button>
                  </li>
                  {paginaActual > 3 && (
                    <>
                      <li className="page-item">
                        <button className="page-link" onClick={() => irAPagina(1)}>1</button>
                      </li>
                      <li className="page-item disabled"><span className="page-link">…</span></li>
                    </>
                  )}
                  {getPaginas().map((num) => (
                    <li key={num} className={`page-item ${paginaActual === num ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => irAPagina(num)}>{num}</button>
                    </li>
                  ))}
                  {paginaActual < totalPaginas - 2 && (
                    <>
                      <li className="page-item disabled"><span className="page-link">…</span></li>
                      <li className="page-item">
                        <button className="page-link" onClick={() => irAPagina(totalPaginas)}>{totalPaginas}</button>
                      </li>
                    </>
                  )}
                  <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => irAPagina(paginaActual + 1)}>&raquo;</button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

        </div>
      </div>

      {/* Modal Nuevo Producto */}
      {modalProducto && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Nuevo Producto</h5>
                <button className="btn-close" onClick={() => setModalProducto(false)}></button>
              </div>
              <form onSubmit={crearProducto}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label>Código</label>
                      <input className="form-control" value={nuevoProducto.codigo} onChange={(e) => setNuevoProducto({...nuevoProducto, codigo: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Nombre</label>
                      <input className="form-control" value={nuevoProducto.nombre} onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required />
                    </div>
                    <div className="col-12">
                      <label>Descripción</label>
                      <textarea className="form-control" rows="2" value={nuevoProducto.descripcion} onChange={(e) => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label>Marca</label>
                      <input className="form-control" value={nuevoProducto.marca} onChange={(e) => setNuevoProducto({...nuevoProducto, marca: e.target.value})} placeholder="Opcional" />
                    </div>
                    <div className="col-md-6">
                      <label>Categoría</label>
                      <input className="form-control" value={nuevoProducto.categoria} onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label>Moneda Base</label>
                      <select className="form-select" value={nuevoProducto.moneda_base} onChange={(e) => setNuevoProducto({...nuevoProducto, moneda_base: e.target.value})}>
                        <option value="USD">Dólar (USD)</option>
                        <option value="COP">Peso (COP)</option>
                        <option value="BS">Bolívar (Bs)</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label>Precio Compra</label>
                      <input type="number" step="0.01" className="form-control" value={nuevoProducto.precio_compra} onChange={(e) => setNuevoProducto({
                        ...nuevoProducto,
                        precio_compra: e.target.value,
                        precio_venta: nuevoProducto.porcentaje_ganancia ? calcularPrecioConGanancia(e.target.value, nuevoProducto.porcentaje_ganancia) : nuevoProducto.precio_venta
                      })} />
                    </div>
                    <div className="col-md-4">
                      <label>% Ganancia</label>
                      <input type="number" step="0.01" className="form-control" value={nuevoProducto.porcentaje_ganancia} onChange={(e) => setNuevoProducto({
                        ...nuevoProducto,
                        porcentaje_ganancia: e.target.value,
                        precio_venta: calcularPrecioConGanancia(nuevoProducto.precio_compra, e.target.value)
                      })} />
                    </div>
                    <div className="col-md-4">
                      <label>Precio Venta</label>
                      <input type="number" step="0.01" className="form-control" value={nuevoProducto.precio_venta} onChange={(e) => setNuevoProducto({...nuevoProducto, precio_venta: e.target.value})} required readOnly={nuevoProducto.porcentaje_ganancia && nuevoProducto.precio_compra} />
                    </div>
                    <div className="col-md-4">
                      <label>Stock Inicial</label>
                      <input type="number" className="form-control" value={nuevoProducto.stock_actual} onChange={(e) => setNuevoProducto({...nuevoProducto, stock_actual: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label>Stock Mínimo</label>
                      <input type="number" className="form-control" value={nuevoProducto.stock_minimo} onChange={(e) => setNuevoProducto({...nuevoProducto, stock_minimo: e.target.value})} required />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalProducto(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-dark">Crear</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {modalEditar && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Editar Producto</h5>
                <button className="btn-close" onClick={() => setModalEditar(false)}></button>
              </div>
              <form onSubmit={editarProducto}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label>Código</label>
                      <input className="form-control" value={productoEditando.codigo} onChange={(e) => setProductoEditando({...productoEditando, codigo: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Nombre</label>
                      <input className="form-control" value={productoEditando.nombre} onChange={(e) => setProductoEditando({...productoEditando, nombre: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Marca</label>
                      <input className="form-control" value={productoEditando.marca || ''} onChange={(e) => setProductoEditando({...productoEditando, marca: e.target.value})} placeholder="Opcional" />
                    </div>
                    <div className="col-md-6">
                      <label>Categoría</label>
                      <input className="form-control" value={productoEditando.categoria || ''} onChange={(e) => setProductoEditando({...productoEditando, categoria: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label>Precio Compra</label>
                      <input type="number" step="0.01" className="form-control" value={productoEditando.precio_compra || ''} onChange={(e) => setProductoEditando({...productoEditando, precio_compra: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label>Precio Venta</label>
                      <input type="number" step="0.01" className="form-control" value={productoEditando.precio_venta} onChange={(e) => setProductoEditando({...productoEditando, precio_venta: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label>Moneda Base</label>
                      <select className="form-select" value={productoEditando.moneda_base || 'USD'} onChange={(e) => setProductoEditando({...productoEditando, moneda_base: e.target.value})}>
                        <option value="USD">Dólar (USD)</option>
                        <option value="COP">Peso (COP)</option>
                        <option value="BS">Bolívar (Bs)</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label>Stock Actual</label>
                      <input type="number" className="form-control" value={productoEditando.stock_actual} onChange={(e) => setProductoEditando({...productoEditando, stock_actual: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Stock Mínimo</label>
                      <input type="number" className="form-control" value={productoEditando.stock_minimo} onChange={(e) => setProductoEditando({...productoEditando, stock_minimo: e.target.value})} required />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalEditar(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-success">Actualizar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajustar Stock */}
      {modalStock && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Ajustar Stock - {modalStock.nombre}</h5>
                <button className="btn-close" onClick={() => setModalStock(null)}></button>
              </div>
              <form onSubmit={ajustarStockProducto}>
                <div className="modal-body">
                  <p><strong>Stock actual:</strong> {modalStock.stock_actual}</p>
                  <div className="mb-3">
                    <label>Cantidad a ajustar</label>
                    <input type="number" className="form-control" value={ajusteStock.cantidad} onChange={(e) => setAjusteStock({...ajusteStock, cantidad: e.target.value})} required />
                    <small>Nuevo stock: {modalStock.stock_actual + (parseInt(ajusteStock.cantidad) || 0)}</small>
                  </div>
                  <div className="mb-3">
                    <label>Motivo</label>
                    <select className="form-control" value={ajusteStock.motivo} onChange={(e) => setAjusteStock({...ajusteStock, motivo: e.target.value})} required>
                      <option value="">Seleccione</option>
                      <option value="compra">Compra</option>
                      <option value="devolucion">Devolución</option>
                      <option value="ajuste">Ajuste</option>
                      <option value="perdida">Pérdida</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalStock(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Ajustar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Confirmar Eliminación</h5>
                <button className="btn-close" onClick={() => setModalEliminar(null)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center mb-3">
                  <AlertTriangle size={48} className="text-warning me-3" />
                  <div>
                    <p>¿Eliminar este producto?</p>
                    <strong>{modalEliminar.nombre}</strong>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalEliminar(null)}>Cancelar</button>
                <button className="btn btn-danger" onClick={eliminarProducto}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tasas */}
      {mostrarTasas && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Gestión de Tasas</h5>
                <button className="btn-close" onClick={() => setMostrarTasas(false)}></button>
              </div>
              <form onSubmit={actualizarTasas}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label>USD → COP</label>
                      <input type="number" step="0.01" className="form-control" value={nuevasTasas.usd_cop} onChange={(e) => setNuevasTasas({...nuevasTasas, usd_cop: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label>USD → Bs</label>
                      <input type="number" step="0.01" className="form-control" value={nuevasTasas.usd_bs} onChange={(e) => setNuevasTasas({...nuevasTasas, usd_bs: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label>Bs → COP</label>
                      <input type="number" step="0.01" className="form-control" value={nuevasTasas.bs_cop} onChange={(e) => setNuevasTasas({...nuevasTasas, bs_cop: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setMostrarTasas(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Actualizar</button>
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