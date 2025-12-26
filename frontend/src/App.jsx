import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Contribute from './pages/Contribute';
import Explore from './pages/Explore';
import StudyRoom from './pages/StudyRoom';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation();
  
  // Optional: Hide Navbar/Footer in Study Room for Full Immersion?
  // Let's hide them only on /study so the "Fixed Layout" works perfectly.
  const isStudyRoom = location.pathname === '/study';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#000' }}>
      
      {/* Show Navbar everywhere EXCEPT Study Room */}
      {!isStudyRoom && <Navbar />}

      {/* Main Content Area */}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/explore" element={<Explore />} />
          
          {/* Protected Routes */}
          <Route path="/contribute" element={<ProtectedRoute><Contribute /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* Study Room (Has its own internal layout) */}
          <Route path="/study" element={<ProtectedRoute><StudyRoom /></ProtectedRoute>} />
        </Routes>
      </div>

      {/* Show Footer everywhere EXCEPT Study Room */}
      {!isStudyRoom && <Footer />}
      
    </div>
  );
}

export default App;