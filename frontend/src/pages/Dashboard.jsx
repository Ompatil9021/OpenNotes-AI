import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <h1>👤 User Dashboard</h1>
      {user ? (
        <div className="card">
          <h3>Welcome, {user.name} {user.avatar}</h3>
          <p>Role: <strong>{user.role}</strong></p>
          <button onClick={logout} style={{ backgroundColor: '#ff4444' }}>Logout</button>
        </div>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  );
};
export default Dashboard;