const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

async function askGemini(prompt) {
  console.log("🔥 askGemini DIPANGGIL");
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("❌ askGemini ERROR:", err);
    throw err;
  }
}

module.exports = { askGemini };
