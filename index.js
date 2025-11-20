import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// serve client static
app.use(express.static(path.join(__dirname, '..', 'client')));

// proxy /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message required' });

    const GROQ_KEY = process.env.GROQ_API_KEY;
    const MODEL = process.env.MODEL || 'llama3-8b-8192';

    if (!GROQ_KEY) {
      // no key -> return mock reply
      return res.json({ reply: 'Mock AI reply: ' + message.split('').reverse().join('') });
    }

    const resp = await fetch('https://api.groq.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GROQ_KEY
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful assistant. Answer clearly and concisely.' },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const j = await resp.json();
    const reply = j?.choices?.[0]?.message?.content || j?.error?.message || 'No reply';
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'proxy error', detail: String(e) });
  }
});

// health
app.get('/api/health', (req,res)=>res.json({ ok:true }));

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=>console.log('Server running on port', PORT));
