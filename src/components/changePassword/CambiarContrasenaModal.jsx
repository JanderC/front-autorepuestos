import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import * as api from '../../services/api';

const CambiarContrasenaModal = ({ isOpen, onClose, onSuccess }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      cargarUsuarios();
      resetForm();
    }
  }, [isOpen]);

  const cargarUsuarios = async () => {
    try {
      const data = await api.getUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error(err);
    }
  };

  const resetForm = () => {
    setSelectedUserId('');
    setNuevaContrasena('');
    setConfirmarContrasena('');
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!selectedUserId) {
      setError('Selecciona un usuario');
      return;
    }

    if (nuevaContrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const result = await api.cambiarContrasena(selectedUserId, nuevaContrasena);
      setSuccess(result.message);
      
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedUser = usuarios.find(u => u.id === parseInt(selectedUserId));

  return (
    <div 
      className="modal show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div 
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title">
              <Lock size={20} className="me-2" />
              Cambiar Contraseña de Usuario
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger d-flex align-items-center">
                  <AlertCircle size={20} className="me-2" />
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success d-flex align-items-center">
                  <CheckCircle size={20} className="me-2" />
                  {success}
                </div>
              )}

              {/* Seleccionar Usuario */}
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Seleccionar Usuario
                </label>
                <select
                  className="form-select"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">-- Selecciona un usuario --</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} (@{usuario.username}) - {usuario.rol}
                    </option>
                  ))}
                </select>
              </div>

              {selectedUser && (
                <div className="alert alert-info mb-3">
                  <strong>Usuario seleccionado:</strong> {selectedUser.nombre}
                  <br />
                  <small className="text-muted">
                    Username: {selectedUser.username} | Rol: {selectedUser.rol}
                  </small>
                </div>
              )}

              {/* Nueva Contraseña */}
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Nueva Contraseña
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <small className="text-muted">
                  La contraseña debe tener al menos 6 caracteres
                </small>
              </div>

              {/* Confirmar Contraseña */}
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Confirmar Contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  placeholder="Repite la contraseña"
                  required
                  disabled={loading}
                />
              </div>

              {/* Indicador de coincidencia */}
              {nuevaContrasena && confirmarContrasena && (
                <div className={`alert ${
                  nuevaContrasena === confirmarContrasena 
                    ? 'alert-success' 
                    : 'alert-warning'
                } py-2`}>
                  {nuevaContrasena === confirmarContrasena ? (
                    <>
                      <CheckCircle size={16} className="me-2" />
                      Las contraseñas coinciden
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="me-2" />
                      Las contraseñas no coinciden
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={loading || !selectedUserId || nuevaContrasena !== confirmarContrasena}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Cambiando...
                  </>
                ) : (
                  <>
                    <Lock size={18} className="me-2" />
                    Cambiar Contraseña
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CambiarContrasenaModal;