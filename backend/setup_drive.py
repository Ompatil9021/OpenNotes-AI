import os
from google_auth_oauthlib.flow import InstalledAppFlow

# This tells Google we only want to manage files created by this app
SCOPES = ['https://www.googleapis.com/auth/drive.file']

def authenticate_user():
    # 1. Check if the credentials file you just downloaded exists
    if not os.path.exists('credentials.json'):
        print("❌ Error: credentials.json not found in backend folder.")
        print("   Please download it from Google Cloud Console -> Clients.")
        return

    # 2. Launch the Browser Login Flow
    try:
        flow = InstalledAppFlow.from_client_secrets_file(
            'credentials.json', SCOPES)
        
        print("🚀 Opening browser... Please login with your 2TB Google Account.")
        
        # This opens your Chrome browser to ask for permission
        creds = flow.run_local_server(port=0)

        # 3. Save the "Token" (The permanent key)
        with open('token.json', 'w') as token_file:
            token_file.write(creds.to_json())
        
        print("\n✅ Success! 'token.json' created.")
        print("   You can now run 'python main.py' to start the server.")

    except Exception as e:
        print(f"\n❌ Authentication Failed: {e}")

if __name__ == '__main__':
    authenticate_user()