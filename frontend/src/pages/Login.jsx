import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { loginWithGoogle, loginAdmin } = useAuth();
  const navigate = useNavigate();

  // State for Admin Form
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Handle Google Login (Students)
  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle();
    if (result.success) navigate('/explore');
    else setError("Google Login Failed: " + result.message);
  };

  // Handle Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const result = await loginAdmin(email, password);
    if (result.success) navigate('/dashboard');
    else setError("Admin Login Failed: " + result.message);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '400px', padding: '40px' }}>
        <h2 style={{ marginBottom: '20px' }}>🔐 Access Portal</h2>
        
        {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

        {/* OPTION 1: GOOGLE LOGIN (DEFAULT) */}
        {!showAdminLogin ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p>Welcome back! Please sign in to access your notes.</p>
            
            <button 
              onClick={handleGoogleLogin} 
              style={{ background: 'white', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="G" />
              Continue with Google
            </button>

            <div style={{ borderTop: '1px solid #444', margin: '10px 0' }}></div>

            <button 
              onClick={() => setShowAdminLogin(true)} 
              style={{ background: 'transparent', border: '1px solid #666', fontSize: '0.9rem' }}
            >
              Admin Access
            </button>
          </div>
        ) : (
          /* OPTION 2: ADMIN FORM */
          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p><strong>Admin Login</strong></p>
            <input type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            
            <button type="submit" style={{ background: '#ff4444' }}>Login as Admin</button>
            
            <button 
              type="button" 
              onClick={() => setShowAdminLogin(false)} 
              style={{ background: 'transparent', color: '#aaa', fontSize: '0.9rem' }}
            >
              &larr; Back to Student Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;