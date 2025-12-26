import axios from 'axios';

// Ensure this matches your backend URL
const API_BASE_URL = "http://127.0.0.1:8000";

// 1. Chat with AI
export const askAI = async (question, subject) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      question: question,
      subject: subject
    });
    return response.data.answer;
  } catch (error) {
    console.error("AI Error:", error);
    return "Sorry, I am having trouble connecting to the brain right now.";
  }
};

// 2. Upload a Note
export const uploadNote = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
};

// 3. Get User's Notes (Dashboard)
export const getUserNotes = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/my-notes/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user notes:", error);
    return [];
  }
};

// 4. Delete a Note
export const deleteNote = async (noteId) => {
  try {
    await axios.delete(`${API_BASE_URL}/notes/${noteId}`);
    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
    return false;
  }
};

// 5. Get Admin Stats & All Notes
export const getAdminData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return { total_notes: 0, all_notes: [] };
  }
};

// 6. Get All Subjects (Dynamic)
export const getSubjects = async (isAdmin = false) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/subjects?show_all=${isAdmin}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }
};

// 7. Request New Subject
export const requestSubject = async (data) => {
  try {
    await axios.post(`${API_BASE_URL}/request-subject`, data);
    return true;
  } catch (error) {
    console.error("Subject request failed:", error);
    return false;
  }
};

// 8. Approve Item (Admin)
export const approveItem = async (type, id) => {
  // type must be 'notes' or 'subjects'
  try {
    await axios.put(`${API_BASE_URL}/approve/${type}/${id}`);
    return true;
  } catch (error) {
    console.error("Approval failed:", error);
    return false;
  }
};