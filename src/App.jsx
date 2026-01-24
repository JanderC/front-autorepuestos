import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Navigation from './components/layout/Navigation';
import Dashboard from './components/dashboard/Dashboard';
import Ventas from './components/ventas/Ventas';

// Importa los otros componentes cuando los crees
// import Inventario from './components/inventario/Inventario';
// import Reportes from './components/reportes/Reportes';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'ventas':
        return <Ventas />;
      case 'inventario':
        return <div className="alert alert-info">Componente Inventario - Por implementar</div>;
      case 'reportes':
        return <div className="alert alert-info">Componente Reportes - Por implementar</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="container-fluid py-4">
        {renderContent()}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;