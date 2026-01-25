import React from 'react';
import { BarChart3, ShoppingCart, Package, Calendar, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navigation = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin', 'empleado'] },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart, roles: ['admin', 'empleado'] },
    { id: 'inventario', label: 'Inventario', icon: Package, roles: ['admin'] },
    { id: 'reportes', label: 'Reportes', icon: Calendar, roles: ['admin'] },
  ];

  const menuItemsFiltrados = menuItems.filter(item => 
    item.roles.includes(user?.rol || 'empleado')
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <span className="navbar-brand">
          <span className="d-none d-md-inline">AUTOGESTION LOS PITS</span>
          <span className="d-md-none">LOS PITS</span>
        </span>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {menuItemsFiltrados.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-link btn btn-link text-white ${
                      activeTab === item.id ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon size={16} className="me-2" />
                    <span className="d-none d-md-inline">{item.label}</span>
                    <span className="d-md-none">{item.label.substring(0, 3)}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="navbar-nav">
            <div className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle btn btn-link text-white"
                data-bs-toggle="dropdown"
              >
                <User size={16} className="me-2" />
                <span className="d-none d-md-inline">{user?.nombre}</span>
                <span className="badge bg-secondary ms-2">{user?.rol}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li className="px-3 py-2 border-bottom">
                  <small className="text-muted">Usuario:</small>
                  <div className="fw-bold">{user?.username}</div>
                  <small className="text-muted">Rol: {user?.rol}</small>
                </li>
                <li>
                  <button className="dropdown-item" onClick={logout}>
                    <LogOut size={16} className="me-2" />
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;