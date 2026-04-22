import { useChatStore } from "../../store/useChatStore";
import { Sparkles, X, CheckCircle2, User, Calendar, Smile, AlertTriangle, Languages, Search, TrendingUp, MessageSquare, Brain, Zap, ShieldCheck, FileText, BarChart2, Globe2, Ghost, RefreshCw, ListTodo, SearchCode } from "lucide-react";

const AIHubPanel = () => {
  const { aiResult, isAILoading, runAIFeature, toggleAIHub } = useChatStore();

  const aiTools = [
    { id: "auto_reply", name: "Auto Replies", icon: <MessageSquare size={16} />, desc: "Smart reply suggestions.", color: "text-purple-400" },
    { id: "summary", name: "Summarize", icon: <FileText size={16} />, desc: "Key topics & action items.", color: "text-purple-400" },
    { id: "sentiment", name: "Sentiment", icon: <BarChart2 size={16} />, desc: "Mood & emotion analysis.", color: "text-emerald-400" },
    { id: "tasks", name: "Extract Tasks", icon: <ListTodo size={16} />, desc: "Find assignments & deadlines.", color: "text-emerald-400" },
    { id: "translate", name: "Translate", icon: <Globe2 size={16} />, desc: "Convert chat to English.", color: "text-blue-400" },
    { id: "tone", name: "Tone Rewriter", icon: <Ghost size={16} />, desc: "Change the conversation vibe.", color: "text-amber-400" },
    { id: "search", name: "Smart Search", icon: <SearchCode size={16} />, desc: "AI-powered message search.", color: "text-amber-400" },
    { id: "moderate", name: "Safety Check", icon: <ShieldCheck size={16} />, desc: "Audit for toxicity or spam.", color: "text-rose-400" },
  ];

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
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Gemini 1.5 Flash Active</p>
          </div>
        </div>
      );
    }

    if (!aiResult) {
      return (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 space-y-2">
            <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-[0.2em]">Ready to assist</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">Choose a neural tool to analyze the current stream using advanced AI.</p>
          </div>
          
          <div className="grid gap-3">
            {aiTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => runAIFeature(tool.id)}
                className="group w-full p-4 flex items-center gap-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-purple-500/30 transition-all text-left"
              >
                <div className={`p-2.5 rounded-xl bg-black/40 ${tool.color} group-hover:scale-110 transition-transform shadow-2xl`}>
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-white uppercase tracking-tight">{tool.name}</div>
                  <div className="text-[10px] text-slate-500 font-bold truncate mt-0.5">{tool.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    const { feature, result, error } = aiResult;

    if (error || !result) {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <button 
            onClick={() => useChatStore.setState({ aiResult: null })}
            className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] hover:underline mb-4"
          >
            <RefreshCw size={10} /> Try Another Tool
          </button>
          <div className="p-8 rounded-3xl bg-rose-500/5 border border-rose-500/20 text-center space-y-4">
             <AlertTriangle className="size-12 mx-auto text-rose-500" />
             <div className="space-y-1">
               <h4 className="text-xs font-black text-white uppercase tracking-widest">Neural Error</h4>
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{error || "The AI engine was unable to process this request. Please try again."}</p>
             </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
        <button 
          onClick={() => useChatStore.setState({ aiResult: null })}
          className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] hover:underline mb-4"
        >
          <RefreshCw size={10} /> Neural Interface
        </button>

        {feature === "summary" && (
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Conversation Recap</h5>
            {Array.isArray(result) && result.map((p, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="mt-1.5 size-1.5 rounded-full bg-purple-500 shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                <p className="text-xs font-semibold text-slate-300 leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        )}

        {feature === "auto_reply" && (
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Suggested Responses</h5>
            {Array.isArray(result) && result.map((r, i) => (
              <button 
                key={i} 
                onClick={() => {
                  useChatStore.getState().sendMessage({ text: r });
                  useChatStore.getState().toggleAIHub();
                }}
                className="w-full text-left p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-white hover:bg-purple-500/20 transition-all"
              >
                "{r}"
              </button>
            ))}
          </div>
        )}

        {feature === "sentiment" && (
          <div className="text-center py-10 space-y-6 bg-white/[0.03] rounded-[2rem] border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
            <Smile className={`size-20 mx-auto relative z-10 ${result.sentiment === 'Positive' ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div className="relative z-10">
              <h4 className="text-3xl font-black text-white uppercase tracking-tighter">{result.sentiment}</h4>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] mt-2">{result.emotion}</p>
            </div>
          </div>
        )}

        {feature === "tasks" && (
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Neural Task Extraction</h5>
            {Array.isArray(result) && result.map((t, i) => (
              <div key={i} className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                <div className="text-[11px] font-black text-emerald-400 uppercase tracking-tight leading-tight">{t.task}</div>
                <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1"><User size={10} /> {t.person}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} /> {t.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {feature === "moderate" && (
          <div className={`p-8 rounded-[2rem] text-center space-y-5 ${result.flagged ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
            <ShieldCheck className={`size-16 mx-auto ${result.flagged ? 'text-rose-500' : 'text-emerald-400'}`} />
            <div className="space-y-1">
              <h4 className="font-black text-white uppercase tracking-widest">{result.flagged ? 'Risk Detected' : 'Safety Verified'}</h4>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{result.reason || "Stream integrity verified."}</p>
            </div>
          </div>
        )}

        {feature === "search" && (
          <div className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Contextual Matches</h5>
            {Array.isArray(result) && result.map((m, i) => (
              <div key={i} className="p-4 rounded-2xl bg-black/20 border border-white/5 text-[11px] text-slate-300 font-medium italic leading-relaxed">
                "{m}"
              </div>
            ))}
          </div>
        )}

        {(feature === "translate" || feature === "tone" || feature === "chatbot") && (
          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 space-y-4">
             <Brain className="size-5 text-purple-500" />
             <p className="text-sm font-bold text-white leading-relaxed italic">"{result}"</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 h-full flex flex-col bg-white/[0.02] backdrop-blur-3xl border-l border-white/5 animate-in slide-in-from-right-full duration-700 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-30">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <Sparkles className="size-5 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">Magic Hub</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Neural Engine 1.5</p>
          </div>
        </div>
        <button onClick={toggleAIHub} className="btn btn-ghost btn-sm btn-circle text-slate-500 hover:text-white transition-all">
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 premium-scrollbar space-y-6">
        {renderResult()}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-white/5 bg-black/20">
        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
          <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-purple-500/50" /> Secure Node</span>
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5">v1.5.0-PRO</span>
        </div>
      </div>
    </div>
  );
};

export default AIHubPanel;
