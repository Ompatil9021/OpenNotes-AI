import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, FileText, Send } from 'lucide-react';
import { askAI } from '../services/api'; 
import { useAuth } from '../context/AuthContext';

const StudyRoom = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // 1. SAFEGUARD: Get data from state, or default to empty object to prevent crashes
  const { fileUrl, noteId, subject } = location.state || {};

  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hi! I've read this note. Ask me anything about it." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. DEBUGGING: Log what we received
  useEffect(() => {
    console.log("StudyRoom Received Data:", { fileUrl, noteId, subject });
  }, [fileUrl, noteId, subject]);

  // 3. IF DATA IS MISSING: Show error instead of redirecting
  if (!fileUrl) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', color: 'white' }}>
        <h2>⚠️ Error Loading Note</h2>
        <p style={{ color: '#aaa', marginBottom: '20px' }}>No PDF URL was provided for this note.</p>
        <p style={{ fontSize: '0.9rem', fontFamily: 'monospace', background: '#222', padding: '10px' }}>
          Debug Info: {JSON.stringify(location.state || "No State Received")}
        </p>
        <Link to="/explore">
          <button style={{ padding: '10px 20px', background: '#646cff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Go Back
          </button>
        </Link>
      </div>
    );
  }

  // 4. FIX GOOGLE DRIVE LINKS (Convert /view -> /preview for embedding)
  // Google Drive 'webViewLink' usually ends in '/view'. We need '/preview' for iframes.
  const embedUrl = fileUrl.replace('/view', '/preview');

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Call AI API
    const aiResponse = await askAI(input, subject || "General");
    
    setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#000' }}>
      
      {/* LEFT: PDF VIEWER */}
      <div style={{ flex: 1, position: 'relative', borderRight: '1px solid #333' }}>
        
        {/* Top Bar inside PDF area */}
        <div style={{ 
          height: '50px', background: '#1a1a1a', borderBottom: '1px solid #333', 
          display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between'
        }}>
          {/* Left Side: Back Button & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/explore" style={{ textDecoration: 'none', color: '#ccc', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
              <ArrowLeft size={16} /> Back
            </Link>
            <span style={{ color: '#666', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {subject?.toUpperCase() || "STUDY MODE"}
            </span>
          </div>

          {/* Right Side: Open in New Tab Button (NEW) */}
          <a href={fileUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
             <button style={{ 
               background: '#333', color: '#ccc', border: '1px solid #555', 
               padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
               display: 'flex', alignItems: 'center', gap: '5px'
             }}>
               <FileText size={14}/> Open in New Tab
             </button>
          </a>
        </div>

        {/* The PDF Iframe */}
        <iframe 
          src={embedUrl} 
          width="100%" 
          height="100%" 
          style={{ border: 'none', background: '#222' }} 
          title="PDF Viewer"
          allow="autoplay"
        ></iframe>
      </div>

      {/* RIGHT: AI CHAT (Collapsible) */}
      <div style={{ width: chatOpen ? '400px' : '0px', transition: 'width 0.3s ease', background: '#111', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #333' }}>
        
        {/* Chat Header */}
        <div style={{ padding: '15px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="#646cff" /> AI Tutor
          </h3>
          <button onClick={() => setChatOpen(false)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}>×</button>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ 
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: m.sender === 'user' ? '#646cff' : '#222',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '12px',
              lineHeight: '1.4',
              fontSize: '0.95rem'
            }}>
              {m.text}
            </div>
          ))}
          {loading && <div style={{ color: '#666', fontSize: '0.8rem', marginLeft: '10px' }}>AI is thinking...</div>}
        </div>

        {/* Input Area */}
        <div style={{ padding: '20px', borderTop: '1px solid #333', background: '#1a1a1a' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..." 
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#0f0f0f', color: 'white', outline: 'none' }}
            />
            <button onClick={handleSend} disabled={loading} style={{ background: '#646cff', color: 'white', border: 'none', borderRadius: '8px', padding: '0 15px', cursor: 'pointer' }}>
              <Send size={18} />
            </button>
          </div>
        </div>

      </div>

      {/* Floating Toggle Button (Visible when chat is closed) */}
      {!chatOpen && (
        <button 
          onClick={() => setChatOpen(true)}
          style={{ position: 'absolute', bottom: '20px', right: '20px', padding: '15px', borderRadius: '50%', background: '#646cff', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
        >
          <MessageSquare size={24} />
        </button>
      )}

    </div>
  );
};

export default StudyRoom;