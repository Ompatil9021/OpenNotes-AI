import { useState } from 'react';
import { subjects } from '../data/mockData';
import { Folder, FileText, Video, ChevronRight, ArrowLeft } from 'lucide-react';

const Explore = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  // 1. Reset View (Back Button Logic)
  const goBack = () => {
    if (selectedChapter) setSelectedChapter(null);
    else if (selectedSubject) setSelectedSubject(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header & Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        {(selectedSubject || selectedChapter) && (
          <button onClick={goBack} style={{ padding: '5px 10px', background: '#444' }}>
            <ArrowLeft size={16} /> Back
          </button>
        )}
        <h1>
          {!selectedSubject ? "📚 Explore Subjects" : 
           !selectedChapter ? `${selectedSubject.icon} ${selectedSubject.title}` : 
           `📖 ${selectedChapter.title}`}
        </h1>
      </div>

      {/* VIEW 1: SUBJECT LIST */}
      {!selectedSubject && (
        <div className="grid-container">
          {subjects.map(subject => (
            <div key={subject.id} className="card hover-card" onClick={() => setSelectedSubject(subject)}>
              <div style={{ fontSize: '3rem' }}>{subject.icon}</div>
              <h3>{subject.title}</h3>
              <p style={{ color: '#aaa' }}>{subject.description}</p>
              <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>{subject.chapters.length} Chapters</p>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: CHAPTER LIST */}
      {selectedSubject && !selectedChapter && (
        <div>
          <h2>Select a Chapter:</h2>
          {selectedSubject.chapters.length === 0 ? (
            <p>No chapters available yet.</p>
          ) : (
            <div className="list-container">
              {selectedSubject.chapters.map(chapter => (
                <div key={chapter.id} className="list-item" onClick={() => setSelectedChapter(chapter)}>
                  <Folder size={20} color="#646cff" />
                  <span>{chapter.title}</span>
                  <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: TOPIC/NOTES LIST */}
      {selectedChapter && (
        <div>
          <h2>📄 Topics & Notes:</h2>
          <div className="list-container">
            {selectedChapter.topics.map(topic => (
              <div key={topic.id} className="list-item">
                {topic.type === 'video' ? <Video size={20} color="orange" /> : <FileText size={20} color="#4cc9f0" />}
                <div style={{ textAlign: 'left' }}>
                  <strong>{topic.title}</strong>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: '#888' }}>Format: {topic.type.toUpperCase()}</span>
                </div>
                <button style={{ marginLeft: 'auto', padding: '5px 15px' }}>View</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;