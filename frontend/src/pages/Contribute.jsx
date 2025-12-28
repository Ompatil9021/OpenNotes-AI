import { useState, useEffect } from 'react';
import { getSubjects, requestSubject, uploadNote, createOnlineNote } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, PenTool, BookPlus, CheckCircle } from 'lucide-react';

const Contribute = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'write', 'subject'
  const [loading, setLoading] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Load subjects for the dropdown
  useEffect(() => {
    async function load() {
      const subs = await getSubjects(false);
      setAvailableSubjects(subs);
    }
    load();
  }, []);

  // --- STATE FOR UPLOAD & WRITE ---
  const [meta, setMeta] = useState({ 
    title: '', subject: '', course: '', topic: '', tags: '', academic_level: '', description: '', youtube_url: '' 
  });
  const [file, setFile] = useState(null);
  const [editorContent, setEditorContent] = useState('');

  // --- STATE FOR SUBJECT REQUEST (RESTORED) ---
// Change this line:
const [subjectForm, setSubjectForm] = useState({ title: '', code: '', field: '', description: '' });
  // --- HANDLERS ---
  const handleMetaChange = (e) => setMeta({ ...meta, [e.target.name]: e.target.value });

  // 1. Handle File Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file || !meta.subject || !meta.title) return alert("Missing file or title!");
    setLoading(true);
    
    const data = new FormData();
    data.append("file", file);
    Object.keys(meta).forEach(key => data.append(key, meta[key]));
    data.append("uploader_id", user.uid);

    try {
      await uploadNote(data);
      alert("✅ Uploaded successfully! Waiting for approval.");
      navigate('/dashboard');
    } catch (err) { alert("Error uploading."); }
    setLoading(false);
  };

  // 2. Handle Online Note Creation
  const handleWriteSubmit = async (e) => {
    e.preventDefault();
    if (!editorContent || !meta.subject || !meta.title) return alert("Missing content!");
    setLoading(true);

    try {
      await createOnlineNote({
        ...meta,
        content: editorContent,
        uploader_id: user.uid
      });
      alert("✅ Note Created! Waiting for approval.");
      navigate('/dashboard');
    } catch (err) { alert("Error saving."); }
    setLoading(false);
  };

  // 3. Handle Subject Request (RESTORED)
  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!subjectForm.title || !subjectForm.field) return alert("Please fill all fields");
    setLoading(true);
    const success = await requestSubject({ ...subjectForm, uploader_id: user.uid });

    try {
      await requestSubject({ ...subjectForm, uploader_id: user.uid });
      alert("✅ Subject requested! Admin will review it.");
      setSubjectForm({ title: '', field: '', description: '' }); // Reset form
      setActiveTab('upload'); // Switch back to main tab
    } catch (error) {
      console.error(error);
      alert("Failed to request subject.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', color: 'white' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>🚀 Contribute Knowledge</h1>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', justifyContent: 'center' }}>
        <TabBtn active={activeTab === 'upload'} onClick={() => setActiveTab('upload')} icon={<UploadCloud/>} label="Upload File" />
        <TabBtn active={activeTab === 'write'} onClick={() => setActiveTab('write')} icon={<PenTool/>} label="Write Online" />
        <TabBtn active={activeTab === 'subject'} onClick={() => setActiveTab('subject')} icon={<BookPlus/>} label="Request Subject" />
      </div>

      <div style={{ background: '#1a1a1a', padding: '30px', borderRadius: '15px', border: '1px solid #333' }}>
        
        {/* === META DATA FORM (Used by both Upload & Write) === */}
        {(activeTab === 'upload' || activeTab === 'write') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="full-width" style={{ gridColumn: 'span 2' }}>
              <label className="lbl">Title *</label>
              <input className="inp" name="title" onChange={handleMetaChange} placeholder="e.g. Thermodynamics formulas" required />
            </div>

            <div>
              <label className="lbl">Subject *</label>
              <select className="inp" name="subject" onChange={handleMetaChange} required>
                <option value="">-- Select Subject --</option>
                {availableSubjects.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
              </select>
            </div>

            <div>
              <label className="lbl">Academic Level</label>
              <select className="inp" name="academic_level" onChange={handleMetaChange}>
                <option value="">-- Select Level --</option>
                <option value="High School">High School</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Graduate">Graduate</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div>
              <label className="lbl">Course Code</label>
              <input className="inp" name="course" onChange={handleMetaChange} placeholder="e.g. CS101" />
            </div>

            <div>
              <label className="lbl">Topic / Unit</label>
              <input className="inp" name="topic" onChange={handleMetaChange} placeholder="e.g. Recursion" />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label className="lbl">Tags (comma separated)</label>
              <input className="inp" name="tags" onChange={handleMetaChange} placeholder="e.g. exam, formula, 2024, important" />
            </div>
            
            <div style={{ gridColumn: 'span 2' }}>
              <label className="lbl">Description (Optional)</label>
              <input className="inp" name="description" onChange={handleMetaChange} placeholder="Brief summary of the note..." />
            </div>
          </div>
        )}

        {/* === TAB 1: UPLOAD === */}
        {activeTab === 'upload' && (
          <form onSubmit={handleUploadSubmit}>
            <div className="drop-zone" style={{ border: '2px dashed #444', padding: '40px', textAlign: 'center', marginBottom: '20px', borderRadius: '10px' }}>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} id="fileup" />
              <label htmlFor="fileup" style={{ cursor: 'pointer' }}>
                <UploadCloud size={40} color="#646cff" />
                <p style={{ marginTop: '10px' }}>{file ? file.name : "Click to select PDF, DOCX, PPT, or Image"}</p>
              </label>
            </div>
            <button className="btn-primary" disabled={loading}>{loading ? "Uploading..." : "Submit File"}</button>
          </form>
        )}

        {/* === TAB 2: WRITE ONLINE === */}
        {activeTab === 'write' && (
          <form onSubmit={handleWriteSubmit}>
            <label className="lbl">Content (Markdown Supported)</label>
            <textarea 
              style={{ width: '100%', height: '300px', background: '#0f0f0f', color: '#ddd', padding: '15px', border: '1px solid #333', borderRadius: '8px', fontFamily: 'monospace' }}
              placeholder="# My Note Title&#10;Write your notes here..."
              onChange={(e) => setEditorContent(e.target.value)}
            ></textarea>
            <button className="btn-primary" style={{ marginTop: '20px' }} disabled={loading}>{loading ? "Saving..." : "Create Note"}</button>
          </form>
        )}

        {/* === TAB 3: REQUEST SUBJECT (RESTORED) === */}
        {activeTab === 'subject' && (
           <form onSubmit={handleSubjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div style={{ background: '#222', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #646cff' }}>
               <h3 style={{ margin: '0 0 10px 0' }}>Request a New Subject</h3>
               <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>
                 Can't find your subject in the list? Request it here! Once an Admin approves it, it will appear for everyone.
               </p>
             </div>

             <div>
               <label className="lbl">Subject Name</label>
               <input 
                 className="inp" 
                 value={subjectForm.title}
                 onChange={(e) => setSubjectForm({...subjectForm, title: e.target.value})}
                 placeholder="e.g. Artificial Intelligence" 
                 required 
               />
             </div>
             <div>
               <label className="lbl">Subject Code</label>
               <input 
                 className="inp" 
                 value={subjectForm.code}
                 onChange={(e) => setSubjectForm({...subjectForm, code: e.target.value})}
                 placeholder="e.g. CS305" 
                 required 
               />
             </div>

             <div>
               <label className="lbl">Field / Category</label>
               <input 
                 className="inp" 
                 value={subjectForm.field}
                 onChange={(e) => setSubjectForm({...subjectForm, field: e.target.value})}
                 placeholder="e.g. Engineering, Arts, Science" 
                 required 
               />
             </div>

             <div>
               <label className="lbl">Description</label>
               <textarea 
                 className="inp" 
                 value={subjectForm.description}
                 onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})}
                 placeholder="What is this subject about?" 
                 rows="3"
               />
             </div>

             <button className="btn-primary" disabled={loading}>
               {loading ? "Sending..." : "Request Subject"}
             </button>
           </form>
        )}

      </div>

      {/* STYLES */}
      <style>{`
        .lbl { display: block; margin-bottom: 5px; color: #aaa; font-size: 0.9rem; }
        .inp { width: 100%; padding: 10px; background: #222; border: 1px solid #333; color: white; borderRadius: 5px; }
        .btn-primary { width: 100%; padding: 12px; background: #646cff; color: white; border: none; borderRadius: 5px; font-weight: bold; cursor: pointer; }
        .btn-primary:hover { background: #535bf2; }
      `}</style>
    </div>
  );
};

const TabBtn = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
    background: active ? '#646cff' : '#222', color: active ? 'white' : '#aaa',
    border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold'
  }}>
    {icon} {label}
  </button>
);

export default Contribute;