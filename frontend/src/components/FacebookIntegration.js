import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FacebookIntegration = () => {
  const [facebookStatus, setFacebookStatus] = useState({
    connected: false,
    valid: false,
    loading: true
  });
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  useEffect(() => {
    checkFacebookStatus();
  }, []);

  const checkFacebookStatus = async () => {
    try {
      const response = await axios.get('/api/facebook/status');
      setFacebookStatus({
        ...response.data,
        loading: false
      });

      if (response.data.connected && response.data.valid) {
        loadGroups();
      }
    } catch (error) {
      console.error('Error checking Facebook status:', error);
      setFacebookStatus({
        connected: false,
        valid: false,
        loading: false
      });
    }
  };

  const loadGroups = async () => {
    setLoadingGroups(true);
    try {
      const response = await axios.get('/api/facebook/groups');
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
    setLoadingGroups(false);
  };

  const connectFacebook = () => {
    // En una implementación real, aquí se abriría el popup de Facebook
    // Por ahora simularemos con un prompt
    const accessToken = prompt('Ingresa tu token de acceso de Facebook:');
    
    if (accessToken) {
      handleFacebookConnect(accessToken);
    }
  };

  const handleFacebookConnect = async (accessToken) => {
    try {
      const response = await axios.post('/api/facebook/connect', {
        access_token: accessToken
      });

      alert('Facebook conectado exitosamente');
      checkFacebookStatus();
    } catch (error) {
      alert('Error conectando Facebook: ' + (error.response?.data?.error || error.message));
    }
  };

  const disconnectFacebook = async () => {
    if (window.confirm('¿Estás seguro que quieres desconectar Facebook?')) {
      try {
        await axios.delete('/api/facebook/disconnect');
        setFacebookStatus({
          connected: false,
          valid: false,
          loading: false
        });
        setGroups([]);
        alert('Facebook desconectado');
      } catch (error) {
        alert('Error desconectando Facebook');
      }
    }
  };

  const testPost = async () => {
    const groupId = prompt('ID del grupo donde publicar:');
    const message = prompt('Mensaje a publicar:');
    
    if (groupId && message) {
      try {
        const response = await axios.post('/api/facebook/post', {
          group_id: groupId,
          message: message
        });
        
        alert('Publicación exitosa! ID: ' + response.data.post_id);
      } catch (error) {
        alert('Error en publicación: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  if (facebookStatus.loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Integración con Facebook
      </h3>

      <div className="space-y-4">
        {/* Estado de conexión */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-3 ${
              facebookStatus.connected && facebookStatus.valid 
                ? 'bg-green-400' 
                : 'bg-red-400'
            }`}></div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Estado de Facebook
              </p>
              <p className="text-sm text-gray-500">
                {facebookStatus.connected && facebookStatus.valid 
                  ? 'Conectado y activo' 
                  : facebookStatus.connected 
                    ? 'Conectado pero token inválido'
                    : 'No conectado'
                }
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {facebookStatus.connected ? (
              <>
                <button
                  onClick={disconnectFacebook}
                  className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                >
                  Desconectar
                </button>
                {facebookStatus.valid && (
                  <button
                    onClick={testPost}
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                  >
                    Publicar Prueba
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={connectFacebook}
                className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Conectar Facebook
              </button>
            )}
          </div>
        </div>

        {/* Grupos de Facebook */}
        {facebookStatus.connected && facebookStatus.valid && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">
                Grupos Disponibles
              </h4>
              <button
                onClick={loadGroups}
                disabled={loadingGroups}
                className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
              >
                {loadingGroups ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>
            
            {loadingGroups ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : groups.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {groups.map(group => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {group.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {group.member_count} miembros • {group.privacy}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {group.id}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No se encontraron grupos disponibles
              </p>
            )}
          </div>
        )}

        {/* Instrucciones */}
        {!facebookStatus.connected && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Cómo conectar Facebook
            </h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Ve a Facebook Developer Console</li>
              <li>Crea una aplicación o usa una existente</li>
              <li>Genera un token de acceso con permisos de grupos</li>
              <li>Copia y pega el token aquí</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacebookIntegration;
