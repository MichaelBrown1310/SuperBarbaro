export const getUsuario = () => {
  return JSON.parse(localStorage.getItem("usuario"))
}

export const estaLogueado = () => {
  return !!getUsuario()
}

export const esAdmin = () => {
  return getUsuario()?.rol === 'ADMINISTRADOR'
}

export const esCajero = () => {
  return getUsuario()?.rol === 'CAJERO'
}

export const esCocinero = () => {
  return getUsuario()?.rol === 'COCINERO'
}