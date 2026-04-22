import { useChatStore } from "../../store/useChatStore";
import {
  Sparkles, X, RefreshCw, AlertTriangle, MessageSquare, FileText,
  BarChart2, ListTodo, Globe2, Ghost, SearchCode, ShieldCheck,
  Brain, User, Calendar, Smile, Bot, Key, Pen, Smile as EmojiIcon,
} from "lucide-react";

const AIHubPanel = () => {
  const { aiResult, isAILoading, runAIFeature, toggleAIHub } = useChatStore();

  const aiTools = [
    // ── Row 1: Core Chat Features ─────────────────────────────────────────
    { id: "auto_reply",  name: "Auto Replies",  icon: <MessageSquare size={16} />, desc: "3 smart reply suggestions", color: "text-purple-400",  bg: "from-purple-500/20 to-purple-500/5"  },
    { id: "summary",     name: "Summarize",     icon: <FileText      size={16} />, desc: "Key topics & action items",  color: "text-blue-400",    bg: "from-blue-500/20 to-blue-500/5"    },
    { id: "chatbot",     name: "AI Chat",       icon: <Bot           size={16} />, desc: "Ask the AI anything",       color: "text-cyan-400",    bg: "from-cyan-500/20 to-cyan-500/5"    },
    // ── Row 2: Analysis ───────────────────────────────────────────────────
    { id: "sentiment",   name: "Sentiment",     icon: <BarChart2     size={16} />, desc: "Mood & emotion analysis",   color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-500/5" },
    { id: "tasks",       name: "Extract Tasks", icon: <ListTodo      size={16} />, desc: "Find assignments & deadlines",color: "text-lime-400",  bg: "from-lime-500/20 to-lime-500/5"    },
    { id: "keyphrase",   name: "Key Phrases",   icon: <Key           size={16} />, desc: "Extract important topics",  color: "text-yellow-400",  bg: "from-yellow-500/20 to-yellow-500/5" },
    // ── Row 3: Text Tools ─────────────────────────────────────────────────
    { id: "translate",   name: "Translate",     icon: <Globe2        size={16} />, desc: "Convert chat to English",   color: "text-sky-400",     bg: "from-sky-500/20 to-sky-500/5"      },
    { id: "grammar",     name: "Fix Grammar",   icon: <Pen           size={16} />, desc: "Fix spelling & grammar",    color: "text-indigo-400",  bg: "from-indigo-500/20 to-indigo-500/5" },
    { id: "tone",        name: "Tone Rewriter", icon: <Ghost         size={16} />, desc: "Rewrite in better tone",    color: "text-amber-400",   bg: "from-amber-500/20 to-amber-500/5"  },
    // ── Row 4: Smart Features ─────────────────────────────────────────────
    { id: "emoji",       name: "Emoji Suggest", icon: <EmojiIcon     size={16} />, desc: "Best emojis for the mood",  color: "text-pink-400",    bg: "from-pink-500/20 to-pink-500/5"    },
    { id: "search",      name: "Smart Search",  icon: <SearchCode    size={16} />, desc: "AI-powered message search", color: "text-orange-400",  bg: "from-orange-500/20 to-orange-500/5" },
    { id: "moderate",    name: "Safety Check",  icon: <ShieldCheck   size={16} />, desc: "Audit for toxicity or spam",color: "text-rose-400",    bg: "from-rose-500/20 to-rose-500/5"    },
  ];

  // ── Result Renderer ───────────────────────────────────────────────────────
  const renderResult = () => {
    if (isAILoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-8">
          <div className="relative">
            <div className="size-20 rounded-3xl border-2 border-purple-500/10 border-t-purple-500 animate-spin" />
            <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 text-purple-500 animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Neural Processing...</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Gemini 2.5 → HuggingFace → OpenAI</p>
          </div>
        </div>
      );
    }

    if (!aiResult) {
      return (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-1">12 AI Features Ready</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">Powered by Gemini 2.5 + HuggingFace + OpenAI cascade with smart caching.</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {aiTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => runAIFeature(tool.id)}
                className={`group p-3 flex flex-col gap-2 rounded-xl bg-gradient-to-br ${tool.bg} border border-white/5 hover:border-white/20 transition-all text-left hover:scale-[1.02]`}
              >
                <div className={`${tool.color} group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <div>
                  <div className="text-[10px] font-black text-white uppercase tracking-tight">{tool.name}</div>
                  <div className="text-[9px] text-slate-500 font-medium truncate mt-0.5">{tool.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    const { feature, result, error } = aiResult;

    if (error || (!result && result !== false)) {
      return (
        <div className="space-y-4 animate-in fade-in duration-500">
          <button
            onClick={() => useChatStore.setState({ aiResult: null })}
            className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] hover:underline"
          >
            <RefreshCw size={10} /> Back to tools
          </button>
          <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-center space-y-3">
            <AlertTriangle className="size-10 mx-auto text-rose-500" />
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest">AI Error</h4>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed mt-1">
                {error || "The AI engine was unable to process this request."}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
        <button
          onClick={() => useChatStore.setState({ aiResult: null })}
          className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] hover:underline"
        >
          <RefreshCw size={10} /> Back to tools
        </button>

        {/* ── Auto Reply ────────────────────────────────────────────────── */}
        {feature === "auto_reply" && Array.isArray(result) && (
          <div className="space-y-3">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Suggested Replies</h5>
            {result.map((r, i) => (
              <button
                key={i}
                onClick={() => {
                  useChatStore.getState().sendMessage({ text: r });
                  useChatStore.getState().toggleAIHub();
                }}
                className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-sm font-bold text-white hover:from-purple-500/20 hover:to-blue-500/20 hover:border-purple-500/40 transition-all flex items-center gap-3"
              >
                <Sparkles size={12} className="text-purple-400 shrink-0" />
                {r}
              </button>
            ))}
          </div>
        )}

        {/* ── Summary ───────────────────────────────────────────────────── */}
        {feature === "summary" && Array.isArray(result) && (
          <div className="space-y-3">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Conversation Recap</h5>
            {result.map((p, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="mt-1.5 size-1.5 rounded-full bg-purple-500 shrink-0" />
                <p className="text-xs font-semibold text-slate-300 leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Sentiment ─────────────────────────────────────────────────── */}
        {feature === "sentiment" && result && (
          <div className="text-center py-8 space-y-4 bg-white/[0.03] rounded-2xl border border-white/5">
            <Smile className={`size-16 mx-auto ${result.sentiment === "Positive" ? "text-emerald-400" : result.sentiment === "Negative" ? "text-rose-400" : "text-amber-400"}`} />
            <div>
              <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{result.sentiment}</h4>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] mt-1">{result.emotion}</p>
              {result.score && (
                <div className="mt-3 mx-auto w-32">
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${result.sentiment === "Positive" ? "bg-emerald-400" : result.sentiment === "Negative" ? "bg-rose-400" : "bg-amber-400"}`}
                      style={{ width: `${Math.round(result.score * 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-600 mt-1 font-bold">{Math.round(result.score * 100)}% confidence</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tasks ─────────────────────────────────────────────────────── */}
        {feature === "tasks" && Array.isArray(result) && (
          <div className="space-y-3">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Extracted Tasks</h5>
            {result.map((t, i) => (
              <div key={i} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <div className="text-xs font-black text-emerald-400">{t.task}</div>
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1"><User size={9} /> {t.person || "Unassigned"}</span>
                  <span className="flex items-center gap-1"><Calendar size={9} /> {t.deadline || "No deadline"}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Key Phrases ───────────────────────────────────────────────── */}
        {feature === "keyphrase" && Array.isArray(result) && (
          <div className="space-y-3">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Key Topics</h5>
            <div className="flex flex-wrap gap-2">
              {result.map((phrase, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-xs font-bold text-yellow-300">
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Emoji Suggestions ─────────────────────────────────────────── */}
        {feature === "emoji" && Array.isArray(result) && (
          <div className="space-y-3">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Suggested Emojis</h5>
            <div className="flex gap-4 justify-center py-6">
              {result.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => useChatStore.getState().sendMessage({ text: emoji })}
                  className="text-4xl hover:scale-125 transition-transform cursor-pointer"
                  title="Click to send"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-600 text-center font-bold uppercase tracking-widest">Click to send</p>
          </div>
        )}

        {/* ── Moderation ────────────────────────────────────────────────── */}
        {feature === "moderate" && result && (
          <div className={`p-6 rounded-2xl text-center space-y-4 ${result.flagged ? "bg-rose-500/10 border border-rose-500/20" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
            <ShieldCheck className={`size-14 mx-auto ${result.flagged ? "text-rose-500" : "text-emerald-400"}`} />
            <div>
              <h4 className="font-black text-white uppercase tracking-widest">{result.flagged ? "Risk Detected" : "Safety Verified"}</h4>
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed mt-2">{result.reason || "Stream integrity verified."}</p>
            </div>
          </div>
        )}

        {/* ── Search Results ────────────────────────────────────────────── */}
        {feature === "search" && Array.isArray(result) && (
          <div className="space-y-3">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Matches Found</h5>
            {result.map((m, i) => (
              <div key={i} className="p-4 rounded-xl bg-black/20 border border-white/5 text-xs text-slate-300 font-medium italic leading-relaxed">
                &quot;{m}&quot;
              </div>
            ))}
          </div>
        )}

        {/* ── Chatbot / Translate / Tone / Grammar (single string result) ── */}
        {(feature === "chatbot" || feature === "translate" || feature === "tone" || feature === "grammar") && typeof result === "string" && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 space-y-4">
            <Brain className="size-5 text-purple-500" />
            <p className="text-sm font-semibold text-white leading-relaxed">{result}</p>
            {(feature === "tone" || feature === "grammar") && (
              <button
                onClick={() => useChatStore.getState().sendMessage({ text: result })}
                className="w-full mt-2 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-xs font-bold text-purple-300 hover:bg-purple-500/30 transition-all"
              >
                Send this message
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 h-full flex flex-col bg-[#1a1b1e]/95 backdrop-blur-3xl border-l border-white/5 animate-in slide-in-from-right-full duration-500 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-30">
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-blue-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/20 border border-purple-500/30">
            <Sparkles className="size-5 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Magic AI Hub</h3>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Gemini 2.5 + HF + OpenAI</p>
          </div>
        </div>
        <button onClick={toggleAIHub} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all">
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 premium-scrollbar space-y-3">
        {renderResult()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={10} className="text-purple-500/50" /> AI Cascade Active
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5">v2.5-MULTI</span>
        </div>
      </div>
    </div>
  );
};

export default AIHubPanel;
