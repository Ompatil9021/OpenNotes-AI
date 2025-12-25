from dotenv import load_dotenv
load_dotenv() # This loads the .env file
import os
import io
import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import firebase_admin
from firebase_admin import credentials, firestore
import PyPDF2

# 🆕 IMPORT THE NEW AI LIBRARY
from google import genai


# 🆕 CONFIGURE THE NEW AI CLIENT
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
app = FastAPI(title="OpenNotes AI Backend (Final)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), topic_id: str = "general"):
    try:
        file_content = await file.read()
        
        # Drive Upload
        service = get_drive_service()
        file_metadata = {'name': file.filename, 'parents': [GOOGLE_DRIVE_FOLDER_ID]}
        media = MediaIoBaseUpload(io.BytesIO(file_content), mimetype=file.content_type, resumable=True)
        drive_file = service.files().create(body=file_metadata, media_body=media, fields='id, name, webViewLink').execute()
        
        # Text Extraction
        extracted_text = ""
        if file.filename.endswith(".pdf"):
            extracted_text = extract_text_from_pdf(file_content)
        
        # Save to DB
        db.collection("topics").document(topic_id).collection("files").add({
            "filename": file.filename,
            "drive_file_id": drive_file.get('id'),
            "view_link": drive_file.get('webViewLink'),
            "processed_text": extracted_text[:100000], 
            "uploaded_at": firestore.SERVER_TIMESTAMP
        })
        
        return {"status": "success", "view_link": drive_file.get('webViewLink')}

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
        notes_ref = db.collection("topics").document(topic_id).collection("files")
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

        # 4. Ask Gemini (NEW SYNTAX)
        response = ai_client.models.generate_content(
            model='gemini-flash-latest',
            contents=prompt
        )
        
        print("✅ AI Answered!")
        return {"answer": response.text}

    except Exception as e:
        print(f"❌ Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)