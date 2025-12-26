import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, FileText, Video, ChevronRight, ArrowLeft } from 'lucide-react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { subjects as initialSubjects } from '../data/mockData';

const Explore = () => {
  const navigate = useNavigate();
  
  // State
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [realNotes, setRealNotes] = useState([]); 
  const [loading, setLoading] = useState(false);

  // 1. Fetch Notes from Firebase
  useEffect(() => {
    if (!selectedSubject) return;

    const fetchNotes = async () => {
      setLoading(true);
      try {
        // Filter by Subject AND Approval Status
        const q = query(
          collection(db, "notes"), 
          where("subject", "==", selectedSubject.title),
          where("is_approved", "==", true) // ✅ ONLY SHOW APPROVED
        );
        const querySnapshot = await getDocs(q);
        
        const notesList = [];
        querySnapshot.forEach((doc) => {
          notesList.push({ id: doc.id, ...doc.data() });
        });
        setRealNotes(notesList);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [selectedSubject]);

  // 2. Logic to Merge Mock Chapters with Real Notes
  const getActiveChapters = () => {
    if (!selectedSubject) return [];

    // Safety check: ensure chapters exist
    const chapters = selectedSubject.chapters ? [...selectedSubject.chapters] : [];

    realNotes.forEach(note => {
      const chapterName = note.chapter || "General Resources";
      
      let existingChapter = chapters.find(ch => ch.title === chapterName);
      
      // If chapter doesn't exist, create it
      if (!existingChapter) {
        existingChapter = { id: `ch-${Math.random()}`, title: chapterName, topics: [] };
        chapters.push(existingChapter);
      }

      // Add note to chapter
      if (!existingChapter.topics) existingChapter.topics = []; // Safety check
      
      existingChapter.topics.push({
        id: note.id,
        title: note.title,
        type: note.youtube_url ? "video" : "pdf",
        fileUrl: note.view_link,
        youtubeUrl: note.youtube_url,
        description: note.description,
        subject: note.subject 
      });
    });

    return chapters;
  };

  const activeChapters = getActiveChapters();

  // 3. Navigation Handlers
  const handleBack = () => {
    if (selectedChapter) setSelectedChapter(null);
    else {
      setSelectedSubject(null);
      setRealNotes([]);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: 'white' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        {(selectedSubject || selectedChapter) && (
          <button onClick={handleBack} style={{ padding: '5px 10px', background: '#333', border: '1px solid #555', color: 'white', cursor: 'pointer' }}>
            <ArrowLeft size={16} /> Back
          </button>
        )}
        <h1 style={{ fontSize: '1.5rem' }}>
          {!selectedSubject ? "📚 Explore Subjects" : 
           !selectedChapter ? `${selectedSubject.icon} ${selectedSubject.title}` : 
           `📖 ${selectedChapter.title}`}
        </h1>
      </div>

      {/* VIEW 1: SUBJECT LIST */}
      {!selectedSubject && (
        <div className="grid-container">
          {initialSubjects.map(subject => (
            <div key={subject.id} className="card hover-card" onClick={() => setSelectedSubject(subject)}>
              <div style={{ fontSize: '3rem' }}>{subject.icon}</div>
              <h3>{subject.title}</h3>
              <p style={{ color: '#aaa' }}>{subject.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: CHAPTER LIST */}
      {selectedSubject && !selectedChapter && (
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Select a Chapter:</h2>
          {loading ? <p>Loading notes...</p> : (
            <>
              {activeChapters.length === 0 ? (
                <p style={{ color: '#aaa' }}>No chapters found.</p>
              ) : (
                <div className="list-container">
                  {activeChapters.map(chapter => (
                    <div key={chapter.id} className="list-item" onClick={() => setSelectedChapter(chapter)}>
                      <Folder size={20} color="#646cff" />
                      <span>{chapter.title}</span>
                      <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* VIEW 3: NOTES LIST */}
      {selectedChapter && (
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>📄 Resources:</h2>
          <div className="list-container">
            {selectedChapter.topics && selectedChapter.topics.map((topic, index) => (
              <div key={index} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
                  {topic.type === 'video' ? <Video size={20} color="orange" /> : <FileText size={20} color="#4cc9f0" />}
                  <strong>{topic.title}</strong>
                  <button 
                    onClick={() => navigate('/study', { state: { note: topic } })}
                    style={{ marginLeft: 'auto', padding: '6px 12px', background: '#646cff', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                  >
                    Enter Study Room 🚀
                  </button>
                </div>
                {topic.description && <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '5px 0 0 32px' }}>{topic.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;