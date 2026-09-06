export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: { message: "Thiếu messages" } });
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: messages,
        temperature: 0.9
      })
    });

    const data = await groqResponse.json();

    return res.status(groqResponse.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: "Lỗi server: " + err.message } });
  }
        }
