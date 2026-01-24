import React from 'react';
import { BarChart3, ShoppingCart, Package, Calendar, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navigation = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'reportes', label: 'Reportes', icon: Calendar },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <span className="navbar-brand">AUTOGESTION LOS PITS</span>

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
            {menuItems.map((item) => {
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
                    {item.label}
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
                {user?.nombre}
              </button>
              <ul className="dropdown-menu">
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