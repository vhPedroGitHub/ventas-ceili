import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, FileText, Calendar, Users, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/productos', label: 'Productos', icon: Package },
    { path: '/publicaciones', label: 'Publicaciones', icon: FileText },
    { path: '/programaciones', label: 'Programaciones', icon: Calendar },
    { path: '/grupos', label: 'Grupos', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-indigo-600">
              Ventas Ceili
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-4">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  location.pathname === path
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Menú de usuario */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <User size={20} />
              <span className="hidden md:block text-sm font-medium">
                {user?.nombre || user?.email}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  <p className="font-medium">{user?.nombre}</p>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut size={16} className="mr-2" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Menú móvil */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  location.pathname === path
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
