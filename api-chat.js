// Netlify Function: api-chat
// Expects POST JSON: { message: "..." }
// Requires env: GROQ_API_KEY
const GROQ_API = process.env.GROQ_API_ENDPOINT || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "gpt-4o-mini";

exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    const body = JSON.parse(event.body || "{}");
    const message = body.message || body.prompt || "";
    if (!message) return { statusCode: 400, body: JSON.stringify({ error: "no message" }) };

    const payload = {
      model: GROQ_MODEL,
      messages: [{ role: "user", content: message }],
      max_tokens: 800
    };

    const resp = await fetch(GROQ_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const j = await resp.json();
    const reply = j?.choices?.[0]?.message?.content || j?.error?.message || JSON.stringify(j);
    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (e) {
    console.error("Function error:", e);
    return { statusCode: 500, body: JSON.stringify({ error: "server error", detail: String(e) }) };
  }
};