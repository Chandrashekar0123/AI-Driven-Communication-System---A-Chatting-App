import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { ArrowLeft, Sparkles, Send, Loader2, Bot, User, Trash2, Volume2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";

const AIChatbotPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, role: "bot", text: "Hey! I'm your AI assistant powered by Gemini 2.5. Ask me anything — I can help you summarize chats, translate messages, suggest replies, and more! 🚀" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMsg = async (e) => {
    e?.preventDefault();
    const q = input.trim();
    if (!q) return;

    const userMsg = { id: Date.now(), role: "user", text: q };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axiosInstance.post("/messages/ai", {
        feature: "chatbot",
        message: q,
        chatId: "chatbot-session",
      });
      const answer = res.data?.result || "I'm not sure how to answer that. Try rephrasing!";
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "bot", text: answer }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "bot",
        text: "Oops! I'm having trouble connecting to the AI right now. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (msg) => {
    if (!("speechSynthesis" in window)) { toast.error("TTS not supported"); return; }
    if (speakingId === msg.id) { window.speechSynthesis.cancel(); setSpeakingId(null); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(msg.text);
    utterance.onstart = () => setSpeakingId(msg.id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  };

  const clearChat = () => {
    setMessages([{ id: 1, role: "bot", text: "Chat cleared! Ask me anything 🚀" }]);
    toast.success("Chat cleared");
  };

  const SUGGESTIONS = ["Summarize our last conversation", "How do I improve my messages?", "Translate: 'Bonjour, comment ça va?'", "Suggest 3 professional greetings"];

  return (
    <div className="min-h-screen bg-[#0d0e12] flex flex-col">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between bg-[#1a1b1e]/90 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Bot className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-black text-white tracking-tight">AI Assistant</h1>
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Gemini 2.5 · HuggingFace · OpenAI</p>
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="p-2 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all" title="Clear chat">
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {/* Quick suggestions */}
        {messages.length === 1 && (
          <div className="grid grid-cols-2 gap-2 mb-6">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => { setInput(s); }}
                className="p-3 text-left rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.06] transition-all group">
                <Sparkles size={12} className="text-purple-400 mb-2 group-hover:text-purple-300" />
                <p className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-200 leading-snug">{s}</p>
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} group`}>
            {/* Avatar */}
            <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === "bot" ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-white/10"}`}>
              {msg.role === "bot" ? <Bot size={14} className="text-white" /> : <User size={14} className="text-slate-300" />}
            </div>

            {/* Bubble */}
            <div className={`relative max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
              msg.role === "user"
                ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-sm"
                : "bg-[#2b2d31] text-[#dcddde] rounded-tl-sm border border-white/[0.04]"
            }`}>
              {msg.text}

              {/* TTS */}
              <button
                onClick={() => speak(msg)}
                className={`absolute -bottom-2 ${msg.role === "user" ? "-left-7" : "-right-7"} opacity-0 group-hover:opacity-100 p-1 rounded-lg border transition-all ${
                  speakingId === msg.id ? "bg-purple-500 border-purple-400 text-white opacity-100" : "bg-[#1a1b1e] border-white/10 text-slate-400 hover:text-purple-400"
                }`}
                title={speakingId === msg.id ? "Stop" : "Listen (TTS)"}
              >
                {speakingId === msg.id ? <VolumeX size={11} /> : <Volume2 size={11} />}
              </button>
            </div>
          </div>
        ))}

        {/* Loading */}
        {isLoading && (
          <div className="flex gap-3 items-end">
            <div className="size-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#2b2d31] border border-white/[0.04] flex items-center gap-2">
              <div className="flex gap-1">
                <span className="size-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="size-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="size-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-[10px] text-slate-500 font-bold">AI thinking...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 px-4 py-4 bg-[#0d0e12]/95 backdrop-blur-3xl border-t border-white/5 max-w-3xl mx-auto w-full">
        <form onSubmit={sendMsg} className="flex gap-3 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-[#1a1b1e] border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all font-medium"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}
            className={`size-11 rounded-2xl flex items-center justify-center transition-all ${
              input.trim() && !isLoading
                ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30"
                : "bg-white/5 text-slate-600 cursor-not-allowed"
            }`}>
            {isLoading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatbotPage;
