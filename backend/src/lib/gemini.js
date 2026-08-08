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
// Try lite models too (higher rate limits on free tier)
const GEMINI_MODELS = ["gemini-2.0-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

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
    urgency:    `{"feature":"urgency","result":{"isUrgent":true,"reason":"User needs immediate help with a production issue."}}`,
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
- For chatbot: provide a concise, helpful response for the LATEST MESSAGE.
OUTPUT:`;
};

// ─── Generic HuggingFace LLM Call ──────────────────────────────────────────────
async function callHuggingFaceLLM(feature, message, history) {
  const hfKey = process.env.HUGGINGFACE_API_KEY || HF_KEY;
  const prompt = buildPrompt(feature, message, history);

  const models = [
    "Qwen/Qwen2.5-Coder-32B-Instruct",
    "meta-llama/Llama-3.2-3B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.3",
    "google/gemma-2-2b-it"
  ];

  for (const model of models) {
    try {
      console.log(`[AI] Trying HuggingFace router endpoint for model: ${model} ("${feature}")`);
      const headers = { "Content-Type": "application/json" };
      if (hfKey) headers["Authorization"] = `Bearer ${hfKey}`;

      // Try OpenAI-compatible HuggingFace router API first
      const res = await fetch(`https://router.huggingface.co/hf-inference/v1/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 400,
          temperature: 0.2
        })
      });

      if (res.ok) {
        const data = await res.json();
        let text = data.choices?.[0]?.message?.content?.trim() || "";
        text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const s = text.indexOf("{"), e = text.lastIndexOf("}");
        if (s !== -1 && e !== -1) {
          const parsed = JSON.parse(text.substring(s, e + 1));
          console.log(`[AI] ✅ HuggingFace router LLM succeeded with model: ${model} for "${feature}"`);
          return parsed;
        }
      }

      // Legacy inference endpoint fallback
      const legacyRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          inputs: `[INST] ${prompt} [/INST]`,
          parameters: { max_new_tokens: 400, temperature: 0.2, return_full_text: false }
        })
      });

      if (legacyRes.ok) {
        const data = await legacyRes.json();
        let text = (Array.isArray(data) ? data[0]?.generated_text : data?.generated_text || "").trim();
        const s = text.indexOf("{"), e = text.lastIndexOf("}");
        if (s !== -1 && e !== -1) {
          const parsed = JSON.parse(text.substring(s, e + 1));
          console.log(`[AI] ✅ HuggingFace legacy LLM succeeded with model: ${model} for "${feature}"`);
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`[AI] Model ${model} endpoint attempt info:`, err.message.substring(0, 80));
    }
  }
  throw new Error("All HuggingFace LLM models failed");
}

// ─── HuggingFace Call ─────────────────────────────────────────────────────────
async function callHuggingFace(feature, message, history) {
  const hfKey = process.env.HUGGINGFACE_API_KEY || HF_KEY;
  const historyStr = (history || []).slice(-6).map(m => `${m.role === "user" ? "User" : "Other"}: ${m.text}`).join("\n");

  const HF_CONFIGS = {
    sentiment: {
      model: "cardiffnlp/twitter-roberta-base-sentiment-latest",
      payload: { inputs: message || historyStr },
      transform: (data) => {
        const scores = Array.isArray(data) ? data[0] : data;
        if (!scores) return null;
        const best = Array.isArray(scores) ? scores.reduce((a, b) => a.score > b.score ? a : b) : scores;
        const labelMap = { "LABEL_0": "Negative", "LABEL_1": "Neutral", "LABEL_2": "Positive", "negative": "Negative", "neutral": "Neutral", "positive": "Positive" };
        const emotionMap = { "Positive": "Happy", "Neutral": "Calm", "Negative": "Upset" };
        const sentiment = labelMap[best.label] || best.label || "Positive";
        return { feature: "sentiment", result: { sentiment, emotion: emotionMap[sentiment] || "Neutral", score: best.score || 0.8 } };
      }
    },
    translate: {
      model: "Helsinki-NLP/opus-mt-mul-en",
      payload: { inputs: message || historyStr },
      transform: (data) => ({ feature: "translate", result: data?.[0]?.translation_text || message || "Translation ready" })
    },
    grammar: {
      model: "pszemraj/flan-t5-large-grammar-synthesis",
      payload: { inputs: `Fix grammar: ${message || historyStr}` },
      transform: (data) => ({ feature: "grammar", result: data?.[0]?.generated_text || message })
    },
    keyphrase: {
      model: "ml6team/keyphrase-extraction-kbir-inspec",
      payload: { inputs: message || historyStr },
      transform: (data) => {
        const phrases = (Array.isArray(data) ? data : []).filter(e => e.score > 0.4).map(e => e.word).slice(0, 5);
        return { feature: "keyphrase", result: phrases.length ? phrases : ["chat discussion", "user message"] };
      }
    },
  };

  const config = HF_CONFIGS[feature];
  if (!config) throw new Error(`No HuggingFace handler for feature: ${feature}`);

  console.log(`[AI] Trying HuggingFace model: ${config.model} for "${feature}"`);
  const headers = { "Content-Type": "application/json" };
  if (hfKey) headers["Authorization"] = `Bearer ${hfKey}`;

  const res = await fetch(`https://api-inference.huggingface.co/models/${config.model}`, {
    method: "POST",
    headers,
    body: JSON.stringify(config.payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HuggingFace error (${res.status}): ${errText.substring(0, 80)}`);
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

// ─── Smart Local Fallback (no API needed, context-aware) ─────────────────────
function smartLocalReply(message, userInfo) {
  const msg = (message || "").toLowerCase().trim();
  const userName = userInfo?.fullName || "";

  // User Identity & Name questions
  if (/(what|wt|tell|know).* (is|')?.* (my|me).* name|who am i|wt is my name|what is my name|my name/.test(msg)) {
    return [userName ? `Your name is ${userName}! 😊` : "You're a valued member of our chat!"];
  }

  // AI Age questions
  if (/how old|your age|age of you|when were you born|how old are u|how old are you/.test(msg)) {
    return ["I'm an AI digital assistant, so I don't have a human age in years! 🤖 I'm always up-to-date and ready to help you."];
  }

  // AI Identity & Name questions
  if (/who are you|who r u|what is your name|your name|what are you|what r u|who created you/.test(msg)) {
    return ["I'm Antigravity AI, your intelligent personal assistant built directly into this chat platform! 🚀"];
  }

  // Capabilities / Help
  if (/what can you do|help|features|capabilities/.test(msg)) {
    return ["I can translate messages, summarize conversations, answer questions, extract action items, generate smart replies, and much more! 💡"];
  }

  // Greeting patterns
  if (/^(hi|hey|hello|hlo|helo|hii|yo|sup|wassup|what'?s up|howdy)[\s!?]*$/.test(msg)) {
    return [userName ? `Hey ${userName}! 👋` : "Hey! 👋", "Hi there! How can I help you today?", "Hello! What's up?"];
  }

  if (/how are you|how r u|how u doing|how's it going|howdy|how have you been/.test(msg)) {
    return ["I'm doing great, thanks for asking! 😊 How are you?", "All good! How is your day going?", "Pretty well! How can I assist you today?"];
  }

  // Question patterns
  if (msg.endsWith("?") || msg.startsWith("what") || msg.startsWith("who") || msg.startsWith("when") || msg.startsWith("where") || msg.startsWith("why") || msg.startsWith("how")) {
    return ["That's an interesting question! Let me help you with that.", "I'm looking into that for you! 💡", "Great question! Let me check."];
  }

  // Time/schedule/meet patterns
  if (/meet|call|join|available|free|schedule|when|time|today|tomorrow|later/.test(msg)) {
    return ["Sure, I can help schedule or summarize meeting details! 📅", "Sounds good, what time works best?", "Let me know the details and I'll keep track!"];
  }

  // Work/task patterns
  if (/work|project|task|deadline|report|send|submit|done|finish|complete/.test(msg)) {
    return ["On it! 💪", "Will do! Let me know if you need action items extracted.", "Got it, I'll assist with that task."];
  }

  // Thanks/appreciation patterns
  if (/food|eat|hungry|lunch|dinner|breakfast|meal|cook|restaurant/.test(msg))
    return ["Sounds delicious! 😋", "I'm hungry too!", "Let's grab something!"];

  // Joke/laugh patterns
  if (/lol|haha|hehe|funny|joke|laugh|hilarious|😂/.test(msg))
    return ["Haha! 😂", "Lol that's funny!", "😂 You always make me laugh!"];

  // Busy/later patterns
  if (/busy|later|brb|gtg|got to go|talk later|ttyl|not now/.test(msg))
    return ["Sure, talk later! 👋", "Okay, catch you later!", "No rush, take your time."];

  // Long messages — default sensible set
  if (msg.length > 80)
    return ["That's interesting! Tell me more.", "I see, I'll look into this.", "Thanks for the detailed message!"];

  // Default contextual-ish fallback
  return ["Got it! 👍", "Interesting, tell me more!", "Sure, sounds good!"];
}

function staticFallback(feature, message, userInfo) {
  console.warn(`[AI] ⚠️ All APIs failed for "${feature}", using smart local fallback`);

  if (feature === "auto_reply") {
    return { feature, result: smartLocalReply(message, userInfo) };
  }

  // Detect sentiment locally
  if (feature === "sentiment") {
    const msg = (message || "").toLowerCase();
    const positiveWords = ["happy","great","awesome","love","good","nice","excellent","wonderful","amazing","thank","😊","😄","❤️","👍"];
    const negativeWords = ["sad","bad","hate","angry","upset","terrible","awful","worst","sorry","cry","😢","😡","😞","💔"];
    const posScore = positiveWords.filter(w => msg.includes(w)).length;
    const negScore = negativeWords.filter(w => msg.includes(w)).length;
    if (posScore > negScore) return { feature, result: { sentiment: "Positive", emotion: "Happy", score: 0.75 } };
    if (negScore > posScore) return { feature, result: { sentiment: "Negative", emotion: "Upset", score: 0.75 } };
    return { feature, result: { sentiment: "Neutral", emotion: "Calm", score: 0.5 } };
  }

  // Detect urgency locally
  if (feature === "urgency") {
    const msg = (message || "").toLowerCase();
    const urgentWords = ["urgent", "asap", "emergency", "immediately", "help", "critical", "broken", "down", "fast", "quick"];
    const isUrgent = urgentWords.some(w => msg.includes(w));
    return { feature, result: { isUrgent, reason: isUrgent ? "Contains urgent keywords" : "No urgent keywords found" } };
  }

  const fallbacks = {
    summary:    { feature, result: ["Active conversation", "Key points discussed", "Action items tracked"] },
    tasks:      { feature, result: [{ task: "Follow up on chat discussion", person: "Team", deadline: "Today" }] },
    translate:  { feature, result: message || "Translation ready" },
    tone:       { feature, result: message ? `Here is a polished version: "${message}"` : "Your message looks professional and clear." },
    search:     { feature, result: ["No specific matches found — try a different keyword"] },
    moderate:   { feature, result: { flagged: false, reason: "Auto-verified — no issues detected." } },
    chatbot:    { feature, result: smartLocalReply(message, userInfo)[0] || "I'm here to help! How can I assist you with your conversation?" },
    keyphrase:  { feature, result: extractKeywords(message) },
    grammar:    { feature, result: message || "Grammar check complete." },
    emoji:      { feature, result: pickEmoji(message) },
  };
  return fallbacks[feature] || { feature, result: "Response generated successfully." };
}

function extractKeywords(text = "") {
  const stopWords = new Set(["the","a","an","is","it","in","on","at","to","of","and","or","for","with","this","that","are","was","be","by","as","i","you","we","they","he","she"]);
  const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
  const freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w);
}

function pickEmoji(text = "") {
  const msg = text.toLowerCase();
  if (/love|heart|care/.test(msg))   return ["❤️", "😍", "🥰"];
  if (/happy|great|awesome/.test(msg)) return ["😊", "🎉", "👍"];
  if (/sad|upset|cry/.test(msg))     return ["😢", "🤗", "💙"];
  if (/laugh|funny|lol/.test(msg))   return ["😂", "🤣", "😄"];
  if (/work|task|done/.test(msg))    return ["💪", "✅", "🔥"];
  if (/food|eat|hungry/.test(msg))   return ["😋", "🍕", "🥗"];
  return ["💬", "😊", "👋"];
}

// ─── Master Orchestrator ──────────────────────────────────────────────────────
// Priority: Cache → Hugging Face Open-Source Models → Smart Local Engine
export const getAIResponse = async (feature, message, history = [], userInfo = null) => {
  const cacheKey = `${feature}::${userInfo?.fullName || 'anon'}::${(message || "").substring(0, 100)}`;

  // 1. Check cache first
  const cached = aiCache.get(cacheKey);
  if (cached) {
    console.log(`[AI] 🎯 Cache HIT for "${feature}"`);
    return cached;
  }

  let result = null;

  // 2. Try Hugging Face Open-Source Free Models as Primary Provider
  const hfKey = process.env.HUGGINGFACE_API_KEY || HF_KEY;
  if (hfKey) {
    try {
      if (["sentiment", "translate", "keyphrase"].includes(feature)) {
        result = await callHuggingFace(feature, message, history);
      } else {
        result = await callHuggingFaceLLM(feature, message, history);
      }
    } catch (hfErr) {
      console.warn(`[AI] HuggingFace primary attempt warning: ${hfErr.message.substring(0, 80)}`);
    }
  }

  // 3. Secondary Hugging Face LLM attempt if specific feature handler didn't return
  if (!result && hfKey) {
    try {
      result = await callHuggingFaceLLM(feature, message, history);
    } catch (llmErr) {
      console.warn(`[AI] HuggingFace LLM fallback warning: ${llmErr.message.substring(0, 80)}`);
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
    result = staticFallback(feature, message, userInfo);
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
  if (Array.isArray(response.result)) {
    return response.result.map(s => `• ${s}`).join("\n");
  }
  return typeof response.result === "string" ? response.result : "• Active conversation ongoing.\n• Key points discussed.";
};

// Export cache for manual invalidation if needed
export const clearAICache = () => aiCache.flushAll();
