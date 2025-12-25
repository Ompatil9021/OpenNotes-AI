import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>📚 Open Source Notes Hub</h1>
      <p>Learn, Share & Study with Gemini AI</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/login"><button>Login</button></Link>
        <Link to="/explore"><button style={{ marginLeft: '10px' }}>Explore Notes</button></Link>
      </div>
    </div>
  );
};
export default Home;