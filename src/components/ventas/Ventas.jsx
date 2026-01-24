import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronDown, RefreshCw, Calculator } from 'lucide-react';
import api from '../../services/api';
import { formatearMoneda, formatearNumero, formatearNumeroParaMostrar, obtenerPrecioEnMoneda } from '../../utils/formatters';

const Ventas = () => {
  const [ventaActual, setVentaActual] = useState({
    productos: [],
    observaciones: '',
    moneda: 'COP',
    tipo_pago: 'efectivo',
    monto_recibido: 0,
    cambio: 0,
  });
  const [productos, setProductos] = useState([]);
  const [filtroProducto, setFiltroProducto] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tasasCambio, setTasasCambio] = useState({ usd_cop: 4000, bs_cop: 0.1, usd_bs: 40000 });
  const [mostrarCalculadoraCambio, setMostrarCalculadoraCambio] = useState(false);

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
    }
  };

  const fetchTasasCambio = async () => {
    try {
      const data = await api.getTasasActual();
      setTasasCambio({
        usd_cop: parseFloat(data.usd_cop) || 4000,
        bs_cop: parseFloat(data.bs_cop) || 0.1,
        usd_bs: parseFloat(data.usd_bs) || 40000,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sincronizarBCV = async () => {
    try {
      const data = await api.sincronizarBCV();
      setTasasCambio({
        usd_cop: parseFloat(data.usd_cop) || 4000,
        bs_cop: parseFloat(data.bs_cop) || 0.1,
        usd_bs: parseFloat(data.usd_bs) || 40000,
      });
      setMensaje('Tasa BCV sincronizada exitosamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al sincronizar tasa BCV');
    }
  };

  const productosFiltrados = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(filtroProducto.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(filtroProducto.toLowerCase())
  );

  const seleccionarProductoDelDropdown = (producto) => {
    setProductoSeleccionado(producto);
    setFiltroProducto(producto.nombre);
    setMostrarDropdown(false);
    setMensaje('');
  };

  const buscarProductoPorCodigo = async () => {
    if (!codigoBusqueda.trim()) return;
    try {
      const producto = await api.getProductoByCodigo(codigoBusqueda);
      setProductoSeleccionado(producto);
      setMensaje('');
    } catch (error) {
      setMensaje('Producto no encontrado');
      setProductoSeleccionado(null);
    }
  };

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) return;

    if (productoSeleccionado.stock_actual < cantidad) {
      setMensaje('Stock insuficiente');
      return;
    }

    const precioEnMoneda = obtenerPrecioEnMoneda(productoSeleccionado, ventaActual.moneda);
    const productoExistente = ventaActual.productos.find(p => p.producto_id === productoSeleccionado.id);

    if (productoExistente) {
      const nuevaCantidad = productoExistente.cantidad + cantidad;
      if (productoSeleccionado.stock_actual < nuevaCantidad) {
        setMensaje('Stock insuficiente para esta cantidad');
        return;
      }

      setVentaActual({
        ...ventaActual,
        productos: ventaActual.productos.map(p =>
          p.producto_id === productoSeleccionado.id
            ? { ...p, cantidad: nuevaCantidad, subtotal: nuevaCantidad * p.precio_unitario }
            : p
        ),
      });
    } else {
      setVentaActual({
        ...ventaActual,
        productos: [
          ...ventaActual.productos,
          {
            producto_id: productoSeleccionado.id,
            codigo: productoSeleccionado.codigo,
            nombre: productoSeleccionado.nombre,
            descripcion: productoSeleccionado.descripcion,
            cantidad: cantidad,
            precio_unitario: precioEnMoneda,
            subtotal: cantidad * precioEnMoneda,
          },
        ],
      });
    }

    setCodigoBusqueda('');
    setFiltroProducto('');
    setCantidad(1);
    setProductoSeleccionado(null);
    setMensaje('Producto agregado');
    setTimeout(() => setMensaje(''), 2000);
  };

  const eliminarProducto = (index) => {
    setVentaActual({
      ...ventaActual,
      productos: ventaActual.productos.filter((_, i) => i !== index),
    });
  };

  const calcularTotal = () => {
    return ventaActual.productos.reduce((total, producto) => total + producto.subtotal, 0);
  };

  const procesarVenta = async () => {
    if (ventaActual.productos.length === 0) {
      setMensaje('Agregue productos a la venta');
      return;
    }

    if (ventaActual.tipo_pago === 'efectivo' && parseFloat(ventaActual.monto_recibido) < calcularTotal()) {
      setMensaje('El monto recibido debe ser mayor o igual al total');
      return;
    }

    setLoading(true);
    try {
      await api.createVenta(ventaActual);
      setVentaActual({
        productos: [],
        observaciones: '',
        moneda: 'COP',
        tipo_pago: 'efectivo',
        monto_recibido: 0,
        cambio: 0,
      });
      setMensaje('Venta procesada exitosamente');
      fetchProductos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('Error al procesar la venta');
    } finally {
      setLoading(false);
      setMostrarConfirmacion(false);
    }
  };

  const cambiarMoneda = (nuevaMoneda) => {
    const productosActualizados = ventaActual.productos.map(prod => {
      const productoOriginal = productos.find(p => p.id === prod.producto_id);
      if (productoOriginal) {
        const nuevoPrecio = obtenerPrecioEnMoneda(productoOriginal, nuevaMoneda);
        return {
          ...prod,
          precio_unitario: nuevoPrecio,
          subtotal: prod.cantidad * nuevoPrecio,
        };
      }
      return prod;
    });

    setVentaActual({
      ...ventaActual,
      moneda: nuevaMoneda,
      productos: productosActualizados,
      monto_recibido: 0,
      cambio: 0,
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Nueva Venta</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-info btn-sm" onClick={sincronizarBCV}>
            <RefreshCw size={16} className="me-1" />
            Sync BCV
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setMostrarCalculadoraCambio(true)}>
            <Calculator size={16} className="me-1" />
            Tasas
          </button>
        </div>
      </div>

      {mensaje && (
        <div className={`alert ${mensaje.includes('Error') || mensaje.includes('insuficiente') ? 'alert-danger' : 'alert-success'} alert-dismissible`}>
          {mensaje}
          <button type="button" className="btn-close" onClick={() => setMensaje('')}></button>
        </div>
      )}

      <div className="row">
        <div className="col-md-8">
          {/* Configuración de venta */}
          <div className="card mb-3">
            <div className="card-header">
              <h6>Configuración de Venta</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Moneda</label>
                  <select className="form-select" value={ventaActual.moneda} onChange={(e) => cambiarMoneda(e.target.value)}>
                    <option value="COP">Peso Colombiano (COP)</option>
                    <option value="USD">Dólar Americano (USD)</option>
                    <option value="BS">Bolívar Venezolano (Bs.)</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Tipo de Pago</label>
                  <select className="form-select" value={ventaActual.tipo_pago} onChange={(e) => setVentaActual({ ...ventaActual, tipo_pago: e.target.value })}>
                    <option value="efectivo">Efectivo</option>
                    <option value="punto">Punto de Venta</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Tasa USD → COP</label>
                  <input type="text" className="form-control" value={formatearNumeroParaMostrar(tasasCambio.usd_cop, 0)} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Búsqueda de productos */}
          <div className="card">
            <div className="card-header">
              <h5>Buscar Producto</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Código del Producto</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={codigoBusqueda}
                      onChange={(e) => setCodigoBusqueda(e.target.value)}
                      placeholder="Ingrese código"
                      onKeyPress={(e) => e.key === 'Enter' && buscarProductoPorCodigo()}
                    />
                    <button className="btn btn-outline-secondary" onClick={buscarProductoPorCodigo}>
                      <Search size={16} />
                    </button>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Buscar por Nombre</label>
                  <div className="position-relative">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={filtroProducto}
                        onChange={(e) => {
                          setFiltroProducto(e.target.value);
                          setMostrarDropdown(true);
                        }}
                        onFocus={() => setMostrarDropdown(true)}
                        placeholder="Buscar producto..."
                      />
                      <button className="btn btn-outline-secondary" onClick={() => setMostrarDropdown(!mostrarDropdown)}>
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    {mostrarDropdown && productosFiltrados.length > 0 && (
                      <div className="position-absolute w-100 bg-white border rounded shadow-lg" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                        {productosFiltrados.slice(0, 10).map((producto) => (
                          <div
                            key={producto.id}
                            className="p-2 border-bottom"
                            style={{ cursor: 'pointer' }}
                            onClick={() => seleccionarProductoDelDropdown(producto)}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                          >
                            <div className="d-flex justify-content-between">
                              <div>
                                <strong>{producto.nombre}</strong>
                                <br />
                                <small className="text-muted">Código: {producto.codigo}</small>
                              </div>
                              <div className="text-end">
                                <div className="text-success">
                                  {formatearMoneda(obtenerPrecioEnMoneda(producto, ventaActual.moneda), ventaActual.moneda)}
                                </div>
                                <small className="text-muted">Stock: {producto.stock_actual}</small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Cantidad</label>
                  <input type="number" className="form-control" value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value) || 1)} min="1" />
                </div>

                <div className="col-md-3">
                  <label className="form-label">&nbsp;</label>
                  <button className="btn btn-dark d-block w-100" onClick={agregarProducto} disabled={!productoSeleccionado}>
                    <Plus size={16} className="me-1" />
                    Agregar
                  </button>
                </div>
              </div>

              {productoSeleccionado && (
                <div className="mt-3 p-3 bg-light rounded">
                  <h6>{productoSeleccionado.nombre}</h6>
                  <div className="row">
                    <div className="col-md-4">
                      <p className="mb-1">
                        Precio COP: <strong>{formatearMoneda(productoSeleccionado.precio_venta_cop_calculado, 'COP')}</strong>
                      </p>
                    </div>
                    <div className="col-md-4">
                      <p className="mb-1">
                        Precio USD: <strong>{formatearMoneda(productoSeleccionado.precio_venta_usd_calculado, 'USD')}</strong>
                      </p>
                    </div>
                    <div className="col-md-4">
                      <p className="mb-1">
                        Precio Bs: <strong>{formatearMoneda(productoSeleccionado.precio_venta_bs_calculado, 'BS')}</strong>
                      </p>
                    </div>
                  </div>
                  <p className="mb-0">
                    Stock disponible: <strong>{productoSeleccionado.stock_actual}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Productos en la venta */}
          <div className="card mt-4">
            <div className="card-header">
              <h5>Productos en la Venta</h5>
            </div>
            <div className="card-body">
              {ventaActual.productos.length === 0 ? (
                <p className="text-muted text-center py-4">No hay productos agregados</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventaActual.productos.map((producto, index) => (
                        <tr key={index}>
                          <td><code>{producto.codigo}</code></td>
                          <td>{producto.nombre}</td>
                          <td>{producto.cantidad}</td>
                          <td>{formatearMoneda(producto.precio_unitario, ventaActual.moneda)}</td>
                          <td><strong>{formatearMoneda(producto.subtotal, ventaActual.moneda)}</strong></td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarProducto(index)}>×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar derecho */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Resumen de Venta</h5>
            </div>
            <div className="card-body">
              <h3 className="text-success mb-3">Total: {formatearMoneda(calcularTotal(), ventaActual.moneda)}</h3>

              {ventaActual.tipo_pago === 'efectivo' && (
                <div className="mb-3">
                  <label className="form-label">Monto Recibido</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      value={ventaActual.monto_recibido || ''}
                      onChange={(e) => {
                        const monto = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                        setVentaActual({
                          ...ventaActual,
                          monto_recibido: monto,
                          cambio: Math.max(0, monto - calcularTotal()),
                        });
                      }}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <span className="input-group-text">
                      {ventaActual.moneda === 'COP' ? '$COP' : ventaActual.moneda === 'USD' ? '$USD' : 'Bs.'}
                    </span>
                  </div>

                  {ventaActual.monto_recibido > 0 && (
                    <div className="mt-2">
                      <div className={`alert ${ventaActual.cambio >= 0 ? 'alert-info' : 'alert-warning'} py-2`}>
                        <strong>Cambio: {formatearMoneda(ventaActual.cambio, ventaActual.moneda)}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Observaciones</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={ventaActual.observaciones}
                  onChange={(e) => setVentaActual({ ...ventaActual, observaciones: e.target.value })}
                  placeholder="Observaciones opcionales"
                />
              </div>

              <button
                className="btn btn-success w-100"
                onClick={() => setMostrarConfirmacion(true)}
                disabled={loading || ventaActual.productos.length === 0}
              >
                {loading ? 'Procesando...' : 'Procesar Venta'}
              </button>
            </div>
          </div>

          {/* Tasas de cambio */}
          <div className="card mt-3">
            <div className="card-header">
              <h6>Tasas de Cambio Actuales</h6>
            </div>
            <div className="card-body p-2">
              <small className="d-block">1 USD = {formatearNumeroParaMostrar(tasasCambio.usd_cop, 0)} COP</small>
              <small className="d-block">1 USD = {formatearNumeroParaMostrar(tasasCambio.usd_bs, 0)} Bs.</small>
              <small className="d-block">1 Bs. = {formatearNumero(tasasCambio.bs_cop, 4)} COP</small>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {mostrarConfirmacion && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">Confirmar Venta</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarConfirmacion(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Total:</strong> {formatearMoneda(calcularTotal(), ventaActual.moneda)}
                  </div>
                  <div className="col-md-6">
                    <strong>Moneda:</strong> {ventaActual.moneda}
                  </div>
                </div>
                <p>
                  <strong>Atención:</strong> Esta venta será procesada permanentemente y no podrás eliminarla después de confirmarla.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setMostrarConfirmacion(false)}>Cancelar</button>
                <button className="btn btn-success" onClick={procesarVenta}>Confirmar y Procesar Venta</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal calculadora */}
      {mostrarCalculadoraCambio && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Calculadora de Tasas</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarCalculadoraCambio(false)}></button>
              </div>
              <div className="modal-body">
                <h6>Tasas Actuales</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td>1 USD</td>
                      <td>=</td>
                      <td>{formatearNumeroParaMostrar(tasasCambio.usd_cop, 0)} COP</td>
                    </tr>
                    <tr>
                      <td>1 USD</td>
                      <td>=</td>
                      <td>{formatearNumeroParaMostrar(tasasCambio.usd_bs, 0)} Bs.</td>
                    </tr>
                    <tr>
                      <td>1 Bs.</td>
                      <td>=</td>
                      <td>{formatearNumero(tasasCambio.bs_cop, 4)} COP</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setMostrarCalculadoraCambio(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ventas;