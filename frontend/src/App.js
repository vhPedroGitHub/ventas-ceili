import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Publicaciones from './pages/Publicaciones';
import Programaciones from './pages/Programaciones';
import Grupos from './pages/Grupos';
import Login from './pages/Login';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Componente principal de la aplicación
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? "container mx-auto px-4 py-8" : ""}>
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/productos" 
            element={
              <ProtectedRoute>
                <Productos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/publicaciones" 
            element={
              <ProtectedRoute>
                <Publicaciones />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/programaciones" 
            element={
              <ProtectedRoute>
                <Programaciones />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/grupos" 
            element={
              <ProtectedRoute>
                <Grupos />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
