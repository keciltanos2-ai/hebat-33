KisahSukses Full Web Service (Client + Groq Proxy Server)
========================================================

Structure:
- client/    -> static frontend (index.html, client.js, style.css, games/)
- server/    -> Node.js Express proxy that serves client and forwards /api/chat to Groq

How to run locally (requires Node 18+):
1. cd server
2. npm install
3. create a .env file with GROQ_API_KEY=your_key (optional)
4. npm start
5. Open http://localhost:10000

How to deploy to Render:
- Push this repository to GitHub.
- In Render create a new Web Service pointing to the repo (branch main).
- Start Command: cd server && npm install && npm start
- Set Environment Variable on Render: GROQ_API_KEY (paste your key)
- Deploy — server will serve client and proxy AI calls securely.

Security note:
- Keep your GROQ_API_KEY only in server environment variables; never commit to client files or share publicly.
