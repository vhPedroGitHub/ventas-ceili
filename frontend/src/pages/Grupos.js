import React, { useState, useEffect } from 'react';
import { Plus, Users, ExternalLink } from 'lucide-react';
import { gruposApi } from '../services/api';

const Grupos = () => {
  const [grupos, setGrupos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    facebook_id: '',
    url: '',
    descripcion: ''
  });

  useEffect(() => {
    loadGrupos();
  }, []);

  const loadGrupos = async () => {
    try {
      const response = await gruposApi.getAll();
      setGrupos(response.data || []);
    } catch (error) {
      console.error('Error loading grupos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await gruposApi.create(formData);
      loadGrupos();
      resetForm();
    } catch (error) {
      console.error('Error saving grupo:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      facebook_id: '',
      url: '',
      descripcion: ''
    });
    setShowModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grupos de Facebook</h1>
          <p className="text-gray-600">Configura los grupos donde realizarás tus publicaciones</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nuevo Grupo</span>
        </button>
      </div>

      {/* Lista de grupos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grupos.map((grupo) => (
          <div key={grupo.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{grupo.nombre}</h3>
                {grupo.descripcion && (
                  <p className="text-gray-600 text-sm mt-1">{grupo.descripcion}</p>
                )}
              </div>
              <div className={`w-3 h-3 rounded-full ${grupo.activo ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>

            <div className="space-y-2 mb-4">
              {grupo.facebook_id && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users size={14} className="mr-2" />
                  <span>ID: {grupo.facebook_id}</span>
                </div>
              )}
              
              {grupo.url && (
                <a
                  href={grupo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                >
                  <ExternalLink size={14} className="mr-2" />
                  <span>Ver grupo</span>
                </a>
              )}
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Estado: {grupo.activo ? 'Activo' : 'Inactivo'}</span>
              <span>{new Date(grupo.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {grupos.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay grupos configurados</h3>
          <p className="text-gray-600 mb-4">Comienza agregando los grupos de Facebook donde realizarás tus publicaciones</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            Agregar Primer Grupo
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo Grupo de Facebook</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Grupo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Grupo de Ventas Principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook ID
                </label>
                <input
                  type="text"
                  value={formData.facebook_id}
                  onChange={(e) => setFormData({ ...formData, facebook_id: e.target.value })}
                  className="input-field"
                  placeholder="ID del grupo en Facebook"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del Grupo
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="input-field"
                  placeholder="https://facebook.com/groups/..."
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
                  placeholder="Describe el tipo de contenido o audiencia de este grupo"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Crear Grupo
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

export default Grupos;
