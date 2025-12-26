import os
import io
import uvicorn
import uuid
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel  # <--- THIS WAS MISSING
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import firebase_admin
from firebase_admin import credentials, firestore
import PyPDF2
from google import genai
from dotenv import load_dotenv

# --- 1. CONFIGURATION (LOAD KEYS FIRST) ---

# Load environment variables from .env file
load_dotenv()

GOOGLE_DRIVE_FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Check if keys exist
if not GEMINI_API_KEY or not GOOGLE_DRIVE_FOLDER_ID:
    raise ValueError("❌ Missing Keys! Make sure the .env file exists and contains GEMINI_API_KEY and GOOGLE_DRIVE_FOLDER_ID.")

# Configure AI Client (After loading key)
ai_client = genai.Client(api_key=GEMINI_API_KEY)

# Service Account Scopes
SCOPES = ['https://www.googleapis.com/auth/drive.file']

# --- 2. SETUP SERVICES ---

if not os.path.exists("serviceAccountKey.json"):
    print("⚠️ WARNING: serviceAccountKey.json not found. Database will fail.")
else:
    try:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
        print("✅ Firebase Database Connected!")
    except ValueError:
        pass 

db = firestore.client()

def get_drive_service():
    if not os.path.exists('token.json'):
        raise Exception("❌ token.json not found. Run setup_drive.py first.")
    creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    return build('drive', 'v3', credentials=creds)
    # Initialize the global variable so the upload function can use it
drive_service = get_drive_service()

# --- 3. HELPER FUNCTIONS ---

def extract_text_from_pdf(file_bytes):
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

# --- 4. APP API ---
app = FastAPI(title="OpenNotes AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 5. UPDATED UPLOAD ENDPOINT ---
@app.post("/upload")
async def upload_note(
    file: UploadFile = File(...),
    title: str = Form(...),
    subject: str = Form(...),
    chapter: str = Form(None),
    description: str = Form(None),
    youtube_url: str = Form(None),
    uploader_id: str = Form(...)
):
    try:
        # 1. Create a safe filename
        safe_filename = f"{uuid.uuid4()}_{file.filename}"
        
        # 2. Upload to Google Drive
        file_content = await file.read()
        # Create a temp file to upload
        with open(safe_filename, "wb") as f:
            f.write(file_content)
            
        g_file = drive_service.files().create(
            body={'name': safe_filename, 'parents': [GOOGLE_DRIVE_FOLDER_ID]},
            media_body=MediaIoBaseUpload(io.BytesIO(file_content), mimetype='application/pdf'),
            fields='id, webViewLink'
        ).execute()
        
        # Clean up temp file
        os.remove(safe_filename)
        
        # 3. Make Public (Viewer)
        drive_service.permissions().create(
            fileId=g_file.get('id'),
            body={'type': 'anyone', 'role': 'reader'}
        ).execute()

        # 4. Save to Firestore (MARKED AS PENDING)
        note_data = {
            "title": title,
            "subject": subject,
            "chapter": chapter or "",
            "description": description or "",
            "youtube_url": youtube_url or "",
            "fileUrl": g_file.get('webViewLink'),
            "driveId": g_file.get('id'),
            "uploader_id": uploader_id,
            "is_approved": False,  # 🔒 LOCK IT BY DEFAULT
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        db.collection("notes").add(note_data)

        return {"status": "success", "message": "Note uploaded successfully! Waiting for approval."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# --- CHAT ENDPOINT ---
@app.post("/chat")
async def chat_with_notes(
    question: str = Body(..., embed=True),
    topic_id: str = Body(..., embed=True)
):
    try:
        print(f"🤖 User asked: {question} (Topic: {topic_id})")

        # 1. Fetch notes
        # NEW WAY: Query the main 'notes' collection by Subject
        # If topic_id is "general" or empty, we fetch everything (optional logic)
        notes_ref = db.collection("notes")
        
        # If the frontend sends a specific subject (e.g., "Computer Science"), filter by it
        if topic_id and topic_id != "general":
            query = notes_ref.where("subject", "==", topic_id)
            docs = query.stream()
        else:
            docs = notes_ref.stream()
        
        # 2. Combine text
        context_text = ""
        for doc in docs:
            data = doc.to_dict()
            if "processed_text" in data:
                context_text += data["processed_text"] + "\n\n"
        
        if not context_text:
            return {"answer": "I couldn't find any notes for this topic. Please upload a PDF first!"}

        # 3. Build Prompt
        prompt = f"""
        You are a helpful tutor. Answer the question based ONLY on the following notes.
        If the answer is not in the notes, say "I don't see that in your notes."
        
        NOTES:
        {context_text[:30000]}
        
        QUESTION:
        {question}
        """

        # 4. Ask Gemini (Using the Free-Tier Friendly Model)
        response = ai_client.models.generate_content(
            model='gemini-flash-latest',
            contents=prompt
        )
        
        print("✅ AI Answered!")
        return {"answer": response.text}

    except Exception as e:
        print(f"❌ Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
# --- 6. USER DASHBOARD ENDPOINTS ---

# Get notes uploaded by a specific user
@app.get("/my-notes/{user_id}")
async def get_user_notes(user_id: str):
    try:
        # Query Firestore: Get notes where uploader_id matches
        notes_ref = db.collection("notes")
        query = notes_ref.where("uploader_id", "==", user_id)
        docs = query.stream()

        my_notes = []
        for doc in docs:
            note = doc.to_dict()
            note['id'] = doc.id # Add the ID so we can delete it later
            my_notes.append(note)

        return my_notes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Delete a note
@app.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    try:
        # 1. Delete from Firestore
        db.collection("notes").document(note_id).delete()
        
        # (Optional: In a real app, you would also delete the file from Google Drive here)
        
        return {"status": "success", "message": "Note deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    

# --- 7. ADMIN ENDPOINTS (FIXED) ---

@app.get("/admin/stats")
async def get_admin_stats():
    try:
        # 1. Fetch the stream ONCE
        notes_stream = db.collection("notes").stream()
        
        # 2. Build the list immediately
        all_notes_data = []
        for doc in notes_stream:
            note = doc.to_dict()
            note['id'] = doc.id  # Attach the ID
            all_notes_data.append(note)
            
        # 3. Return the pre-built list
        return {
            "total_notes": len(all_notes_data),
            "all_notes": all_notes_data
        }
    except Exception as e:
        print(f"Admin Stats Error: {e}") # Print error to console for debugging
        raise HTTPException(status_code=500, detail=str(e))

# --- 8. DYNAMIC SUBJECTS & APPROVALS ---

class SubjectRequest(BaseModel):
    title: str
    field: str  # e.g., "Engineering", "Pharmacy"
    description: str
    uploader_id: str

@app.post("/request-subject")
async def request_subject(request: SubjectRequest):
    try:
        # Check if exists (optional logic could go here)
        new_subject = {
            "title": request.title,
            "field": request.field,
            "description": request.description,
            "icon": "📚", # Default icon
            "chapters": [], # Empty list of chapters
            "is_approved": False, # 🔒 Pending Admin Approval
            "uploader_id": request.uploader_id,
            "created_at": firestore.SERVER_TIMESTAMP
        }
        db.collection("subjects").add(new_subject)
        return {"status": "success", "message": "Subject requested! Waiting for Admin approval."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/subjects")
async def get_subjects(show_all: bool = False):
    try:
        subjects_ref = db.collection("subjects")
        
        # If not admin (show_all=False), only show APPROVED subjects
        if not show_all:
            query = subjects_ref.where("is_approved", "==", True)
            docs = query.stream()
        else:
            # Admin sees everything (pending + approved)
            docs = subjects_ref.stream()

        result = []
        for doc in docs:
            sub = doc.to_dict()
            sub['id'] = doc.id
            result.append(sub)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/approve/{collection_name}/{item_id}")
async def approve_item(collection_name: str, item_id: str):
    try:
        # Generic approver for both 'notes' and 'subjects'
        db.collection(collection_name).document(item_id).update({"is_approved": True})
        return {"status": "success", "message": "Item Approved!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)