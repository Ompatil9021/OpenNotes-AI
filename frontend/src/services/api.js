import axios from 'axios';

// 👇 CHANGE THIS LINE
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
// 1. Upload Note
export const uploadNote = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

// 2. Chat with AI
export const askAI = async (question, subject) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      question: question,
      topic_id: subject || "general"
    });
    return response.data.answer;
  } catch (error) {
    console.error("AI Error:", error);
    return "Sorry, I am having trouble connecting to the brain right now.";
  }
};

// 3. Get Subjects
export const getSubjects = async (showAll = false) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/subjects?show_all=${showAll}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }
};

// 4. Request New Subject
export const requestSubject = async (data) => {
  try {
    await axios.post(`${API_BASE_URL}/request-subject`, data);
    return true;
  } catch (error) {
    console.error("Subject request failed:", error);
    return false;
  }
};

// 5. Get Admin Stats (Was Missing!)
export const getAdminStats = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/admin/stats`);
        return response.data;
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return { total_notes: 0, all_notes: [] };
    }
};

// 6. Approve Item (Note or Subject)
export const approveItem = async (type, id) => {
    try {
        // type should be "notes" or "subjects"
        const response = await axios.put(`${API_BASE_URL}/approve/${type}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error approving item:", error);
        return null;
    }
};

// 7. Delete Note
export const deleteNote = async (noteId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/notes/${noteId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting note:", error);
        return null;
    }
};

// 8. Delete Subject (Cascade)
export const deleteSubject = async (subjectId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/subjects/${subjectId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting subject:", error);
    return null;
  }
};

// 9. Subscribe to Subject (Personalization)
export const subscribeToSubject = async (data) => {
  try {
    await axios.post(`${API_BASE_URL}/subscribe`, data);
    return true;
  } catch (error) {
    console.error("Subscription failed:", error);
    return false;
  }
};

// 10. Get My Subscriptions
export const getMySubscriptions = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/subscriptions/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return [];
  }
};

// 11. Create Online Note
export const createOnlineNote = async (data) => {
  try {
    await axios.post(`${API_BASE_URL}/create-note`, data);
    return true;
  } catch (error) {
    console.error("Creation failed:", error);
    return false;
  }
};