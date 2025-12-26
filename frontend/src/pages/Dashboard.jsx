import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserNotes, deleteNote, getAdminData, getSubjects, approveItem } from '../services/api';
import { Trash2, FileText, Video, ShieldAlert, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  // State
  const [pendingSubjects, setPendingSubjects] = useState([]);   
  const [myNotes, setMyNotes] = useState([]);
  const [adminData, setAdminData] = useState({ total_notes: 0, all_notes: [] });
  const [loading, setLoading] = useState(true);

  // Check if current user is Admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    if (isAdmin) {
      // 🛡️ Admin: Fetch Everything (Notes)
      const data = await getAdminData();
      setAdminData(data);

      // 🛡️ Admin: Fetch Pending Subjects
      const allSubs = await getSubjects(true); // true = show all (including unapproved)
      setPendingSubjects(allSubs.filter(s => !s.is_approved));
    } else {
      // 🎓 Student: Fetch Only My Notes
      const notes = await getUserNotes(user.uid);
      setMyNotes(notes);
    }
    setLoading(false);
  };

  const handleDelete = async (noteId) => {
    if (confirm("⚠️ Warning: Are you sure you want to delete this content?")) {
      const success = await deleteNote(noteId);
      if (success) {
        if (isAdmin) {
          // Update Admin List
          setAdminData(prev => ({
            ...prev,
            all_notes: prev.all_notes.filter(n => n.id !== noteId),
            total_notes: prev.total_notes - 1
          }));
        } else {
          // Update User List
          setMyNotes(myNotes.filter(n => n.id !== noteId));
        }
      } else {
        alert("Failed to delete.");
      }
    }
  };

  // 🆕 Approve Function
  const handleApprove = async (type, id) => {
    if(confirm("Approve this item? It will become public.")) {
      await approveItem(type, id);
      loadData(); // Refresh the list
    }
  };

  const getInitial = () => user?.name ? user.name.charAt(0).toUpperCase() : "U";

  // Filter Pending Notes for Admin View
  const pendingNotes = isAdmin ? adminData.all_notes.filter(n => !n.is_approved) : [];

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: 'white' }}>
      
      {/* 1. Header Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', background: '#222', padding: '20px', borderRadius: '10px', border: isAdmin ? '1px solid #ff4444' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          {/* Profile Badge */}
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '50%', 
            background: isAdmin ? '#b91c1c' : 'linear-gradient(135deg, #646cff, #944afb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '28px', fontWeight: 'bold', color: 'white', border: '2px solid #fff'
          }}>
            {getInitial()}
          </div>

          <div>
            <h2 style={{ margin: 0 }}>
              {user?.name} {isAdmin && <ShieldAlert size={20} color="red" style={{marginLeft: '10px'}}/>}
            </h2>
            <p style={{ margin: 0, color: '#aaa' }}>{user?.email}</p>
            <span style={{ fontSize: '0.8rem', background: isAdmin ? '#7f1d1d' : '#444', color: isAdmin ? '#fecaca' : 'white', padding: '2px 8px', borderRadius: '4px', marginTop: '5px', display: 'inline-block' }}>
              {isAdmin ? "System Administrator" : "Student Contributor"}
            </span>
          </div>
        </div>
        
        <button onClick={logout} style={{ background: '#ff4444', border: 'none', padding: '10px 20px', color: 'white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Logout
        </button>
      </div>

      {/* 2. ADMIN VIEW 🛡️ */}
      {isAdmin && (
        <div>
          <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>🛡️ Admin Control Panel</h3>
          
          {/* --- 🆕 SECTION 1: PENDING NOTES (Orange) --- */}
          {pendingNotes.length > 0 && (
            <div style={{ marginBottom: '40px', border: '1px solid #f97316', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: '#431407', padding: '15px', color: '#fdba74', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📝 Pending Note Uploads ({pendingNotes.length})
              </div>
              <table style={{ width: '100%', textAlign: 'left', background: '#1a1a1a', borderCollapse: 'collapse' }}>
                <tbody>
                  {pendingNotes.map(note => (
                    <tr key={note.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '15px' }}>
                        <strong>{note.title}</strong> <br/>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{note.subject}</span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <a href={note.fileUrl} target="_blank" rel="noreferrer" style={{color: '#4cc9f0', textDecoration:'none'}}>View PDF</a>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleApprove('notes', note.id)}
                          style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button 
                          onClick={() => handleDelete(note.id)}
                          style={{ background: '#3a0000', color: '#ff4444', border: '1px solid #500', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* --- SECTION 2: PENDING SUBJECTS (Yellow) --- */}
          {pendingSubjects.length > 0 && (
            <div style={{ marginBottom: '40px', border: '1px solid #eab308', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: '#422006', padding: '15px', color: '#fca5a5', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                ⚠️ Pending Subject Requests ({pendingSubjects.length})
              </div>
              <table style={{ width: '100%', textAlign: 'left', background: '#1a1a1a', borderCollapse: 'collapse' }}>
                <tbody>
                  {pendingSubjects.map(sub => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '15px' }}>
                        <strong>{sub.title}</strong> <br/>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{sub.field}</span>
                      </td>
                      <td style={{ padding: '15px' }}>{sub.description}</td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleApprove('subjects', sub.id)}
                          style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* --- Stats --- */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
             <div style={{ background: '#333', padding: '20px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
               <h2 style={{ margin: 0, color: '#4cc9f0' }}>{adminData.total_notes}</h2>
               <p style={{ margin: 0, color: '#ccc' }}>Total Notes on Platform</p>
             </div>
             <div style={{ background: '#333', padding: '20px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
                <h2 style={{ margin: 0, color: '#f0ad4e' }}>Active</h2>
                <p style={{ margin: 0, color: '#ccc' }}>System Status</p>
             </div>
          </div>

          <h4>All User Uploads:</h4>
          {loading ? <p>Scanning database...</p> : (
            <Table notes={adminData.all_notes} handleDelete={handleDelete} isAdmin={true} />
          )}
        </div>
      )}

      {/* 3. STUDENT VIEW 🎓 */}
      {!isAdmin && (
        <div>
          <h3>📂 My Contributions ({myNotes.length})</h3>
          {loading ? <p>Loading your notes...</p> : (
            <Table notes={myNotes} handleDelete={handleDelete} isAdmin={false} />
          )}
        </div>
      )}

    </div>
  );
};

// 🛠️ Reusable Table Component
const Table = ({ notes, handleDelete, isAdmin }) => {
  if (notes.length === 0) return <p style={{ color: '#666', fontStyle: 'italic' }}>No records found.</p>;

  return (
    <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #333' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#1a1a1a' }}>
        <thead>
          <tr style={{ background: '#333', color: '#ccc' }}>
            <th style={{ padding: '15px' }}>Title</th>
            <th style={{ padding: '15px' }}>Subject</th>
            {isAdmin && <th style={{ padding: '15px' }}>Uploader ID</th>}
            <th style={{ padding: '15px' }}>Type</th>
            <th style={{ padding: '15px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {notes.map(note => (
            <tr key={note.id} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '15px', fontWeight: 'bold' }}>{note.title}</td>
              <td style={{ padding: '15px' }}>{note.subject}</td>
              {isAdmin && <td style={{ padding: '15px', fontSize: '0.8rem', color: '#888' }}>{note.uploader_id?.substring(0, 8)}...</td>}
              <td style={{ padding: '15px' }}>
                 {note.youtube_url ? <Video size={16} color="orange"/> : <FileText size={16} color="#4cc9f0"/>}
              </td>
              <td style={{ padding: '15px' }}>
                <button 
                  onClick={() => handleDelete(note.id)} 
                  style={{ background: '#3a0000', color: '#ff4444', border: '1px solid #500', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;