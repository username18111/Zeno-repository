export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }
 
  try {
    const { prompt } = req.body;
 
    if (!prompt) {
      return res.status(400).json({ error: { message: "Thieu prompt" } });
    }
 
    const allKeys = (process.env.GEMINI_API_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);
 
    if (allKeys.length === 0) {
      return res.status(500).json({ error: { message: "Chua cau hinh GEMINI_API_KEYS tren server" } });
    }
 
    const chosenKey = allKeys[Math.floor(Math.random() * allKeys.length)];
 
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=" + chosenKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
        })
      }
    );
 
    const data = await geminiResponse.json();
 
    if (!geminiResponse.ok) {
      const errMsg = (data.error && data.error.message) ? data.error.message : "Loi khong xac dinh tu Gemini";
      return res.status(geminiResponse.status).json({ error: { message: errMsg } });
    }
 
    const parts = data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts;
 
    let imageBase64 = null;
    let mimeType = "image/png";
 
    if (parts) {
      for (const part of parts) {
        const inline = part.inlineData || part.inline_data;
        if (inline && inline.data) {
          imageBase64 = inline.data;
          mimeType = inline.mimeType || inline.mime_type || mimeType;
          break;
        }
      }
    }
 
    if (!imageBase64) {
      return res.status(500).json({ error: { message: "Gemini khong tra ve anh nao" } });
    }
 
    return res.status(200).json({ imageBase64: imageBase64, mimeType: mimeType });
 
  } catch (err) {
    return res.status(500).json({ error: { message: "Loi server: " + err.message } });
  }
}
 
