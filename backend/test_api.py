from google import genai
import os

# ⚠️ PASTE YOUR KEY HERE
GEMINI_API_KEY = "AIzaSyDG3Q8vGPEaztpBx1WxL4u6Ix1sQFtwAp0"

client = genai.Client(api_key=GEMINI_API_KEY)

print("🔍 Checking available models...")
try:
    # List all models
    models = client.models.list()
    for m in models:
        # We only care about models that support 'generateContent'
        if 'generateContent' in m.supported_actions:
            print(f"✅ Found: {m.name}")
            
    print("\n👉 Use one of the names above in your main.py file!")

except Exception as e:
    print(f"❌ Error: {e}")