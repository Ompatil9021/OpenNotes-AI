import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, UploadCloud, LayoutDashboard, LogIn, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{
      height: '70px',
      background: '#1a1a1a',
      borderBottom: '1px solid #333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* 1. Logo Area */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '35px', height: '35px', background: 'linear-gradient(135deg, #646cff, #944afb)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
          ON
        </div>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>OpenNotes AI</span>
      </Link>

      {/* 2. Middle Links */}
      <div style={{ display: 'flex', gap: '30px' }}>
        <NavLink to="/explore" icon={<BookOpen size={18} />} text="Explore" />
        {/* 👇 UPDATED LINK HERE */}
        <NavLink to="/contribute" icon={<UploadCloud size={18} />} text="Contribute" />
      </div>

      {/* 3. Right Profile/Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {user ? (
          <>
            <Link to="/dashboard">
              <button style={{
                background: '#222', border: '1px solid #444', color: 'white', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
              }}>
                <LayoutDashboard size={18} /> Dashboard
              </button>
            </Link>
          </>
        ) : (
          <Link to="/login">
            <button style={{
              background: '#646cff', border: 'none', color: 'white', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <LogIn size={18} /> Login
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};

// Helper for clean links
const NavLink = ({ to, icon, text }) => (
  <Link to={to} style={{ textDecoration: 'none', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '500', transition: 'color 0.2s' }}
    onMouseEnter={(e) => e.target.style.color = '#fff'}
    onMouseLeave={(e) => e.target.style.color = '#ccc'}
  >
    {icon} {text}
  </Link>
);

export default Navbar;