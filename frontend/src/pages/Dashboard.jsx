import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, approveItem, deleteNote, getSubjects, deleteSubject } from '../services/api'; // Added getSubjects, deleteSubject
import { CheckCircle, XCircle, FileText, BookOpen, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [stats, setStats] = useState({ total_notes: 0, all_notes: [] });
  const [subjects, setSubjects] = useState([]); // List of all subjects
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState(null); // Which subject is currently open?

  useEffect(() => {
    if (user) loadAllData();
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    const data = await getAdminStats();
    setStats(data);
    
    // Fetch ALL subjects (Pending + Approved)
    const allSubs = await getSubjects(true);
    setSubjects(allSubs);
    setLoading(false);
  };

  // --- ACTIONS ---

  const handleApprove = async (type, id) => {
    if (!confirm("Confirm approval?")) return;
    await approveItem(type, id);
    loadAllData(); // Refresh
  };

  const handleReject = async (type, id) => {
    if (!confirm("Are you sure you want to delete/reject this?")) return;
    
    if (type === 'notes') {
        await deleteNote(id);
    } else {
        // If it's a pending subject rejection, we treat it as a delete
        await deleteSubject(id);
    }
    loadAllData();
  };

  // 💥 NEW: CASCADE DELETE SUBJECT
  const handleDeleteSubject = async (subject) => {
    const confirmMsg = `⚠️ WARNING: This will delete the subject "${subject.title}" AND ALL notes inside it.\n\nAre you sure?`;
    if (!confirm(confirmMsg)) return;

    const result = await deleteSubject(subject.id);
    if (result) {
        alert(result.message);
        loadAllData();
    } else {
        alert("Failed to delete subject.");
    }
  };

  // Toggle View Notes for a Subject
  const toggleSubject = (subId) => {
    if (expandedSubject === subId) setExpandedSubject(null);
    else setExpandedSubject(subId);
  };

  // Filter lists
  const pendingNotes = stats.all_notes.filter(n => !n.is_approved);
  const pendingSubjects = subjects.filter(s => !s.is_approved);
  const approvedSubjects = subjects.filter(s => s.is_approved);

  // Helper to find notes for the expanded subject
  const notesForExpanded = expandedSubject 
    ? stats.all_notes.filter(n => n.subject === subjects.find(s => s.id === expandedSubject)?.title)
    : [];

  return (
    <div style={{ padding: '40px', color: 'white', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1>🛡️ Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => navigate('/explore')} style={{ padding: '10px 20px', background: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>View Site</button>
            <button onClick={logout} style={{ padding: '10px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="stat-card">
          <h3>Total Notes</h3>
          <p>{stats.total_notes}</p>
        </div>
        <div className="stat-card">
          <h3>Active Subjects</h3>
          <p>{approvedSubjects.length}</p>
        </div>
        <div className="stat-card" style={{ borderColor: pendingNotes.length > 0 ? '#facc15' : '#333' }}>
          <h3>Pending Uploads</h3>
          <p>{pendingNotes.length}</p>
        </div>
      </div>

      {/* --- PENDING APPROVALS SECTION --- */}
      {(pendingNotes.length > 0 || pendingSubjects.length > 0) && (
        <div style={{ marginBottom: '50px' }}>
            <h2 style={{ color: '#facc15' }}>⚠️ Pending Approvals</h2>
            
            {/* Pending Notes */}
            {pendingNotes.map(note => (
                <div key={note.id} className="approval-card">
                    <div>
                        <strong>📄 {note.title}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{note.subject} • by {note.uploader_id}</div>
                        <a href={note.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#646cff', fontSize: '0.8rem' }}>View File</a>
                    </div>
                    <div className="actions">
                        <button onClick={() => handleApprove('notes', note.id)} className="btn-approve"><CheckCircle size={18}/></button>
                        <button onClick={() => handleReject('notes', note.id)} className="btn-reject"><XCircle size={18}/></button>
                    </div>
                </div>
            ))}

            {/* Pending Subjects */}
            {pendingSubjects.map(sub => (
                <div key={sub.id} className="approval-card">
                    <div>
                        <strong>📚 New Subject: {sub.title} ({sub.code})</strong>
                        <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Field: {sub.field}</div>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>"{sub.description}"</div>
                    </div>
                    <div className="actions">
                        <button onClick={() => handleApprove('subjects', sub.id)} className="btn-approve"><CheckCircle size={18}/></button>
                        <button onClick={() => handleReject('subjects', sub.id)} className="btn-reject"><XCircle size={18}/></button>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* --- CONTENT MANAGEMENT SECTION --- */}
      <div>
        <h2>🗂️ Manage Content</h2>
        <p style={{ color: '#aaa', marginBottom: '20px' }}>Expand a subject to view its notes or delete the entire subject.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {approvedSubjects.map(sub => (
                <div key={sub.id} style={{ background: '#1a1a1a', borderRadius: '8px', border: '1px solid #333', overflow: 'hidden' }}>
                    
                    {/* Subject Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: '#222' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontSize: '1.5rem' }}>{sub.icon || "📚"}</span>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{sub.title} <span style={{color:'#666', fontSize:'0.9rem'}}>({sub.code})</span></div>
                                <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{sub.field}</div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <button 
                                onClick={() => toggleSubject(sub.id)}
                                style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                {expandedSubject === sub.id ? "Hide Notes" : "View Notes"} 
                                {expandedSubject === sub.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                            </button>
                            
                            <button 
                                onClick={() => handleDeleteSubject(sub)}
                                style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                <Trash2 size={16}/> Delete Subject
                            </button>
                        </div>
                    </div>

                    {/* Expanded Notes List */}
                    {expandedSubject === sub.id && (
                        <div style={{ padding: '20px', borderTop: '1px solid #333', background: '#111' }}>
                            <h4 style={{ marginTop: 0, color: '#666' }}>Notes in {sub.title}:</h4>
                            
                            {notesForExpanded.length === 0 ? (
                                <p style={{ color: '#444', fontStyle: 'italic' }}>No notes found in this subject.</p>
                            ) : (
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {notesForExpanded.map(note => (
                                        <div key={note.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#222', borderRadius: '4px', border: '1px solid #333' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <FileText size={16} color="#646cff" />
                                                <span>{note.title}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#666', background: '#111', padding: '2px 6px', borderRadius: '4px' }}>{note.topic || "General"}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleReject('notes', note.id)} 
                                                style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                title="Delete Note"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            ))}
        </div>
      </div>

      <style>{`
        .stat-card { background: #1a1a1a; padding: 20px; borderRadius: 10px; border: 1px solid #333; textAlign: center; }
        .stat-card h3 { margin: 0 0 10px 0; color: #aaa; font-size: 1rem; }
        .stat-card p { margin: 0; font-size: 2rem; font-weight: bold; }
        
        .approval-card { display: flex; justifyContent: space-between; alignItems: center; background: #222; padding: 15px; margin-bottom: 10px; borderRadius: 8px; border-left: 4px solid #facc15; }
        .actions { display: flex; gap: 10px; }
        .btn-approve { background: #10b981; color: white; border: none; padding: 8px; borderRadius: 5px; cursor: pointer; }
        .btn-reject { background: #ef4444; color: white; border: none; padding: 8px; borderRadius: 5px; cursor: pointer; }
      `}</style>

    </div>
  );
};

export default Dashboard;