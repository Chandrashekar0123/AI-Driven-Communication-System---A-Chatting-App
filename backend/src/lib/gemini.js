import { GoogleGenerativeAI } from "@google/generative-ai";
import NodeCache from "node-cache";
import dotenv from "dotenv";

dotenv.config();

// ─── API Keys ────────────────────────────────────────────────────────────────
const GEMINI_KEY    = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const HF_KEY        = process.env.HUGGINGFACE_API_KEY;
const OPENAI_KEY    = process.env.OPENAI_API_KEY;

if (!GEMINI_KEY) console.warn("⚠️  GOOGLE_API_KEY missing");
if (!HF_KEY)     console.warn("⚠️  HUGGINGFACE_API_KEY missing – HuggingFace fallback disabled");
if (!OPENAI_KEY) console.warn("⚠️  OPENAI_API_KEY missing – OpenAI fallback disabled");

// ─── In-Memory Cache (TTL: 5 min) ────────────────────────────────────────────
const aiCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// ─── Gemini Setup ─────────────────────────────────────────────────────────────
const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

// ─── Strict JSON Prompt ───────────────────────────────────────────────────────
const buildPrompt = (feature, message, history) => {
  const historyStr = (history || [])
    .slice(-10)
    .map(m => `${m.role === "user" ? "User" : "Other"}: ${m.text}`)
    .join("\n");

  const examples = {
    auto_reply: `{"feature":"auto_reply","result":["Sure, I'll check!","Got it, thanks!","On my way!"]}`,
    summary:    `{"feature":"summary","result":["Topic A discussed","Task B assigned to Alice","Meeting on Friday"]}`,
    sentiment:  `{"feature":"sentiment","result":{"sentiment":"Positive","emotion":"Happy","score":0.9}}`,
    tasks:      `{"feature":"tasks","result":[{"task":"Submit report","person":"Alice","deadline":"Friday"}]}`,
    translate:  `{"feature":"translate","result":"Translated message in English."}`,
    tone:       `{"feature":"tone","result":"Here is the message rewritten in a friendly and professional tone."}`,
    search:     `{"feature":"search","result":["Matching message snippet 1","Matching message snippet 2"]}`,
    moderate:   `{"feature":"moderate","result":{"flagged":false,"reason":"No violations found."}}`,
    chatbot:    `{"feature":"chatbot","result":"Hello! How can I assist you today?"}`,
    keyphrase:  `{"feature":"keyphrase","result":["project deadline","budget report","team meeting"]}`,
    grammar:    `{"feature":"grammar","result":"Here is the grammatically corrected message."}`,
    emoji:      `{"feature":"emoji","result":["😊","👍","🎉"]}`,
  };

  return `You are an AI assistant inside a chat app. Respond ONLY in valid JSON. No markdown fences.

CHAT HISTORY (last 10 messages):
${historyStr || "(no history)"}

LATEST MESSAGE: "${message || ""}"
FEATURE REQUESTED: "${feature}"

Required output format for this feature:
${examples[feature] || `{"feature":"${feature}","result":"Your response here"}`}

Rules:
- Return ONLY the JSON object above, nothing else.
- Be accurate, concise, and helpful.
- For auto_reply: give exactly 3 short reply suggestions relevant to the LATEST MESSAGE.
- For sentiment: analyze the overall mood of the LATEST MESSAGE.
- For tasks: extract any action items, owners, and deadlines mentioned.
- For translate: convert non-English text to English.
- For tone: rewrite the message in a friendly, professional tone.
- For grammar: fix spelling and grammar mistakes.
- For emoji: suggest 3 relevant emojis for the message.
- For keyphrase: extract 3-5 important topics.
OUTPUT:`;
};

// ─── Gemini Call ─────────────────────────────────────────────────────────────
async function callGemini(feature, message, history) {
  if (!genAI) throw new Error("Gemini not configured");
  const prompt = buildPrompt(feature, message, history);

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`[AI] Trying Gemini model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim()
        .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const s = text.indexOf("{"), e = text.lastIndexOf("}");
      if (s !== -1 && e !== -1) {
        const parsed = JSON.parse(text.substring(s, e + 1));
        console.log(`[AI] ✅ Gemini (${modelName}) succeeded for "${feature}"`);
        return parsed;
      }
      throw new Error("Invalid JSON format from Gemini");
    } catch (err) {
      const isRateLimit = err.message.includes("429") || err.message.includes("quota");
      const isNotFound  = err.message.includes("404") || err.message.includes("not found");
      console.warn(`[AI] Gemini ${modelName} failed: ${isRateLimit ? "RATE LIMIT" : isNotFound ? "NOT FOUND" : err.message.substring(0, 80)}`);
      if (!isRateLimit && !isNotFound) throw err; // Unexpected error, don't try next model
    }
  }
  throw new Error("All Gemini models exhausted");
}

// ─── HuggingFace Call ─────────────────────────────────────────────────────────
async function callHuggingFace(feature, message, history) {
  if (!HF_KEY) throw new Error("HuggingFace API key not configured");

  const historyStr = (history || []).slice(-6).map(m => `${m.role === "user" ? "User" : "Other"}: ${m.text}`).join("\n");

  // Feature-specific HF models
  const HF_CONFIGS = {
    sentiment: {
      model: "cardiffnlp/twitter-roberta-base-sentiment-latest",
      payload: { inputs: message || historyStr },
      transform: (data) => {
        const scores = data[0];
        if (!scores) return null;
        const best = scores.reduce((a, b) => a.score > b.score ? a : b);
        const labelMap = { "LABEL_0": "Negative", "LABEL_1": "Neutral", "LABEL_2": "Positive", "negative": "Negative", "neutral": "Neutral", "positive": "Positive" };
        const emotionMap = { "Positive": "Happy", "Neutral": "Calm", "Negative": "Upset" };
        const sentiment = labelMap[best.label] || best.label;
        return { feature: "sentiment", result: { sentiment, emotion: emotionMap[sentiment] || "Neutral", score: best.score } };
      }
    },
    translate: {
      model: "Helsinki-NLP/opus-mt-mul-en",
      payload: { inputs: message || historyStr },
      transform: (data) => ({ feature: "translate", result: data[0]?.translation_text || "Translation unavailable" })
    },
    grammar: {
      model: "pszemraj/flan-t5-large-grammar-synthesis",
      payload: { inputs: `Fix grammar: ${message || historyStr}` },
      transform: (data) => ({ feature: "grammar", result: data[0]?.generated_text || message })
    },
    keyphrase: {
      model: "ml6team/keyphrase-extraction-kbir-inspec",
      payload: { inputs: message || historyStr },
      transform: (data) => {
        const phrases = (data || []).filter(e => e.score > 0.5).map(e => e.word).slice(0, 5);
        return { feature: "keyphrase", result: phrases.length ? phrases : ["No key phrases found"] };
      }
    },
  };

  const config = HF_CONFIGS[feature];
  if (!config) throw new Error(`No HuggingFace handler for feature: ${feature}`);

  console.log(`[AI] Trying HuggingFace model: ${config.model} for "${feature}"`);

  const res = await fetch(`https://api-inference.huggingface.co/models/${config.model}`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${HF_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(config.payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HuggingFace error (${res.status}): ${errText.substring(0, 100)}`);
  }

  const data = await res.json();
  const transformed = config.transform(data);
  if (!transformed) throw new Error("HuggingFace transform returned null");
  console.log(`[AI] ✅ HuggingFace succeeded for "${feature}"`);
  return transformed;
}

// ─── OpenAI Call ─────────────────────────────────────────────────────────────
async function callOpenAI(feature, message, history) {
  if (!OPENAI_KEY) throw new Error("OpenAI API key not configured");

  const prompt = buildPrompt(feature, message, history);
  console.log(`[AI] Trying OpenAI GPT-3.5 for "${feature}"`);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`OpenAI error: ${err.error?.message || res.status}`);
  }

  const data = await res.json();
  let text = data.choices[0]?.message?.content?.trim() || "";
  text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const s = text.indexOf("{"), e = text.lastIndexOf("}");
  if (s !== -1 && e !== -1) {
    const parsed = JSON.parse(text.substring(s, e + 1));
    console.log(`[AI] ✅ OpenAI succeeded for "${feature}"`);
    return parsed;
  }
  throw new Error("Invalid JSON from OpenAI");
}

// ─── Static Fallback (always works) ──────────────────────────────────────────
function staticFallback(feature, message) {
  console.warn(`[AI] ⚠️ All APIs failed for "${feature}", using static fallback`);
  const fallbacks = {
    auto_reply: { feature, result: ["Thanks for letting me know!", "Got it! 👍", "I'll get back to you soon!"] },
    summary:    { feature, result: ["Conversation in progress", "Messages exchanged", "Check details above"] },
    sentiment:  { feature, result: { sentiment: "Neutral", emotion: "Calm", score: 0.5 } },
    tasks:      { feature, result: [{ task: "Review conversation", person: "You", deadline: "Today" }] },
    translate:  { feature, result: message || "Translation unavailable" },
    tone:       { feature, result: "Your message sounds good! Keep it up." },
    search:     { feature, result: ["No matches found in current context"] },
    moderate:   { feature, result: { flagged: false, reason: "Unable to verify — please review manually." } },
    chatbot:    { feature, result: "AI is temporarily busy. Please try again in a moment!" },
    keyphrase:  { feature, result: ["conversation", "message", "chat"] },
    grammar:    { feature, result: message || "Unable to check grammar right now." },
    emoji:      { feature, result: ["💬", "😊", "👍"] },
  };
  return fallbacks[feature] || { feature, result: "Feature unavailable", error: "All AI providers exhausted" };
}

// ─── Master Orchestrator ──────────────────────────────────────────────────────
// Priority: Cache → Gemini → HuggingFace (for supported features) → OpenAI → Static Fallback
export const getAIResponse = async (feature, message, history = []) => {
  const cacheKey = `${feature}::${(message || "").substring(0, 100)}`;

  // 1. Check cache first
  const cached = aiCache.get(cacheKey);
  if (cached) {
    console.log(`[AI] 🎯 Cache HIT for "${feature}"`);
    return cached;
  }

  // Features that HuggingFace handles better than Gemini
  const HF_PRIORITY_FEATURES = ["sentiment", "translate", "keyphrase"];

  let result = null;

  // 2. For sentiment/translate/keyphrase → Try HF first, then Gemini
  if (HF_PRIORITY_FEATURES.includes(feature) && HF_KEY) {
    try {
      result = await callHuggingFace(feature, message, history);
    } catch (hfErr) {
      console.warn(`[AI] HuggingFace failed: ${hfErr.message.substring(0, 80)}`);
    }
  }

  // 3. Try Gemini if we don't have a result yet
  if (!result && GEMINI_KEY) {
    try {
      result = await callGemini(feature, message, history);
    } catch (gErr) {
      console.warn(`[AI] Gemini cascade failed: ${gErr.message.substring(0, 80)}`);
    }
  }

  // 4. Try HuggingFace as general fallback (for non-priority features)
  if (!result && HF_KEY && !HF_PRIORITY_FEATURES.includes(feature)) {
    try {
      result = await callHuggingFace(feature, message, history);
    } catch (hfErr) {
      console.warn(`[AI] HuggingFace fallback also failed: ${hfErr.message.substring(0, 80)}`);
    }
  }

  // 5. Try OpenAI
  if (!result && OPENAI_KEY) {
    try {
      result = await callOpenAI(feature, message, history);
    } catch (oErr) {
      console.warn(`[AI] OpenAI fallback failed: ${oErr.message.substring(0, 80)}`);
    }
  }

  // 6. Use static fallback — app always works
  if (!result) {
    result = staticFallback(feature, message);
  }

  // Cache the result
  aiCache.set(cacheKey, result);
  return result;
};

export const generateAIRecommendations = async (chatHistory, latestMsg) => {
  const response = await getAIResponse("auto_reply", latestMsg, chatHistory);
  return Array.isArray(response.result) ? response.result : ["Sure!", "Got it!", "Thanks!"];
};

export const generateAISummary = async (chatHistory) => {
  const response = await getAIResponse("summary", "", chatHistory);
  return Array.isArray(response.result) ? response.result : ["No summary available."];
};

// Export cache for manual invalidation if needed
export const clearAICache = () => aiCache.flushAll();
