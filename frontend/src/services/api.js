import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Servicios para Productos
export const productosApi = {
  getAll: () => api.get('/productos'),
  create: (producto) => api.post('/productos', producto),
  update: (id, producto) => api.put(`/productos/${id}`, producto),
  delete: (id) => api.delete(`/productos/${id}`)
};

// Servicios para Publicaciones
export const publicacionesApi = {
  getAll: () => api.get('/publicaciones'),
  create: (publicacion) => api.post('/publicaciones', publicacion),
  update: (id, publicacion) => api.put(`/publicaciones/${id}`, publicacion),
  delete: (id) => api.delete(`/publicaciones/${id}`)
};

// Servicios para Grupos
export const gruposApi = {
  getAll: () => api.get('/grupos'),
  create: (grupo) => api.post('/grupos', grupo)
};

// Servicios para Programaciones
export const programacionesApi = {
  getAll: () => api.get('/programaciones'),
  create: (programacion) => api.post('/programaciones', programacion),
  update: (id, programacion) => api.put(`/programaciones/${id}`, programacion),
  delete: (id) => api.delete(`/programaciones/${id}`)
};

export default api;
