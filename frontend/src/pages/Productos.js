import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { productosApi } from '../services/api';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen_url: '',
    stock: '',
    categoria: ''
  });

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    try {
      const response = await productosApi.getAll();
      setProductos(response.data || []);
    } catch (error) {
      console.error('Error loading productos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await productosApi.update(editingProduct.id, data);
      } else {
        await productosApi.create(data);
      }

      loadProductos();
      resetForm();
    } catch (error) {
      console.error('Error saving producto:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await productosApi.delete(id);
        loadProductos();
      } catch (error) {
        console.error('Error deleting producto:', error);
      }
    }
  };

  const handleEdit = (producto) => {
    setEditingProduct(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio.toString(),
      imagen_url: producto.imagen_url || '',
      stock: producto.stock.toString(),
      categoria: producto.categoria || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      imagen_url: '',
      stock: '',
      categoria: ''
    });
    setEditingProduct(null);
    setShowModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Productos</h1>
          <p className="text-gray-600">Gestiona tu inventario de productos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Lista de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((producto) => (
          <div key={producto.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{producto.nombre}</h3>
                <p className="text-gray-600 text-sm mt-1">{producto.descripcion}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(producto)}
                  className="p-2 text-gray-400 hover:text-blue-500"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(producto.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {producto.imagen_url && (
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className="w-full h-32 object-cover rounded-md mb-4"
              />
            )}

            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-green-600">
                ${producto.precio}
              </span>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Package size={16} />
                <span>Stock: {producto.stock}</span>
              </div>
            </div>

            {producto.categoria && (
              <div className="mt-2">
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {producto.categoria}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de Imagen
                </label>
                <input
                  type="url"
                  value={formData.imagen_url}
                  onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;
