import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { publicacionesApi, productosApi } from '../services/api';

const Publicaciones = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPublication, setEditingPublication] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    imagen_url: '',
    productos: [],
    estado: 'borrador'
  });

  useEffect(() => {
    loadPublicaciones();
    loadProductos();
  }, []);

  const loadPublicaciones = async () => {
    try {
      const response = await publicacionesApi.getAll();
      setPublicaciones(response.data || []);
    } catch (error) {
      console.error('Error loading publicaciones:', error);
    }
  };

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
        productos: formData.productos.map(p => ({
          ...p,
          cantidad: parseInt(p.cantidad)
        }))
      };

      if (editingPublication) {
        await publicacionesApi.update(editingPublication.id, data);
      } else {
        await publicacionesApi.create(data);
      }

      loadPublicaciones();
      resetForm();
    } catch (error) {
      console.error('Error saving publicacion:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
      try {
        await publicacionesApi.delete(id);
        loadPublicaciones();
      } catch (error) {
        console.error('Error deleting publicacion:', error);
      }
    }
  };

  const handleEdit = (publicacion) => {
    setEditingPublication(publicacion);
    setFormData({
      titulo: publicacion.titulo,
      descripcion: publicacion.descripcion,
      imagen_url: publicacion.imagen_url || '',
      productos: publicacion.productos || [],
      estado: publicacion.estado || 'borrador'
    });
    setShowModal(true);
  };

  const addProductToPublication = () => {
    setFormData({
      ...formData,
      productos: [...formData.productos, { producto_id: '', cantidad: 1 }]
    });
  };

  const removeProductFromPublication = (index) => {
    const newProductos = formData.productos.filter((_, i) => i !== index);
    setFormData({ ...formData, productos: newProductos });
  };

  const updateProductInPublication = (index, field, value) => {
    const newProductos = [...formData.productos];
    newProductos[index] = { ...newProductos[index], [field]: value };
    setFormData({ ...formData, productos: newProductos });
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      imagen_url: '',
      productos: [],
      estado: 'borrador'
    });
    setEditingPublication(null);
    setShowModal(false);
  };

  const getProductName = (productId) => {
    const producto = productos.find(p => p.id === productId);
    return producto ? producto.nombre : 'Producto no encontrado';
  };

  const getEstadoBadge = (estado) => {
    const colors = {
      borrador: 'bg-gray-100 text-gray-700',
      activa: 'bg-green-100 text-green-700',
      pausada: 'bg-yellow-100 text-yellow-700'
    };
    return colors[estado] || colors.borrador;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Publicaciones</h1>
          <p className="text-gray-600">Crea y gestiona tus publicaciones para redes sociales</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nueva Publicación</span>
        </button>
      </div>

      {/* Lista de publicaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {publicaciones.map((publicacion) => (
          <div key={publicacion.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{publicacion.titulo}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${getEstadoBadge(publicacion.estado)}`}>
                    {publicacion.estado}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{publicacion.descripcion}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(publicacion)}
                  className="p-2 text-gray-400 hover:text-blue-500"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(publicacion.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {publicacion.imagen_url && (
              <img
                src={publicacion.imagen_url}
                alt={publicacion.titulo}
                className="w-full h-32 object-cover rounded-md mb-4"
              />
            )}

            {publicacion.productos && publicacion.productos.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Productos incluidos:</h4>
                <div className="space-y-1">
                  {publicacion.productos.map((prod, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <FileText size={14} className="mr-2" />
                      <span>{getProductName(prod.producto_id)} (x{prod.cantidad})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingPublication ? 'Editar Publicación' : 'Nueva Publicación'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
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
                  URL de Imagen
                </label>
                <input
                  type="url"
                  value={formData.imagen_url}
                  onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="input-field"
                >
                  <option value="borrador">Borrador</option>
                  <option value="activa">Activa</option>
                  <option value="pausada">Pausada</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Productos
                  </label>
                  <button
                    type="button"
                    onClick={addProductToPublication}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Agregar Producto
                  </button>
                </div>

                {formData.productos.map((prod, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <select
                      value={prod.producto_id}
                      onChange={(e) => updateProductInPublication(index, 'producto_id', e.target.value)}
                      className="input-field flex-1"
                      required
                    >
                      <option value="">Seleccionar producto</option>
                      {productos.map((producto) => (
                        <option key={producto.id} value={producto.id}>
                          {producto.nombre}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={prod.cantidad}
                      onChange={(e) => updateProductInPublication(index, 'cantidad', e.target.value)}
                      className="input-field w-20"
                      placeholder="Cant."
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeProductFromPublication(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingPublication ? 'Actualizar' : 'Crear'}
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

export default Publicaciones;
