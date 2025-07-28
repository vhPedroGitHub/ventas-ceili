import React, { useState, useEffect } from 'react';
import { Package, FileText, Calendar, Users, TrendingUp, Facebook } from 'lucide-react';
import { productosApi, publicacionesApi, programacionesApi, gruposApi } from '../services/api';
import FacebookIntegration from '../components/FacebookIntegration';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    productos: 0,
    publicaciones: 0,
    programaciones: 0,
    grupos: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [productosRes, publicacionesRes, programacionesRes, gruposRes] = await Promise.all([
        productosApi.getAll(),
        publicacionesApi.getAll(),
        programacionesApi.getAll(),
        gruposApi.getAll()
      ]);

      setStats({
        productos: productosRes.data?.length || 0,
        publicaciones: publicacionesRes.data?.length || 0,
        programaciones: programacionesRes.data?.length || 0,
        grupos: gruposRes.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Productos',
      value: stats.productos,
      icon: Package,
      color: 'bg-blue-500',
      link: '/productos'
    },
    {
      title: 'Publicaciones',
      value: stats.publicaciones,
      icon: FileText,
      color: 'bg-green-500',
      link: '/publicaciones'
    },
    {
      title: 'Programaciones',
      value: stats.programaciones,
      icon: Calendar,
      color: 'bg-purple-500',
      link: '/programaciones'
    },
    {
      title: 'Grupos',
      value: stats.grupos,
      icon: Users,
      color: 'bg-orange-500',
      link: '/grupos'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Gestiona tus ventas en redes sociales de manera eficiente</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-full text-white mr-4`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Facebook Integration */}
      <div className="mb-8">
        <FacebookIntegration />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <a 
              href="/productos" 
              className="block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Agregar Producto
            </a>
            <a 
              href="/publicaciones" 
              className="block w-full bg-gray-600 text-white text-center py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
            >
              Crear Publicación
            </a>
            <a 
              href="/programaciones" 
              className="block w-full bg-gray-600 text-white text-center py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
            >
              Programar Publicación
            </a>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            <TrendingUp className="inline mr-2" size={20} />
            Resumen de Actividad
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Productos registrados</span>
              <span className="font-medium">{stats.productos}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Publicaciones creadas</span>
              <span className="font-medium">{stats.publicaciones}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Programaciones activas</span>
              <span className="font-medium">{stats.programaciones}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Grupos configurados</span>
              <span className="font-medium">{stats.grupos}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
