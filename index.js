// =======================
// Import Dependencies
// =======================
import { GoogleGenAI } from "@google/genai"; // ESModule
import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";

const { PORT, GEMINI_API_KEY } = process.env;

// =======================
// Init Express
// =======================
const app = express();
app.use(cors());
app.use(express.json());

// =======================
// Init Multer (Memory Storage)
// =======================
const upload = multer({ storage: multer.memoryStorage() });

// =======================
// Init GoogleGenAI
// =======================
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY
});

// =======================
// 1. GENERATE TEXT (Chat)
// =======================
app.post("/chat", async (req, res) => {
  if (!req.body) return res.status(400).send("Tidak ada request body nih!");

  const { prompt } = req.body;
  if (!prompt) return res.status(400).send("Tidak ada prompt nih!");

  try {
    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    return res.status(200).send(aiResponse.text);
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

// =======================
// 2. GENERATE FROM IMAGE
// =======================
app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).send("Tidak ada file gambar yang diupload!");

  const { prompt } = req.body;
  if (!prompt) return res.status(400).send("Tidak ada prompt nih!");

  try {
    const imagePart = ai.files.imageToGenerativePart(
      req.file.buffer,
      req.file.mimetype
    );

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        { role: "user", parts: [ { text: prompt }, imagePart ] }
      ]
    });

    return res.status(200).send(aiResponse.text);
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

// ==========================
// 3. GENERATE FROM DOCUMENT
// ==========================
app.post("/generate-from-document", upload.single("document"), async (req, res) => {
  if (!req.file) return res.status(400).send("Tidak ada file dokumen yang diupload!");

  const { prompt } = req.body;
  if (!prompt) return res.status(400).send("Tidak ada prompt nih!");

  try {
    const base64Doc = req.file.buffer.toString("base64");

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        { role: "user", parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: req.file.mimetype,
              data: base64Doc
            }
          }
        ]}
      ]
    });

    return res.status(200).send(aiResponse.text);
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

// ==========================
// 4. GENERATE FROM AUDIO
// ==========================
app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
  if (!req.file) return res.status(400).send("Tidak ada file audio yang diupload!");

  const { prompt } = req.body;
  if (!prompt) return res.status(400).send("Tidak ada prompt nih!");

  try {
    const base64Audio = req.file.buffer.toString("base64");

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        { role: "user", parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: req.file.mimetype, // contoh: audio/mpeg, audio/wav
              data: base64Audio
            }
          }
        ]}
      ]
    });

    return res.status(200).send(aiResponse.text);
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
