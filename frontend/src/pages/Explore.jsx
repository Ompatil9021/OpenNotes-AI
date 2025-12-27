import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSubjects, getMySubscriptions, subscribeToSubject } from '../services/api';
import { Search, Plus, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Firestore for fetching notes
import { collection, query, where, getDocs } from 'firebase/firestore'; 
import { db } from '../services/firebase'; 

const Explore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [mySubjects, setMySubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]); 
  const [searchResults, setSearchResults] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Selected Subject State
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    // 1. Get User's Personal List
    const subs = await getMySubscriptions(user.uid);
    setMySubjects(subs);

    // 2. Get All Available Subjects (for search later)
    const all = await getSubjects(false); 
    setAllSubjects(all);
    setLoading(false);
  };

  // Search Logic
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term.trim() === "") {
      setSearchResults([]);
    } else {
      const filtered = allSubjects.filter(sub => 
        sub.title.toLowerCase().includes(term) || 
        sub.field.toLowerCase().includes(term)
      );
      setSearchResults(filtered);
    }
  };

  const handleAddSubject = async (subject) => {
    await subscribeToSubject({
      user_id: user.uid,
      subject_id: subject.id,
      subject_title: subject.title,
      subject_desc: subject.description,
      subject_icon: subject.icon || "📚"
    });
    loadData();
    setIsAdding(false);
    setSearchTerm("");
  };

  const handleSelectSubject = async (subject) => {
    setSelectedSubject(subject);
    const q = query(
      collection(db, "notes"), 
      where("subject", "==", subject.title),
      where("is_approved", "==", true)
    );
    const snapshot = await getDocs(q);
    setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>📚 My Subjects</h1>
          <p style={{ color: '#aaa' }}>Select a subject to view notes.</p>
        </div>
        
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#646cff', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            <Plus size={18} /> Add Subject
          </button>
        )}
      </div>

      {/* --- ADD SUBJECT MODE --- */}
      {isAdding && (
        <div style={{ background: '#1a1a1a', padding: '30px', borderRadius: '15px', border: '1px solid #333', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>🔍 Find a Subject</h3>
            <button onClick={() => setIsAdding(false)} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}>Cancel</button>
          </div>

          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={20} color="#666" style={{ position: 'absolute', left: '15px', top: '12px' }} />
            <input 
              autoFocus
              placeholder="Type to search..."
              value={searchTerm}
              onChange={handleSearch}
              style={{ width: '100%', padding: '12px 12px 12px 45px', background: '#0f0f0f', color: 'white', border: '1px solid #333', borderRadius: '8px', fontSize: '1rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {searchTerm && searchResults.length === 0 && <p style={{ color: '#666' }}>No subjects found.</p>}
            
            {searchResults.map(sub => {
              const isAlreadyAdded = mySubjects.some(m => m.id === sub.id);
              return (
                <div key={sub.id} style={{ background: '#222', padding: '15px', borderRadius: '8px', border: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontWeight: 'bold' }}>{sub.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{sub.field}</div>
                  
                  {isAlreadyAdded ? (
                    <button disabled style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      <CheckCircle size={14}/> Added
                    </button>
                  ) : (
                    <button onClick={() => handleAddSubject(sub)} style={{ background: '#646cff', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>
                      + Add to My List
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- MY SUBJECTS LIST --- */}
      {!selectedSubject ? (
        <>
          {mySubjects.length === 0 && !loading && !isAdding ? (
            <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed #333', borderRadius: '15px', color: '#666' }}>
              <BookOpen size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
              <h2>Your library is empty.</h2>
              <p>Click "Add Subject" to start building your personal curriculum.</p>
            </div>
          ) : (
            <div className="grid-container">
              {mySubjects.map((subject) => (
                <div key={subject.id} className="card" onClick={() => handleSelectSubject(subject)}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{subject.icon}</div>
                  <h3 style={{ marginBottom: '10px' }}>{subject.title}</h3>
                  <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{subject.description}</p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* --- VIEW NOTES FOR SELECTED SUBJECT --- */
        <div>
          <button onClick={() => setSelectedSubject(null)} style={{ marginBottom: '20px', background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            ← Back to Subjects
          </button>
          
          <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '15px' }}>Notes for {selectedSubject.title}</h2>
          
          <div className="list-container">
            {notes.length === 0 ? <p style={{ color: '#666' }}>No notes found for this subject yet.</p> : notes.map((note) => (
              <div key={note.id} className="list-item">
                <div style={{ flex: 1 }}>
                   <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{note.title}</div>
                   <div style={{ color: '#888', fontSize: '0.9rem' }}>{note.chapter || "General"} • {note.description}</div>
                </div>
                
                {/* 👇 UPDATED BUTTON LOGIC HERE */}
                {note.fileUrl ? (
                  <Link 
                    to="/study" 
                    state={{ fileUrl: note.fileUrl, noteId: note.id, subject: note.subject }}
                    style={{ textDecoration: 'none' }}
                  >
                    <button style={{ 
                      padding: '10px 25px', 
                      background: 'linear-gradient(135deg, #646cff, #944afb)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '30px', 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'transform 0.2s'
                    }}>
                      Enter Study Room <ArrowRight size={16}/>
                    </button>
                  </Link>
                ) : (
                  <button disabled style={{ padding: '8px 20px', background: '#333', color: '#666', border: 'none', borderRadius: '30px', cursor: 'not-allowed' }}>
                    No PDF Available
                  </button>
                )}

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Explore;