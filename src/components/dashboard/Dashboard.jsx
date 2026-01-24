import React, { useState, useEffect } from 'react';
import { Calendar, Package, ShoppingCart, AlertTriangle, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { formatearMoneda } from '../../utils/formatters';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [stockBajo, setStockBajo] = useState([]);
  const [dolarData, setDolarData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, stockData, dolarApi] = await Promise.all([
          api.getDashboard(),
          api.getProductosStockBajo(),
          api.getDolarActual(),
        ]);
        
        setStats(dashboardData);
        setStockBajo(stockData);
        
        const oficial = dolarApi.find(d => d.fuente === 'oficial');
        const paralelo = dolarApi.find(d => d.fuente === 'paralelo');
        setDolarData({ oficial, paralelo });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard AutoRepuestos Los Pits</h2>
        <div className="text-muted">
          <Calendar size={16} className="me-2" />
          {new Date().toLocaleDateString('es-ES')}
        </div>
      </div>

      {/* Ventas por moneda */}
      <div className="row mb-4">
        <div className="col-lg-4 col-md-6 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Ventas Hoy USD</h6>
                  <h3>{formatearMoneda(stats?.ventas_hoy?.USD?.total || 0, 'USD')}</h3>
                  <small>{stats?.ventas_hoy?.USD?.cantidad || 0} transacciones</small>
                </div>
                <DollarSign size={48} className="opacity-75" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Ventas Hoy COP</h6>
                  <h3>{formatearMoneda(stats?.ventas_hoy?.COP?.total || 0, 'COP')}</h3>
                  <small>{stats?.ventas_hoy?.COP?.cantidad || 0} transacciones</small>
                </div>
                <ShoppingCart size={48} className="opacity-75" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Ventas Hoy BS</h6>
                  <h3>{formatearMoneda(stats?.ventas_hoy?.BS?.total || 0, 'BS')}</h3>
                  <small>{stats?.ventas_hoy?.BS?.cantidad || 0} transacciones</small>
                </div>
                <span style={{ fontSize: '36px', fontWeight: 'bold' }}>Bs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6>Total Productos</h6>
              <h3>{stats?.total_productos || 0}</h3>
              <small>productos activos</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h6>Inventario Bajo</h6>
              <h3>{stats?.productos_stock_bajo || 0}</h3>
              <small>productos</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-dark text-white">
            <div className="card-body">
              <h6>Dólar BCV</h6>
              <h3>Bs. {dolarData?.oficial?.promedio?.toFixed(2) || '0.00'}</h3>
              <small>Oficial</small>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h6>Dólar Paralelo</h6>
              <h3>Bs. {dolarData?.paralelo?.promedio?.toFixed(2) || '0.00'}</h3>
              <small>Mercado</small>
            </div>
          </div>
        </div>
      </div>

      {/* Stock bajo */}
      {stockBajo.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <AlertTriangle size={20} className="me-2 text-warning" />
              Productos con Stock Bajo
            </h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                    <th>Faltan</th>
                  </tr>
                </thead>
                <tbody>
                  {stockBajo.map((producto) => (
                    <tr key={producto.id}>
                      <td><code>{producto.codigo}</code></td>
                      <td>{producto.nombre}</td>
                      <td className="text-danger">{producto.stock_actual}</td>
                      <td>{producto.stock_minimo}</td>
                      <td className="text-warning">{producto.unidades_faltantes}</td>
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

export default Dashboard;