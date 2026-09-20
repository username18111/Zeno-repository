export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }
 
  try {
    const { videoBase64, mimeType } = req.body;
 
    if (!videoBase64) {
      return res.status(400).json({ error: { message: "Thieu du lieu video" } });
    }
 
    const allKeys = (process.env.GEMINI_API_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);
 
    if (allKeys.length === 0) {
      return res.status(500).json({ error: { message: "Chua cau hinh GEMINI_API_KEYS tren server" } });
    }
 
    const chosenKey = allKeys[Math.floor(Math.random() * allKeys.length)];
 
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + chosenKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Mo ta chi tiet nhung gi dien ra trong video nay bang tieng Viet, khach quan, trong khoang 4-5 cau. Neu co loi noi/am thanh dang chu thi tom tat luon noi dung do." },
              { inline_data: { mime_type: mimeType || "video/mp4", data: videoBase64 } }
            ]
          }]
        })
      }
    );
 
    const data = await geminiResponse.json();
 
    if (!geminiResponse.ok) {
      const errMsg = (data.error && data.error.message) ? data.error.message : "Loi khong xac dinh tu Gemini";
      return res.status(geminiResponse.status).json({ error: { message: errMsg } });
    }
 
    const description = data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;
 
    if (!description) {
      return res.status(500).json({ error: { message: "Khong doc duoc mo ta video tu Gemini" } });
    }
 
    return res.status(200).json({ description: description });
 
  } catch (err) {
    return res.status(500).json({ error: { message: "Loi server: " + err.message } });
  }
}
 
