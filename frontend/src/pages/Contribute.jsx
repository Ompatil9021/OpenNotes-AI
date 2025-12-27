import { useState, useEffect } from 'react';
import { getSubjects, requestSubject, uploadNote } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, BookPlus, FileText, Youtube, FileType, Book } from 'lucide-react';

const Contribute = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('note'); // 'note' or 'subject'
  const [loading, setLoading] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Fetch subjects for dropdown
  useEffect(() => {
    async function load() {
      const subs = await getSubjects(false); // Only approved subjects
      setAvailableSubjects(subs);
    }
    load();
  }, []);

  // --- FORM 1: UPLOAD NOTE STATE ---
  const [noteForm, setNoteForm] = useState({ 
    title: '', 
    subject: '', 
    chapter: '', 
    description: '', 
    youtube_url: '', 
    file: null 
  });

  const handleNoteChange = (e) => {
    setNoteForm({ ...noteForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNoteForm({ ...noteForm, file: e.target.files[0] });
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteForm.file || !noteForm.subject || !noteForm.title) return alert("Missing required fields!");
    setLoading(true);
    
    const data = new FormData();
    data.append("file", noteForm.file);
    data.append("title", noteForm.title);
    data.append("subject", noteForm.subject);
    data.append("chapter", noteForm.chapter);        // ✅ Restored
    data.append("description", noteForm.description); // ✅ Restored
    data.append("youtube_url", noteForm.youtube_url); // ✅ Restored
    data.append("uploader_id", user.uid);

    try {
      await uploadNote(data);
      alert("✅ Note Uploaded! It will be visible after Admin Approval.");
      navigate('/dashboard');
    } catch (err) { alert("Error uploading."); }
    setLoading(false);
  };

  // --- FORM 2: REQUEST SUBJECT STATE ---
  const [subForm, setSubForm] = useState({ title: '', field: '', description: '' });

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await requestSubject({ ...subForm, uploader_id: user.uid });
    if (success) {
      alert("✅ Subject Requested! Admin will review it shortly.");
      setSubForm({ title: '', field: '', description: '' });
    } else {
      alert("Error requesting subject.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: 'white' }}>
      
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>🤝 Contribute to OpenNotes</h1>
      <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '40px' }}>
        Help us grow. Add notes to existing topics or propose entirely new fields.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #333' }}>
        <TabButton active={activeTab === 'note'} onClick={() => setActiveTab('note')} icon={<UploadCloud size={20}/>} label="Upload Note" />
        <TabButton active={activeTab === 'subject'} onClick={() => setActiveTab('subject')} icon={<BookPlus size={20}/>} label="Request New Subject" />
      </div>

      {/* --- CONTENT AREA --- */}
      <div style={{ background: '#1a1a1a', padding: '30px', borderRadius: '15px', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        
        {/* VIEW 1: UPLOAD NOTE (DETAILED FORM) */}
        {activeTab === 'note' && (
          <form onSubmit={handleNoteSubmit}>
            
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Note Title *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  className="form-input" 
                  name="title" 
                  placeholder="e.g. Thermodynamics Unit 1" 
                  onChange={handleNoteChange} 
                  required 
                />
                <FileText size={18} color="#666" style={{ position: 'absolute', right: '15px', top: '12px' }} />
              </div>
            </div>

            {/* Subject & Chapter Row */}
            <div style={{ display: 'flex', gap: '20px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Subject *</label>
                <div style={{ position: 'relative' }}>
                  <select className="form-select" name="subject" onChange={handleNoteChange} required>
                    <option value="">-- Choose Subject --</option>
                    {availableSubjects.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                  </select>
                  <Book size={18} color="#666" style={{ position: 'absolute', right: '15px', top: '12px', pointerEvents: 'none' }} />
                </div>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Unit / Chapter</label>
                <input 
                  className="form-input" 
                  name="chapter" 
                  placeholder="e.g. Chapter 4" 
                  onChange={handleNoteChange} 
                />
              </div>
            </div>

            {/* YouTube Link */}
            <div className="form-group">
              <label className="form-label">Reference Video URL (Optional)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  className="form-input" 
                  name="youtube_url" 
                  placeholder="https://youtube.com/watch?v=..." 
                  onChange={handleNoteChange} 
                />
                <Youtube size={18} color="#666" style={{ position: 'absolute', right: '15px', top: '12px' }} />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description / Topics Covered</label>
              <textarea 
                className="form-textarea" 
                name="description" 
                placeholder="Briefly describe the topics covered in this note..." 
                rows="3" 
                onChange={handleNoteChange}
              ></textarea>
            </div>

            {/* File Upload (Drag & Drop Style) */}
            <div className="form-group">
              <label className="form-label">PDF File *</label>
              <div className="file-drop-zone">
                  <input type="file" className="hidden-input" onChange={handleFileChange} required />                <div style={{ pointerEvents: 'none' }}>
                  <UploadCloud size={40} color="#646cff" style={{ marginBottom: '10px' }} />
                  {noteForm.file ? (
                    <div style={{ color: '#4cc9f0', fontWeight: 'bold' }}>
                      <FileType size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                      {noteForm.file.name}
                    </div>
                  ) : (
                    <>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>Click to Upload PDF</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#666' }}>Max size 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button disabled={loading} className="submit-btn">
              {loading ? "🚀 Uploading..." : "Submit Note for Review"}
            </button>
          </form>
        )}

        {/* VIEW 2: REQUEST SUBJECT */}
        {activeTab === 'subject' && (
          <form onSubmit={handleSubjectSubmit}>
            <div className="form-group">
              <label className="form-label">New Subject Name</label>
              <input 
                className="form-input"
                placeholder="e.g. Pharmaceutics"
                value={subForm.title}
                onChange={(e) => setSubForm({...subForm, title: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Field / Category</label>
              <input 
                className="form-input"
                placeholder="e.g. Pharmacy, Civil Engineering"
                value={subForm.field}
                onChange={(e) => setSubForm({...subForm, field: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="form-textarea"
                placeholder="Briefly explain what this subject covers..."
                value={subForm.description}
                onChange={(e) => setSubForm({...subForm, description: e.target.value})}
                rows={3}
              />
            </div>

            <button disabled={loading} className="submit-btn" style={{ background: '#10b981' }}>
              {loading ? "Sending..." : "Request New Subject"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

// UI Helper for Tabs
const TabButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} style={{
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    padding: '15px', background: 'transparent', border: 'none',
    borderBottom: active ? '3px solid #646cff' : '3px solid transparent',
    color: active ? 'white' : '#666', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem',
    transition: 'all 0.2s'
  }}>
    {icon} {label}
  </button>
);

export default Contribute;