import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

const PORT = 3000;

let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please check and set it in the Settings > Secrets panel of AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));

  // API Route - Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // API Route - Chat completion
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, systemInstructionOverride } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array is required and cannot be empty." });
      }

      const ai = getAIClient();

      // Configure system instructions
      const defaultInstruction = 
        "You are a friendly, natural, and highly capable conversational personal AI assistant, similar to ChatGPT. " +
        "You run as a complete independent application in this platform. " +
        "You help with learning, coding, debugging, project layout generation, and general knowledge questions. " +
        "Explain things simply, clearly, and practically. When the user sends code, detect errors quickly, explain the problem simply, and provide fixed working code. " +
        "Always prefix every response with 'AI App:'. " +
        "Support markdown formatting for all responses, including language tags for code-blocks. Formatting code and suggestions nicely with clear steps.";

      const systemInstruction = systemInstructionOverride || defaultInstruction;

      // Transform messages into Gemini API Format
      // Gemini expects role to be 'user' or 'model'
      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || "";

      res.json({
        content: responseText,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({
        error: error.message || "An error occurred while communicating with the AI service.",
      });
    }
  });

  // Serve static UI assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
