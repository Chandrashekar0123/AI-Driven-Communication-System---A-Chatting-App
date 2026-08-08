import { useState, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { X, Search, Loader2, MessageSquare, Bot, Sparkles, Brain, ArrowRight } from "lucide-react";
import { formatMessageTime } from "../../lib/utils";
import toast from "react-hot-toast";

const QUICK_AI_PROMPTS = [
  "What meeting times or dates were discussed?",
  "Summarize key decisions made in this chat",
  "List any action items or tasks mentioned",
  "What are the main topics discussed recently?"
];

const SearchMessagesModal = ({ isOpen, onClose }) => {
  const { searchMessages, searchResults, isSearchLoading, selectedChat, aiSmartSearchMessages } = useChatStore();
  const [activeTab, setActiveTab] = useState("ai"); // "ai" or "keyword"
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Debounce search input for keyword search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Execute keyword search
  useEffect(() => {
    if (isOpen && selectedChat && activeTab === "keyword") {
      if (debouncedQuery.trim()) {
        searchMessages(selectedChat._id, debouncedQuery.trim());
      } else {
        searchMessages(selectedChat._id, "");
      }
    }
  }, [debouncedQuery, isOpen, selectedChat, activeTab, searchMessages]);

  const handleAiSmartSearch = async (promptToUse) => {
    const q = promptToUse || aiQuery;
    if (!q.trim() || !selectedChat) return;

    setAiQuery(q);
    setIsAiLoading(true);
    setAiAnswer(null);

    const res = await aiSmartSearchMessages(selectedChat._id, q.trim());
    setIsAiLoading(false);
    if (res) {
      setAiAnswer(res.answer);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1e1f22] w-full max-w-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[85vh]">
        
        {/* Modal Top Header & Mode Tabs */}
        <div className="px-6 pt-5 pb-3 border-b border-white/5 bg-[#2b2d31] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Brain className="size-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white tracking-tight">Search & AI Context Q&A</h3>
                <p className="text-[11px] text-slate-400 font-medium">Ask questions in natural language or search exact keywords</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 p-1 bg-[#1e1f22] rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "ai"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles size={14} />
              <span>AI Smart Context Q&A</span>
            </button>
            <button
              onClick={() => setActiveTab("keyword")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "keyword"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Search size={14} />
              <span>Keyword Search</span>
            </button>
          </div>
        </div>

        {/* Tab 1: AI Smart Context Search */}
        {activeTab === "ai" && (
          <div className="p-6 flex flex-col gap-6 overflow-y-auto min-h-[350px]">
            <form onSubmit={(e) => { e.preventDefault(); handleAiSmartSearch(); }} className="flex gap-3">
              <div className="relative flex-1">
                <Brain className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-purple-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Ask any natural question (e.g. 'What did Sarah say about the meeting?')..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="w-full bg-[#2b2d31] border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-purple-500/50 outline-none transition-all font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={isAiLoading || !aiQuery.trim()}
                className={`px-5 rounded-2xl flex items-center gap-2 font-bold text-xs transition-all ${
                  aiQuery.trim() && !isAiLoading
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:scale-105"
                    : "bg-white/5 text-slate-500 cursor-not-allowed"
                }`}
              >
                {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                <span>Ask AI</span>
              </button>
            </form>

            {/* Quick Prompts */}
            {!aiAnswer && !isAiLoading && (
              <div className="space-y-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Suggested Smart Queries</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {QUICK_AI_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAiSmartSearch(prompt)}
                      className="p-3 text-left rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                    >
                      <span>{prompt}</span>
                      <Sparkles size={14} className="text-purple-400 opacity-60 group-hover:opacity-100 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Loading State */}
            {isAiLoading && (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-slate-400">
                <div className="relative">
                  <div className="size-16 rounded-2xl border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                  <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-7 text-purple-400 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-black text-white uppercase tracking-widest animate-pulse">Analyzing Chat Context...</p>
                  <p className="text-[10px] text-slate-500">Gemini 2.0 AI model reading messages</p>
                </div>
              </div>
            )}

            {/* AI Response Output */}
            {aiAnswer && !isAiLoading && (
              <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <Bot size={16} />
                  <span>AI Context Answer</span>
                </div>
                <div className="text-sm text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                  {aiAnswer}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Keyword Search */}
        {activeTab === "keyword" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
              <Search className="text-purple-400 size-5" />
              <input 
                type="text" 
                autoFocus
                placeholder="Search exact keywords in this chat..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 font-medium text-sm"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px] p-4 flex flex-col gap-2">
              {isSearchLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400">
                  <Loader2 className="size-8 animate-spin text-purple-500" />
                  <p className="text-xs font-bold uppercase tracking-widest">Searching...</p>
                </div>
              ) : !query ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-500">
                  <Search className="size-12 opacity-20" />
                  <p className="text-xs font-bold text-center">Type to search for messages,<br/>links, or keywords.</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-500">
                  <MessageSquare className="size-12 opacity-20" />
                  <p className="text-xs font-bold">No results found for "{query}"</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest px-2 pb-2">
                    {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  {searchResults.map((msg, idx) => (
                    <div key={msg._id || idx} className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-3 flex gap-3 cursor-pointer transition-colors group">
                      <img 
                        src={msg.senderId?.profilePic || "/avatar.png"} 
                        alt="avatar" 
                        className="size-8 rounded-full object-cover shrink-0 ring-1 ring-white/10" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-white truncate">{msg.senderId?.fullName || "User"}</span>
                          <span className="text-[10px] text-slate-500">{formatMessageTime(msg.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-300 break-words whitespace-pre-wrap leading-snug">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchMessagesModal;

