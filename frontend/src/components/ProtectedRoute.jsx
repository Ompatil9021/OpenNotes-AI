import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a simple loading text while checking if user is logged in
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  if (!user) {
    // If not logged in, kick them back to Login page
    return <Navigate to="/login" replace />;
  }

  // If logged in, show the protected page
  return children;
};

export default ProtectedRoute;