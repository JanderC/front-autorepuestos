import React, { useState, useEffect } from 'react';
import { Calendar, Package, ShoppingCart, AlertTriangle, DollarSign, Wallet, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatearMoneda } from '../../utils/formatters';
import CambiarContrasenaModal from '../changePassword/CambiarContrasenaModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [stockBajo, setStockBajo] = useState([]);
  const [dolarData, setDolarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [
          api.getDashboard(),
          api.getDolarActual(),
        ];

        if (user?.rol === 'admin') {
          promises.push(api.getProductosStockBajo());
        }

        const results = await Promise.all(promises);
        const [dashboardData, dolarApi, stockData] = results;
        
        setStats(dashboardData);
        
        const oficial = dolarApi.find(d => d.fuente === 'oficial');
        const paralelo = dolarApi.find(d => d.fuente === 'paralelo');
        setDolarData({ oficial, paralelo });
        
        if (stockData) setStockBajo(stockData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-2 px-md-4">
      {/* Header con botón de cambio de contraseña */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4">
        <h2 className="mb-2 mb-md-0 fs-4 fs-md-2">Dashboard AutoRepuestos Los Pits</h2>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="text-muted d-flex align-items-center">
            <Calendar size={16} className="me-2" />
            <small className="d-none d-md-inline">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small>
            <small className="d-md-none">{new Date().toLocaleDateString('es-ES')}</small>
          </div>
          
          {/* Botón Cambiar Contraseña - Solo Admin */}
          {user?.rol === 'admin' && (
            <button
              className="btn btn-sm btn-danger"
              onClick={() => setModalPasswordOpen(true)}
            >
              <Lock size={16} className="me-1" />
              <span className="d-none d-md-inline">Cambiar Contraseña</span>
              <span className="d-md-none">Contraseña</span>
            </button>
          )}
        </div>
      </div>

      {/* Ventas por moneda - Responsive Grid */}
      <div className="row g-2 g-md-3 mb-3 mb-md-4">
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="card bg-success text-white h-100">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <h6 className="mb-1 fs-6">Ventas Hoy USD</h6>
                  <h3 className="mb-1 fs-5 fs-md-3">{formatearMoneda(stats?.ventas_hoy?.USD?.total || 0, 'USD')}</h3>
                  <small className="d-block">{stats?.ventas_hoy?.USD?.cantidad || 0} transacciones</small>
                </div>
                <DollarSign size={36} className="opacity-75 d-none d-md-block" />
                <DollarSign size={24} className="opacity-75 d-md-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-4">
          <div className="card bg-primary text-white h-100">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <h6 className="mb-1 fs-6">Ventas Hoy COP</h6>
                  <h3 className="mb-1 fs-5 fs-md-3">{formatearMoneda(stats?.ventas_hoy?.COP?.total || 0, 'COP')}</h3>
                  <small className="d-block">{stats?.ventas_hoy?.COP?.cantidad || 0} transacciones</small>
                </div>
                <ShoppingCart size={36} className="opacity-75 d-none d-md-block" />
                <ShoppingCart size={24} className="opacity-75 d-md-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-4">
          <div className="card bg-info text-white h-100">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <h6 className="mb-1 fs-6">Ventas Hoy BS</h6>
                  <h3 className="mb-1 fs-5 fs-md-3">{formatearMoneda(stats?.ventas_hoy?.BS?.total || 0, 'BS')}</h3>
                  <small className="d-block">{stats?.ventas_hoy?.BS?.cantidad || 0} transacciones</small>
                </div>
                <span className="fs-1 fw-bold opacity-75 d-none d-md-block">Bs</span>
                <span className="fs-4 fw-bold opacity-75 d-md-none">Bs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas generales - Grid Responsive */}
      <div className="row g-2 g-md-3 mb-3 mb-md-4">
        {user?.rol === 'admin' && stats?.capital_inventario && (
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card bg-warning text-dark h-100">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fs-6">Capital Invertido</h6>
                    <h4 className="mb-0 fs-5 fs-md-4">{formatearMoneda(stats.capital_inventario.total_usd, 'USD')}</h4>
                    <small className="d-block text-truncate">Valor total del inventario</small>
                  </div>
                  <Wallet size={32} className="opacity-75 d-none d-md-block" />
                  <Wallet size={24} className="opacity-75 d-md-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`col-12 col-sm-6 ${user?.rol === 'admin' ? 'col-lg-3' : 'col-lg-4'}`}>
          <div className="card bg-success text-white h-100">
            <div className="card-body p-3">
              <h6 className="mb-1 fs-6">Total Productos</h6>
              <h3 className="mb-1 fs-4 fs-md-3">{stats?.total_productos || 0}</h3>
              <small>productos activos</small>
            </div>
          </div>
        </div>

        {user?.rol === 'admin' && (
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card bg-danger text-white h-100">
              <div className="card-body p-3">
                <h6 className="mb-1 fs-6">Inventario Bajo</h6>
                <h3 className="mb-1 fs-4 fs-md-3">{stats?.productos_stock_bajo || 0}</h3>
                <small>productos</small>
              </div>
            </div>
          </div>
        )}

        <div className={`col-12 col-sm-6 ${user?.rol === 'admin' ? 'col-lg-3' : 'col-lg-4'}`}>
          <div className="card bg-dark text-white h-100">
            <div className="card-body p-3">
              <h6 className="mb-1 fs-6">Dólar BCV</h6>
              <h4 className="mb-1 fs-5 fs-md-4">Bs. {dolarData?.oficial?.promedio?.toFixed(2) || '0.00'}</h4>
              <small>Oficial</small>
            </div>
          </div>
        </div>

        <div className={`col-12 col-sm-6 ${user?.rol === 'admin' ? 'col-lg-12' : 'col-lg-4'}`}>
          <div className="card bg-secondary text-white h-100">
            <div className="card-body p-3">
              <h6 className="mb-1 fs-6">Dólar Paralelo</h6>
              <h4 className="mb-1 fs-5 fs-md-4">Bs. {dolarData?.paralelo?.promedio?.toFixed(2) || '0.00'}</h4>
              <small>Mercado</small>
            </div>
          </div>
        </div>
      </div>

      {/* Stock bajo - Solo Admin */}
      {user?.rol === 'admin' && stockBajo.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0 fs-6 fs-md-5">
              <AlertTriangle size={20} className="me-2 text-warning" />
              Productos con Stock Bajo
            </h5>
          </div>
          <div className="card-body p-2 p-md-3">
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead>
                  <tr>
                    <th className="d-none d-md-table-cell">Código</th>
                    <th>Producto</th>
                    <th className="text-center">Stock</th>
                    <th className="text-center d-none d-sm-table-cell">Mínimo</th>
                    <th className="text-center">Faltan</th>
                  </tr>
                </thead>
                <tbody>
                  {stockBajo.map((producto) => (
                    <tr key={producto.id}>
                      <td className="d-none d-md-table-cell"><code className="small">{producto.codigo}</code></td>
                      <td className="small">{producto.nombre}</td>
                      <td className="text-danger text-center fw-bold">{producto.stock_actual}</td>
                      <td className="text-center d-none d-sm-table-cell">{producto.stock_minimo}</td>
                      <td className="text-warning text-center fw-bold">{producto.unidades_faltantes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de contraseña */}
      <CambiarContrasenaModal
        isOpen={modalPasswordOpen}
        onClose={() => setModalPasswordOpen(false)}
        onSuccess={() => {
          // Opcional: refrescar datos o mostrar notificación
          console.log('Contraseña cambiada exitosamente');
        }}
      />
    </div>
  );
};

export default Dashboard;