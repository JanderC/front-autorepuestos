import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import api from '../../services/api';
import { formatearMoneda, formatearNumero } from '../../utils/formatters';

const Reportes = () => {
  const [ventas, setVentas] = useState([]);
  const [reporte, setReporte] = useState(null);
  const [tasas, setTasas] = useState({ usd_cop: 4000, bs_cop: 0.1, usd_bs: 40000 });
  const [fechas, setFechas] = useState({
    inicio: new Date().toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarTasas();
  }, []);

  const cargarTasas = async () => {
    try {
      const tasasData = await api.getTasasActual();
      setTasas({
        usd_cop: parseFloat(tasasData.usd_cop) || 4000,
        bs_cop: parseFloat(tasasData.bs_cop) || 0.1,
        usd_bs: parseFloat(tasasData.usd_bs) || 40000
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generarReporte = async () => {
    setLoading(true);
    try {
      const [ventasData, reporteData] = await Promise.all([
        api.getVentas(fechas.inicio, fechas.fin),
        api.getReporteVentas(fechas.inicio, fechas.fin),
      ]);
      setVentas(ventasData);
      setReporte(reporteData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const establecerRango = (dias) => {
    const hoy = new Date();
    const inicio = new Date();
    inicio.setDate(hoy.getDate() - dias);
    setFechas({
      inicio: inicio.toISOString().split('T')[0],
      fin: hoy.toISOString().split('T')[0],
    });
  };

  const convertirACOP = (valor, moneda) => {
    if (moneda === 'COP') return valor;
    if (moneda === 'USD') return valor * tasas.usd_cop;
    if (moneda === 'BS') return valor * tasas.bs_cop;
    return valor;
  };

  return (
    <div>
      <h2 className="mb-4">Reportes de Ventas</h2>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Filtros de Reporte</h5>
        </div>
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label>Fecha Inicio</label>
              <input type="date" className="form-control" value={fechas.inicio} onChange={(e) => setFechas({...fechas, inicio: e.target.value})} />
            </div>
            <div className="col-md-3">
              <label>Fecha Fin</label>
              <input type="date" className="form-control" value={fechas.fin} onChange={(e) => setFechas({...fechas, fin: e.target.value})} />
            </div>
            <div className="col-md-6">
              <div className="btn-group me-3">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => establecerRango(0)}>Hoy</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => establecerRango(7)}>Última semana</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => establecerRango(30)}>Último mes</button>
              </div>
              <button className="btn btn-dark" onClick={generarReporte} disabled={loading}>
                {loading ? 'Generando...' : 'Generar Reporte'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasas actuales */}
      <div className="card mb-4">
        <div className="card-header">
          <h6>Tasas de Cambio Actuales</h6>
        </div>
        <div className="card-body">
          <div className="row text-center">
            <div className="col-md-4">
              <small className="text-muted">USD → COP</small>
              <div className="fw-bold">{tasas.usd_cop?.toLocaleString()}</div>
            </div>
            <div className="col-md-4">
              <small className="text-muted">BS → COP</small>
              <div className="fw-bold">{formatearNumero(tasas.bs_cop, 4)}</div>
            </div>
            <div className="col-md-4">
              <small className="text-muted">USD → BS</small>
              <div className="fw-bold">{tasas.usd_bs?.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {reporte && (
        <>
          {/* Resumen por monedas */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card text-center border-success">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">Ventas en COP</h6>
                </div>
                <div className="card-body">
                  <h4 className="text-success">{formatearMoneda(reporte.ventas_por_moneda?.COP?.total_ventas || 0, 'COP')}</h4>
                  <small className="text-muted">{reporte.ventas_por_moneda?.COP?.cantidad_ventas || 0} ventas</small>
                  <div className="mt-2">
                    <small>Promedio: {formatearMoneda(reporte.ventas_por_moneda?.COP?.promedio_venta || 0, 'COP')}</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card text-center border-primary">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">Ventas en USD</h6>
                </div>
                <div className="card-body">
                  <h4 className="text-primary">{formatearMoneda(reporte.ventas_por_moneda?.USD?.total_ventas || 0, 'USD')}</h4>
                  <small className="text-muted">{reporte.ventas_por_moneda?.USD?.cantidad_ventas || 0} ventas</small>
                  <div className="mt-2">
                    <small>Promedio: {formatearMoneda(reporte.ventas_por_moneda?.USD?.promedio_venta || 0, 'USD')}</small>
                  </div>
                  <div className="mt-1">
                    <small className="text-muted">
                      Equiv. COP: {formatearMoneda(convertirACOP(reporte.ventas_por_moneda?.USD?.total_ventas || 0, 'USD'), 'COP')}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card text-center border-warning">
                <div className="card-header bg-warning text-dark">
                  <h6 className="mb-0">Ventas en BS</h6>
                </div>
                <div className="card-body">
                  <h4 className="text-warning">{formatearMoneda(reporte.ventas_por_moneda?.BS?.total_ventas || 0, 'BS')}</h4>
                  <small className="text-muted">{reporte.ventas_por_moneda?.BS?.cantidad_ventas || 0} ventas</small>
                  <div className="mt-2">
                    <small>Promedio: {formatearMoneda(reporte.ventas_por_moneda?.BS?.promedio_venta || 0, 'BS')}</small>
                  </div>
                  <div className="mt-1">
                    <small className="text-muted">
                      Equiv. COP: {formatearMoneda(convertirACOP(reporte.ventas_por_moneda?.BS?.total_ventas || 0, 'BS'), 'COP')}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Totales generales */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Total Ventas</h5>
                  <h3 className="text-info">{reporte.totales_generales?.total_ventas_cantidad || 0}</h3>
                  <small className="text-muted">Cantidad de transacciones</small>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Producto Más Vendido</h5>
                  <h6 className="text-muted">{reporte.producto_mas_vendido || 'N/A'}</h6>
                  <p className="mb-0">{reporte.cantidad_mas_vendida || 0} unidades</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Detalle de ventas */}
      {ventas.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h5>Detalle de Ventas</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Moneda</th>
                    <th>Equiv. COP</th>
                    <th>Vendedor</th>
                    <th>Productos</th>
                    <th>Cantidad</th>
                    <th>Tipo Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((venta) => (
                    <tr key={venta.id}>
                      <td>{new Date(venta.fecha_venta).toLocaleDateString('es-ES')}</td>
                      <td><strong>{formatearMoneda(venta.total, venta.moneda)}</strong></td>
                      <td>
                        <span className={`badge ${venta.moneda === 'COP' ? 'bg-success' : venta.moneda === 'USD' ? 'bg-primary' : 'bg-warning'}`}>
                          {venta.moneda}
                        </span>
                      </td>
                      <td className="text-muted">
                        {venta.moneda !== 'COP' ? formatearMoneda(convertirACOP(venta.total, venta.moneda), 'COP') : '-'}
                      </td>
                      <td>{venta.vendedor}</td>
                      <td>
                        {venta.productos && Array.isArray(venta.productos)
                          ? venta.productos.map(p => p.nombre).join(', ')
                          : 'N/A'}
                      </td>
                      <td>{venta.cantidad_total_productos}</td>
                      <td>
                        <span className="badge bg-secondary">{venta.tipo_pago || 'efectivo'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportes;