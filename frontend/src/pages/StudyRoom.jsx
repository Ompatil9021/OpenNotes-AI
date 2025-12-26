import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Video, ArrowLeft, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { askAI } from '../services/api';

const StudyRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const note = location.state?.note;

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [chatHistory, setChatHistory] = useState([
    { sender: "ai", text: "Hi! I've read this note. Ask me anything about it." }
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!note) navigate('/explore');
  }, [note, navigate]);

  if (!note) return null;

  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("/preview")) return url;
    if (url.includes("/view")) return url.replace("/view", "/preview");
    return url;
  };

  const handleAskAI = async () => {
    if (!question.trim()) return;
    const newHistory = [...chatHistory, { sender: "user", text: question }];
    setChatHistory(newHistory);
    setQuestion("");
    setLoading(true);

    const answer = await askAI(question, note.subject);

    setChatHistory([...newHistory, { sender: "ai", text: answer }]);
    setLoading(false);
  };

  return (
    // 🔒 SUPER CONTAINER: Fixed Position locks it to the viewport (No Page Scrollbars)
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      background: '#000',
      overflow: 'hidden' // Double safety
    }}>
      
      {/* --- HEADER (Fixed Height: 50px) --- */}
      <div style={{ 
        height: '50px', 
        minHeight: '50px', // Prevent crushing
        padding: '0 20px', 
        background: '#1a1a1a', 
        borderBottom: '1px solid #333', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => navigate('/explore')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ccc' }}>
            <ArrowLeft size={20} />
          </button>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>{note.title}</h3>
          <span style={{ fontSize: '0.8rem', background: '#333', padding: '2px 8px', borderRadius: '4px', color: '#aaa' }}>{note.subject}</span>
        </div>

        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#646cff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
          >
            <PanelRightOpen size={18} /> Open Tools
          </button>
        )}
      </div>

      {/* --- SPLIT CONTENT (Takes Remaining Height) --- */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        width: '100%', 
        overflow: 'hidden' // Ensures children don't push boundaries
      }}>
        
        {/* 1. PDF VIEWER (Left Side) */}
        <div style={{ 
          // 75% Width if sidebar is open, 100% if closed
          flex: isSidebarOpen ? '0 0 75%' : '0 0 100%',
          maxWidth: isSidebarOpen ? '75%' : '100%',
          height: '100%', 
          background: '#000',
          transition: 'all 0.2s ease-in-out'
        }}>
          <iframe 
            src={getEmbedUrl(note.fileUrl)} 
            width="100%" 
            height="100%" 
            style={{ border: 'none', display: 'block' }}
            title="PDF Viewer"
          ></iframe>
        </div>

        {/* 2. SIDEBAR (Right Side) */}
        {isSidebarOpen && (
          <div style={{ 
            // 25% Width strictly
            flex: '0 0 25%',
            maxWidth: '25%', 
            height: '100%',
            background: '#222', 
            borderLeft: '1px solid #333',
            display: 'flex', 
            flexDirection: 'column',
            boxSizing: 'border-box'
          }}>
            
            {/* Sidebar Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid #444', background: '#2a2a2a', minHeight: '45px' }}>
              <span style={{ fontWeight: 'bold', color: '#4cc9f0', fontSize: '0.9rem' }}>Study Mode</span>
              <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#aaa' }} title="Close">
                <PanelRightClose size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #444', minHeight: '40px' }}>
              <button 
                onClick={() => setActiveTab('chat')}
                style={{ flex: 1, background: activeTab === 'chat' ? '#333' : 'transparent', border: 'none', cursor: 'pointer', color: activeTab === 'chat' ? 'white' : '#888', fontWeight: 'bold', fontSize: '0.9rem' }}
              >
                Chat
              </button>
              
              {note.youtubeUrl && (
                <button 
                  onClick={() => setActiveTab('video')}
                  style={{ flex: 1, background: activeTab === 'video' ? '#333' : 'transparent', border: 'none', cursor: 'pointer', color: activeTab === 'video' ? 'white' : '#888', fontWeight: 'bold', fontSize: '0.9rem' }}
                >
                  Video
                </button>
              )}
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column' }}>
              
              {/* CHAT TAB */}
              {activeTab === 'chat' && (
                <>
                  <div style={{ flex: 1, overflowY: 'auto', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {chatHistory.map((msg, i) => (
                      <div key={i} style={{ 
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        background: msg.sender === 'user' ? '#646cff' : '#333',
                        color: 'white',
                        padding: '10px 12px', 
                        borderRadius: '10px', 
                        maxWidth: '90%', 
                        fontSize: '0.85rem',
                        lineHeight: '1.4',
                        wordWrap: 'break-word' // Prevents long words breaking layout
                      }}>
                        <strong>{msg.sender === 'ai' ? '🤖 ' : '👤 '}</strong>
                        {msg.text}
                      </div>
                    ))}
                    {loading && <div style={{ color: '#888', fontStyle: 'italic', fontSize: '0.8rem' }}>AI is thinking...</div>}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', paddingBottom: '10px' }}>
                    <input 
                      value={question} 
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                      placeholder="Ask AI..." 
                      style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1a1a1a', color: 'white', outline: 'none', fontSize: '0.9rem' }}
                    />
                    <button 
                      onClick={handleAskAI} 
                      disabled={loading} 
                      style={{ background: '#646cff', border: 'none', borderRadius: '4px', padding: '0 15px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
                    >
                      Send
                    </button>
                  </div>
                </>
              )}

              {/* VIDEO TAB */}
              {activeTab === 'video' && note.youtubeUrl && (
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <iframe 
                    width="100%" 
                    height="200" 
                    src={note.youtubeUrl.replace("watch?v=", "embed/")} 
                    title="YouTube video" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    style={{ borderRadius: '8px' }}
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudyRoom;