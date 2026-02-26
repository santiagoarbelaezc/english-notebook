import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Login from './pages/auth/Login';
;
import { Dashboard } from './pages/dashboard';
import { LoadingOverlay } from './components/common/LoadingOverlay';
import './App.css';


// Componente para rutas protegidas
const ProtectedDashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay message="Autenticando..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Dashboard />
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<ProtectedDashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
