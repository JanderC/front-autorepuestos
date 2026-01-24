import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(credentials.username, credentials.password);
    
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
              <div className="card-header text-center py-4" style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                borderBottom: '4px solid #dc2626',
              }}>
                <h2 className="text-white mb-0">AutoRepuestos Los Pits</h2>
              </div>

              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-2" style={{ color: '#1a1a1a' }}>
                    Acceso al Sistema
                  </h2>
                  <p className="text-muted mb-0">
                    Ingresa tus credenciales para continuar
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-4">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-uppercase">
                      <i className="bi bi-person-fill me-2 text-danger"></i>
                      Usuario
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                      placeholder="Ingresa tu usuario"
                      required
                      style={{ borderRadius: '12px' }}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-uppercase">
                      <i className="bi bi-lock-fill me-2 text-danger"></i>
                      Contraseña
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      placeholder="Ingresa tu contraseña"
                      required
                      style={{ borderRadius: '12px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-lg w-100 fw-semibold text-uppercase"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Ingresando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-car-front-fill me-2"></i>
                        Ingresar al Sistema
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 p-3 rounded-3" style={{
                  background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                  border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #dc2626',
                }}>
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-gear-fill text-danger me-2"></i>
                    <small className="fw-semibold text-muted">CREDENCIALES DE PRUEBA</small>
                  </div>
                  <div className="row">
                    <div className="col-12 col-sm-6 mb-2 mb-sm-0">
                      <small className="text-muted me-2">Usuario:</small>
                      <span className="badge text-white px-2 py-1" style={{ backgroundColor: '#dc2626' }}>
                        admin
                      </span>
                    </div>
                    <div className="col-12 col-sm-6">
                      <small className="text-muted me-2">Contraseña:</small>
                      <span className="badge text-white px-2 py-1" style={{ backgroundColor: '#dc2626' }}>
                        admin123
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;