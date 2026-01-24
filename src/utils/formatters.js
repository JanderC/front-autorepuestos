export const formatearNumero = (valor, decimales = 2) => {
  const numero = parseFloat(valor);
  return isNaN(numero) ? '0.00' : numero.toFixed(decimales);
};

export const formatearNumeroParaMostrar = (valor, decimales = 2) => {
  const numero = parseFloat(valor);
  if (isNaN(numero)) return '0';
  return numero.toLocaleString('es-CO', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
};

export const formatearMoneda = (valor, moneda) => {
  const simbolos = { 
    COP: '$COP', 
    USD: '$USD', 
    BS: 'Bs.' 
  };
  
  return `${simbolos[moneda] || '$'} ${parseFloat(valor || 0).toLocaleString('es-CO', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
};

export const obtenerPrecioEnMoneda = (producto, moneda) => {
  switch (moneda) {
    case 'USD':
      return producto.precio_venta_usd_calculado || producto.precio_venta;
    case 'BS':
      return producto.precio_venta_bs_calculado || producto.precio_venta;
    case 'COP':
    default:
      return producto.precio_venta_cop_calculado || producto.precio_venta;
  }
};