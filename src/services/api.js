const API_URL = process.env.REACT_APP_API_URL || 'https://backend-autorespuestos-production.up.railway.app';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Error en la petición');
  }

  return response.json();
};

export default {
  // Auth
  login: (credentials) => 
    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  verify: () => apiCall('/api/auth/verify'),

  // Productos
  getProductos: () => apiCall('/api/productos'),
  getProductosStockBajo: () => apiCall('/api/productos/stock-bajo'),
  getProductoByCodigo: (codigo) => apiCall(`/api/productos/codigo/${codigo}`),
  createProducto: (producto) => 
    apiCall('/api/productos', {
      method: 'POST',
      body: JSON.stringify(producto),
    }),
  updateProducto: (id, producto) =>
    apiCall(`/api/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(producto),
    }),
  updateStock: (id, data) =>
    apiCall(`/api/productos/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProducto: (id) =>
    apiCall(`/api/productos/${id}`, { method: 'DELETE' }),

  // Ventas
  getVentas: (fechaInicio, fechaFin) =>
    apiCall(`/api/ventas?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`),
  createVenta: (venta) =>
    apiCall('/api/ventas', {
      method: 'POST',
      body: JSON.stringify(venta),
    }),

  // Tasas
  getTasasActual: () => apiCall('/api/tasas/actual'),
  updateTasas: (tasas) =>
    apiCall('/api/tasas/actualizar', {
      method: 'POST',
      body: JSON.stringify(tasas),
    }),
  sincronizarBCV: () =>
    apiCall('/api/tasas/sincronizar-bcv', { method: 'POST' }),
  getDolarActual: () => 
    fetch('https://ve.dolarapi.com/v1/dolares').then(r => r.json()),

  // Dashboard
  getDashboard: () => apiCall('/api/dashboard'),

  // Reportes
  getReporteVentas: (fechaInicio, fechaFin) =>
    apiCall(`/api/reportes/ventas?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`),
};