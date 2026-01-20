import http.server
import socketserver
import json
import urllib.request
import os

PORT = 8000
# IMPORTANT: User needs to set their GEMINI_API_KEY environment variable or replace it here for local testing.
API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_API_KEY_HERE")

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            user_message = data.get('message', '')
            
            # Simple Proxy to Gemini for local testing
            system_prompt = "You are Orient Luxury Real Estate AI. Greet, qualify intent, budget, and location. ROI up to 14%. No commission. Be premium."
            
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={API_KEY}"
            payload = {
                "contents": [
                    {"role": "user", "parts": [{"text": system_prompt}]},
                    {"role": "user", "parts": [{"text": user_message}]}
                ]
            }
            
            try:
                req = urllib.request.Request(gemini_url, data=json.dumps(payload).encode('utf-8'))
                req.add_header('Content-Type', 'application/json')
                with urllib.request.urlopen(req) as response:
                    res_data = json.loads(response.read().decode())
                    ai_text = res_data['candidates'][0]['content']['parts'][0]['text']
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'response': ai_text}).encode())
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            super().do_POST()

Handler = MyHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server started at http://localhost:{PORT}")
    print(f"To test AI: Set GEMINI_API_KEY environment variable.")
    httpd.serve_forever()
