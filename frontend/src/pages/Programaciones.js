import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Edit, Trash2, Play, Pause } from 'lucide-react';
import { programacionesApi, publicacionesApi, gruposApi } from '../services/api';

const Programaciones = () => {
  const [programaciones, setProgramaciones] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProgramacion, setEditingProgramacion] = useState(null);
  const [formData, setFormData] = useState({
    publicacion_id: '',
    grupos_id: [],
    tipo_frecuencia: 'diaria',
    frecuencia_dias: 1,
    horarios: [{ hora: 9, minuto: 0 }],
    cantidad_publicaciones: 1,
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'activa'
  });

  useEffect(() => {
    loadProgramaciones();
    loadPublicaciones();
    loadGrupos();
  }, []);

  const loadProgramaciones = async () => {
    try {
      const response = await programacionesApi.getAll();
      setProgramaciones(response.data || []);
    } catch (error) {
      console.error('Error loading programaciones:', error);
    }
  };

  const loadPublicaciones = async () => {
    try {
      const response = await publicacionesApi.getAll();
      setPublicaciones(response.data || []);
    } catch (error) {
      console.error('Error loading publicaciones:', error);
    }
  };

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
      const data = {
        ...formData,
        frecuencia_dias: parseInt(formData.frecuencia_dias),
        cantidad_publicaciones: parseInt(formData.cantidad_publicaciones),
        fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
        fecha_fin: formData.fecha_fin ? new Date(formData.fecha_fin).toISOString() : null,
        horarios: formData.horarios.map(h => ({
          hora: parseInt(h.hora),
          minuto: parseInt(h.minuto)
        }))
      };

      if (editingProgramacion) {
        await programacionesApi.update(editingProgramacion.id, data);
      } else {
        await programacionesApi.create(data);
      }

      loadProgramaciones();
      resetForm();
    } catch (error) {
      console.error('Error saving programacion:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta programación?')) {
      try {
        await programacionesApi.delete(id);
        loadProgramaciones();
      } catch (error) {
        console.error('Error deleting programacion:', error);
      }
    }
  };

  const handleEdit = (programacion) => {
    setEditingProgramacion(programacion);
    setFormData({
      publicacion_id: programacion.publicacion_id,
      grupos_id: programacion.grupos_id || [],
      tipo_frecuencia: programacion.tipo_frecuencia,
      frecuencia_dias: programacion.frecuencia_dias,
      horarios: programacion.horarios || [{ hora: 9, minuto: 0 }],
      cantidad_publicaciones: programacion.cantidad_publicaciones,
      fecha_inicio: new Date(programacion.fecha_inicio).toISOString().split('T')[0],
      fecha_fin: programacion.fecha_fin ? new Date(programacion.fecha_fin).toISOString().split('T')[0] : '',
      estado: programacion.estado
    });
    setShowModal(true);
  };

  const addHorario = () => {
    setFormData({
      ...formData,
      horarios: [...formData.horarios, { hora: 9, minuto: 0 }]
    });
  };

  const removeHorario = (index) => {
    const newHorarios = formData.horarios.filter((_, i) => i !== index);
    setFormData({ ...formData, horarios: newHorarios });
  };

  const updateHorario = (index, field, value) => {
    const newHorarios = [...formData.horarios];
    newHorarios[index] = { ...newHorarios[index], [field]: parseInt(value) };
    setFormData({ ...formData, horarios: newHorarios });
  };

  const resetForm = () => {
    setFormData({
      publicacion_id: '',
      grupos_id: [],
      tipo_frecuencia: 'diaria',
      frecuencia_dias: 1,
      horarios: [{ hora: 9, minuto: 0 }],
      cantidad_publicaciones: 1,
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'activa'
    });
    setEditingProgramacion(null);
    setShowModal(false);
  };

  const getPublicacionTitulo = (publicacionId) => {
    const publicacion = publicaciones.find(p => p.id === publicacionId);
    return publicacion ? publicacion.titulo : 'Publicación no encontrada';
  };

  const getGrupoNombre = (grupoId) => {
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo ? grupo.nombre : 'Grupo no encontrado';
  };

  const getEstadoBadge = (estado) => {
    const colors = {
      activa: 'bg-green-100 text-green-700',
      pausada: 'bg-yellow-100 text-yellow-700',
      completada: 'bg-blue-100 text-blue-700'
    };
    return colors[estado] || colors.activa;
  };

  const formatHorarios = (horarios) => {
    return horarios.map(h => `${h.hora.toString().padStart(2, '0')}:${h.minuto.toString().padStart(2, '0')}`).join(', ');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Programaciones</h1>
          <p className="text-gray-600">Automatiza tus publicaciones en redes sociales</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nueva Programación</span>
        </button>
      </div>

      {/* Lista de programaciones */}
      <div className="space-y-4">
        {programaciones.map((programacion) => (
          <div key={programacion.id} className="card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getPublicacionTitulo(programacion.publicacion_id)}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded ${getEstadoBadge(programacion.estado)}`}>
                    {programacion.estado}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    <span>
                      {programacion.tipo_frecuencia === 'diaria' && `Cada ${programacion.frecuencia_dias} día(s)`}
                      {programacion.tipo_frecuencia === 'semanal' && 'Semanal'}
                      {programacion.tipo_frecuencia === 'mensual' && 'Mensual'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    <span>{formatHorarios(programacion.horarios)}</span>
                  </div>

                  <div>
                    <span className="font-medium">Publicaciones:</span> {programacion.cantidad_publicaciones}
                  </div>

                  <div>
                    <span className="font-medium">Desde:</span> {new Date(programacion.fecha_inicio).toLocaleDateString()}
                  </div>
                </div>

                {programacion.grupos_id && programacion.grupos_id.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm font-medium text-gray-700">Grupos: </span>
                    <span className="text-sm text-gray-600">
                      {programacion.grupos_id.map(grupoId => getGrupoNombre(grupoId)).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(programacion)}
                  className="p-2 text-gray-400 hover:text-blue-500"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-green-500"
                  title={programacion.estado === 'activa' ? 'Pausar' : 'Activar'}
                >
                  {programacion.estado === 'activa' ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  onClick={() => handleDelete(programacion.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingProgramacion ? 'Editar Programación' : 'Nueva Programación'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publicación *
                </label>
                <select
                  required
                  value={formData.publicacion_id}
                  onChange={(e) => setFormData({ ...formData, publicacion_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar publicación</option>
                  {publicaciones.map((publicacion) => (
                    <option key={publicacion.id} value={publicacion.id}>
                      {publicacion.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grupos *
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {grupos.map((grupo) => (
                    <label key={grupo.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.grupos_id.includes(grupo.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, grupos_id: [...formData.grupos_id, grupo.id] });
                          } else {
                            setFormData({ ...formData, grupos_id: formData.grupos_id.filter(id => id !== grupo.id) });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{grupo.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Frecuencia
                  </label>
                  <select
                    value={formData.tipo_frecuencia}
                    onChange={(e) => setFormData({ ...formData, tipo_frecuencia: e.target.value })}
                    className="input-field"
                  >
                    <option value="diaria">Diaria</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensual">Mensual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frecuencia (días)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.frecuencia_dias}
                    onChange={(e) => setFormData({ ...formData, frecuencia_dias: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Horarios
                  </label>
                  <button
                    type="button"
                    onClick={addHorario}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Agregar Horario
                  </button>
                </div>

                {formData.horarios.map((horario, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <select
                      value={horario.hora}
                      onChange={(e) => updateHorario(index, 'hora', e.target.value)}
                      className="input-field"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                      ))}
                    </select>
                    <select
                      value={horario.minuto}
                      onChange={(e) => updateHorario(index, 'minuto', e.target.value)}
                      className="input-field"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                      ))}
                    </select>
                    {formData.horarios.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHorario(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad de Publicaciones
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.cantidad_publicaciones}
                    onChange={(e) => setFormData({ ...formData, cantidad_publicaciones: e.target.value })}
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
                    <option value="activa">Activa</option>
                    <option value="pausada">Pausada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Fin (opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingProgramacion ? 'Actualizar' : 'Crear'}
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

export default Programaciones;
