// import dependencies yang kita butuhkan di file ini
// CommonJS --> const genai = require("@google/genai");
// const { GoogleGenAI } = genai;
import { GoogleGenAI } from "@google/genai"; // ESModule (ESM)
import "dotenv/config";
import express, { response } from "express";
import cors from "cors";
import multer from "multer";
 
const { PORT } = process.env;
 
// init Express-nya
const app = express();
 
// tambahkan middleware-nya ke dalam app
app.use(cors()); // CORS: Cross-Origin Resource Sharing
app.use(express.json()); // membolehkan request dengan Content-Type: application/json
app.use(express.static('public'));
// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({}); // instantiate sebuah class menjadi sebuah instance object di variable `ai`
 
// tambahkan route handler
// request untuk POST /chat
// http://localhost:3000/chat --> POST
// JSON body: { prompt: "" }
app.post('/chat', async (req, res) => {
  // guard clause (satpam)
  if (!req.body) {
    // lempar 400
    return res.status(400).send("Tidak ada request body nih!");
  }
 
  const { messages } = req.body;
  // messages: { role: 'user' | 'model', content: string }[]
 
  // kasih satpam lagi buat periksa isi prompt-nya
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).send(
      "Tidak ada pesan nih, atau pesannya nggak beraturan! Pesan harus berupa array berisi role dan juga content"
    );
  }
 
  // Array mapping
  // looping untuk mengubah (mapping) dari satu object/tipe ke tipe/object lain
  const contents = messages.map(message => {
    return {
      role: message.role,
      parts: [
        { text: message.content }
      ]
    }
  })
 
  try {
    const aiResponse = await ai.models.generateContent({
      config: {
        systemInstruction: {
          parts: [
            { text: "Anda adalah seorang seniman yang gemar membuat puisi sebagai jawaban." }
          ]
        }
      },
      model: "gemini-2.5-flash-lite",
      contents // shorthand dari "contents: contents"
    })
 
    return res.status(200).json({
      response: aiResponse.text
    });
  } catch (error) {
    };
    response: aiResponse.text
});
 
// membuat app-nya "mendengar" port [PORT]
app.listen(PORT, () => {
  console.log("I LOVE YOU " + PORT);
});