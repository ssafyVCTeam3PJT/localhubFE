import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing
app.use(express.json());

// Initialize Gemini Client
// Using the recommended approach with User-Agent telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", hasApiKey: !!apiKey });
});

app.use("/api", async (req, res, next) => {
  if (req.path === "/health" || req.path === "/ai/companion") {
    return next();
  }

  try {
    const targetUrl = new URL(req.originalUrl, "https://localhubbe.onrender.com");
    const headers = new Headers();

    Object.entries(req.headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        headers.set(key, value.join(","));
      }
    });

    headers.delete("host");
    headers.delete("content-length");

    const body = req.method === "GET" || req.method === "HEAD"
      ? undefined
      : typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body ?? {});

    const upstreamResponse = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    res.status(upstreamResponse.status);

    upstreamResponse.headers.forEach((value, key) => {
      if (key === "content-length" || key === "transfer-encoding" || key === "content-encoding") {
        return;
      }
      res.setHeader(key, value);
    });

    if (upstreamResponse.body) {
      const reader = upstreamResponse.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
        res.end();
      };
      await pump();
    } else {
      res.end();
    }
  } catch (error: any) {
    console.error("API proxy error:", error);
    res.status(502).json({ success: false, error: error.message || "Backend proxy failed" });
  }
});

app.post("/api/ai/companion", async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!apiKey || !ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured. Please add it to Secrets panel."
      });
    }

    const systemInstruction = `You are "AI Sport Mate", a friendly, motivating neighborhood local guide and sports assistant built into the LocalHub app.
Your goals:
1. Help users find local parks, suggest activities, draft post descriptions (like a running meetup or basketball challenge), and answer rules about sports (e.g. running pacing, badminton scoring, basketball dribbling rules).
2. Keep your answers concise, approachable, friendly, and structured. Use helpful bullet points.
3. Keep the tone natural and warm. Use Korean since the user interface is primarily Korean, but adapt based on the user's input.
4. Current context: ${JSON.stringify(context || {})}. If the user is asking about writing a post, offer a neat template that they can copy and use!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Something went wrong in AI Companion" });
  }
});

// Vite Integration Middleware
async function initializeVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

initializeVite().catch((err) => {
  console.error("Failed to start Vite middleware server:", err);
});
