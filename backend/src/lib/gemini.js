import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("CRITICAL: GOOGLE_API_KEY or GEMINI_API_KEY is missing in .env file!");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

// Using 'gemini-1.5-flash' as the primary model - most robust for general use
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM_PROMPT = `
You are an advanced AI assistant embedded inside a secure, real-time messaging web application.

Priority Rule:
Security, privacy, and safe responses are the highest priority.

Supported Features & Strict Output Examples:
1. auto_reply: {"feature": "auto_reply", "result": ["Yes, I’ll join soon.", "Running late...", "Can we reschedule?"]}
2. summary: {"feature": "summary", "result": ["Discussed project timeline", "Deadline set to Friday", "John assigned backend task"]}
3. translate: {"feature": "translate", "result": "Translated text here"}
4. chatbot: {"feature": "chatbot", "result": "Helpful assistant response"}
5. sentiment: {"feature": "sentiment", "result": {"sentiment": "Positive", "emotion": "Happy"}}
6. tasks: {"feature": "tasks", "result": [{"task": "Submit report", "person": "Alice", "deadline": "Tomorrow"}]}
7. tone: {"feature": "tone", "result": "Rewritten text in requested tone"}
8. search: {"feature": "search", "result": ["Relevant message 1", "Relevant message 2"]}
9. moderate: {"feature": "moderate", "result": {"flagged": true, "reason": "Toxicity detected"}}

STRICT RULES:
- Return ONLY valid JSON.
- No markdown code blocks.
- If unsafe, use "moderate" feature to flag it.
`;

export const getAIResponse = async (feature, message, chatHistory = []) => {
  try {
    if (!API_KEY) throw new Error("Missing API Key");

    const prompt = `${SYSTEM_PROMPT}\n\nCONTEXT:\n${JSON.stringify(chatHistory)}\n\nLATEST MESSAGE: "${message}"\n\nFEATURE: "${feature}"\n\nOUTPUT:`;

    console.log(`DEBUG: Calling Gemini for feature: ${feature}`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    console.log(`DEBUG: AI output for ${feature}:`, text.substring(0, 50) + "...");

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    
    if (startIdx !== -1 && endIdx !== -1) {
      text = text.substring(startIdx, endIdx + 1);
      return JSON.parse(text);
    }
    
    throw new Error("Invalid AI response format");
  } catch (error) {
    console.error(`Gemini AI Error (${feature}):`, error.message);
    
    // Fallback logic for model not found or 404
    if (error.message.includes("404") || error.message.toLowerCase().includes("not found")) {
        console.warn("DEBUG: Primary model failed. Attempting fallback to 'gemini-pro'...");
        try {
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `${SYSTEM_PROMPT}\n\nFEATURE: "${feature}"\n\nMESSAGE: "${message}"\n\nOUTPUT:`;
            const result = await fallbackModel.generateContent(prompt);
            const text = (await result.response).text().trim().replace(/```json/g, "").replace(/```/g, "");
            return JSON.parse(text);
        } catch (fError) {
            console.error("DEBUG: Fallback failed as well:", fError.message);
            return { feature, result: null, error: "AI Model Service Error: " + fError.message };
        }
    }
    
    return { feature, result: null, error: error.message };
  }
};

export const generateAIRecommendations = async (chatHistory) => {
  const response = await getAIResponse("auto_reply", "Suggest 3 replies", chatHistory);
  return Array.isArray(response.result) ? response.result : ["Hey!", "How are you?", "Cool!"];
};

export const generateAISummary = async (chatHistory) => {
  const response = await getAIResponse("summary", "Summarize this", chatHistory);
  return Array.isArray(response.result) ? response.result : ["No summary available."];
};
