import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Upload, Users } from 'lucide-react';

const Home = () => {
  return (
    <div style={{ color: 'white' }}>
      
      {/* 1. HERO SECTION */}
      <div style={{ 
        textAlign: 'center', 
        padding: '100px 20px', 
        background: 'radial-gradient(circle at 50% 50%, #2a1a4a 0%, #000 100%)' 
      }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', fontWeight: '800', lineHeight: '1.2' }}>
          Your Personal <span style={{ color: '#944afb' }}>AI Tutor</span> <br /> for Every Subject.
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#aaa', maxWidth: '600px', margin: '0 auto 40px auto' }}>
          Upload your notes, PDFs, or slides and let our AI explain complex topics, summarize chapters, and answer your questions instantly.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link to="/explore">
            <button style={{ 
              padding: '15px 35px', fontSize: '1rem', background: '#646cff', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' 
            }}>
              Start Learning <ArrowRight size={20} />
            </button>
          </Link>
          
          {/* 👇 UPDATED LINK HERE */}
          <Link to="/contribute">
            <button style={{ 
              padding: '15px 35px', fontSize: '1rem', background: 'transparent', color: 'white', border: '1px solid #555', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' 
            }}>
              Contribute Notes
            </button>
          </Link>
        </div>
      </div>

      {/* 2. FEATURES GRID */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
        <FeatureCard 
          icon={<Upload size={32} color="#4cc9f0" />}
          title="Upload Anything"
          desc="PDFs, Slides, or Handwritten notes. We store them safely for you to access anytime."
        />
        <FeatureCard 
          icon={<BrainCircuit size={32} color="#944afb" />}
          title="AI-Powered Chat"
          desc="Don't just read. Chat with your notes. Ask for summaries, definitions, and quizzes."
        />
        <FeatureCard 
          icon={<Users size={32} color="#f0ad4e" />}
          title="Community Shared"
          desc="Access thousands of notes shared by other top students in your major."
        />
      </div>

    </div>
  );
};

// Helper Component for Cards
const FeatureCard = ({ icon, title, desc }) => (
  <div style={{ background: '#1a1a1a', padding: '30px', borderRadius: '15px', border: '1px solid #333', textAlign: 'left' }}>
    <div style={{ marginBottom: '20px' }}>{icon}</div>
    <h3 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>{title}</h3>
    <p style={{ color: '#aaa', lineHeight: '1.6' }}>{desc}</p>
  </div>
);

export default Home;