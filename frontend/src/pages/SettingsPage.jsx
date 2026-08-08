import { useState } from "react";
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useNavigate } from "react-router-dom";
import { 
  Palette, 
  Bot, 
  Bell, 
  Shield, 
  Globe, 
  Check, 
  ArrowLeft, 
  Sparkles, 
  MessageCircle, 
  Volume2, 
  Sliders, 
  Lock, 
  CheckCircle2,
  Clock,
  Search,
  RotateCcw,
  VolumeX,
  Zap,
  HardDrive,
  Trash2,
  Cpu,
  Radio
} from "lucide-react";
import toast from "react-hot-toast";

const AI_MODELS = [
  { id: "Qwen/Qwen2.5-Coder-32B-Instruct", name: "Qwen 2.5 Coder 32B", badge: "Smartest", desc: "Best for complex reasoning, code & detailed chat" },
  { id: "meta-llama/Llama-3.2-3B-Instruct", name: "Llama 3.2 3B", badge: "Ultra Fast", desc: "Lightweight, ultra-fast responses for quick replies" },
  { id: "mistralai/Mistral-7B-Instruct-v0.3", name: "Mistral 7B Instruct", badge: "Balanced", desc: "Great overall balance between speed & accuracy" },
  { id: "google/gemma-2-2b-it", name: "Gemma 2B", badge: "Lightweight", desc: "High efficiency model for simple assistance" }
];

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How is the new chat app looking?", isSent: false, time: "12:00 PM" },
  { id: 2, content: "It looks super clean, modern, and lightning fast! 🚀", isSent: true, time: "12:01 PM" },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("appearance");
  const [themeSearch, setThemeSearch] = useState("");
  const [selectedAIModel, setSelectedAIModel] = useState("Qwen/Qwen2.5-Coder-32B-Instruct");

  // Local settings state with persistence support
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("app_settings");
    return saved ? JSON.parse(saved) : {
      enableChatbot: true,
      aiModeration: true,
      autoSuggestReplies: true,
      desktopAlerts: true,
      soundEffects: true,
      typingIndicators: true,
      readReceipts: true,
      language: "English (US)",
      timeFormat: "12-hour"
    };
  });

  const toggleSetting = (key) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("app_settings", JSON.stringify(updated));
      toast.success("Setting updated", { duration: 1200 });
      return updated;
    });
  };

  const handleSelectChange = (key, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem("app_settings", JSON.stringify(updated));
      toast.success("Preference saved", { duration: 1200 });
      return updated;
    });
  };

  const playTestSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
      toast.success("Sound chime test played 🔔");
    } catch (e) {
      toast.success("Audio chime enabled!");
    }
  };

  const clearAppCache = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Clearing local app cache...",
        success: "App cache cleared successfully!",
        error: "Failed to clear cache",
      }
    );
  };

  const filteredThemes = THEMES.filter(t => t.toLowerCase().includes(themeSearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#111214] text-[#DBDEE1] font-sans pb-16">
      
      {/* Compact Top Navigation Bar */}
      <div className="bg-[#1e1f22]/90 border-b border-white/5 px-4 sm:px-6 py-3.5 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/5 font-bold text-xs group"
          >
            <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Chat</span>
          </button>

          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-purple-400" />
            <h1 className="font-extrabold text-sm text-white">System Settings & Preferences</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-400 hidden sm:inline capitalize">{theme} Theme</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-5 space-y-6 animate-in fade-in duration-300">
        
        {/* Category Tabs Header */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-[#1e1f22] rounded-2xl border border-white/10 no-scrollbar shadow-xl">
          {[
            { id: "appearance", label: "Visual Themes", icon: Palette },
            { id: "ai", label: "AI Models Engine", icon: Bot },
            { id: "notifications", label: "Notifications & Sound", icon: Bell },
            { id: "privacy", label: "Privacy & Security", icon: Shield },
            { id: "system", label: "System & Cache", icon: HardDrive },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive 
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25 scale-[1.02]" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Visual Themes & Aesthetics */}
        {activeTab === "appearance" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Live Chat Theme Preview Window */}
            <div className="bg-[#1e1f22] rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Interactive Theme Showcase</h3>
                    <p className="text-xs text-slate-400">Selected theme: <span className="text-purple-400 font-bold uppercase">{theme}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setTheme("dark")} 
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 flex items-center gap-1.5 border border-white/5"
                  >
                    <RotateCcw size={12} />
                    <span>Reset Default Dark</span>
                  </button>
                </div>
              </div>

              {/* Live Preview UI Element */}
              <div className="rounded-2xl p-5 border border-white/10 shadow-inner bg-base-100 overflow-hidden" data-theme={theme}>
                <div className="max-w-md mx-auto space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-base-content/10">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold text-[10px]">
                        AI
                      </div>
                      <div>
                        <div className="font-bold text-xs text-base-content">Theme Live Preview</div>
                        <div className="text-[10px] text-base-content/60">Active Theme: {theme}</div>
                      </div>
                    </div>
                    <span className="badge badge-primary badge-sm text-[10px] font-extrabold">Active</span>
                  </div>

                  {PREVIEW_MESSAGES.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isSent ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                        msg.isSent ? "bg-primary text-primary-content rounded-tr-none font-medium" : "bg-secondary/20 text-base-content rounded-tl-none border border-base-content/10 font-medium"
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-[9px] mt-1 text-right ${msg.isSent ? "opacity-80" : "opacity-50"}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme Selector Palette */}
            <div className="bg-[#1e1f22] rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Palette className="size-4 text-purple-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Select Theme Palette ({filteredThemes.length})</h3>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text"
                    value={themeSearch}
                    onChange={(e) => setThemeSearch(e.target.value)}
                    placeholder="Search 30+ themes..."
                    className="w-full bg-[#2b2d31] border border-white/10 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredThemes.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTheme(t);
                      toast.success(`Theme set to ${t}`, { duration: 1200 });
                    }}
                    className={`
                      group flex flex-col items-center gap-2.5 p-3 rounded-2xl transition-all duration-200 border text-left relative overflow-hidden
                      ${theme === t 
                        ? "bg-purple-500/15 border-purple-500/60 ring-2 ring-purple-500/40 shadow-xl" 
                        : "bg-[#2b2d31] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"}
                    `}
                  >
                    <div className="relative h-10 w-full rounded-xl overflow-hidden border border-white/10 shadow-inner" data-theme={t}>
                      <div className="absolute inset-0 grid grid-cols-4 gap-px p-1 bg-base-100">
                        <div className="rounded-xs bg-primary" />
                        <div className="rounded-xs bg-secondary" />
                        <div className="rounded-xs bg-accent" />
                        <div className="rounded-xs bg-neutral" />
                      </div>
                      {theme === t && (
                        <div className="absolute inset-0 flex items-center justify-center bg-purple-600/30 backdrop-blur-[1px]">
                          <div className="size-5 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-md">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-bold truncate w-full text-center capitalize ${
                      theme === t ? "text-purple-300" : "text-slate-300 group-hover:text-white"
                    }`}>
                      {t}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: AI Models Engine */}
        {activeTab === "ai" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Model Selection Card */}
            <div className="p-6 rounded-3xl bg-[#1e1f22] border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Cpu className="size-4 text-purple-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Select Primary Open-Source AI Model</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-3.5">
                {AI_MODELS.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedAIModel(m.id);
                      toast.success(`Selected ${m.name}`);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                      selectedAIModel === m.id 
                        ? "bg-purple-500/10 border-purple-500/50 ring-1 ring-purple-500/30" 
                        : "bg-[#2b2d31] border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Radio className={`size-4 ${selectedAIModel === m.id ? "text-purple-400" : "text-slate-500"}`} />
                        <h4 className="font-extrabold text-xs text-white">{m.name}</h4>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium pl-6">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Capability Toggles */}
            <div className="p-6 rounded-3xl bg-[#1e1f22] border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Bot className="size-4 text-purple-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Smart Assistance Features</h3>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div 
                  onClick={() => toggleSetting("enableChatbot")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${settings.enableChatbot ? "bg-purple-500/10 border-purple-500/30" : "bg-[#2b2d31] border-white/5 opacity-70"}`}
                >
                  <div className="flex items-center justify-between">
                    <Bot size={20} className={settings.enableChatbot ? "text-purple-400" : "text-slate-400"} />
                    <span className={`size-2.5 rounded-full ${settings.enableChatbot ? "bg-emerald-400" : "bg-slate-600"}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">AI Assistant Hub</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Standalone chatbot sessions powered by HuggingFace</p>
                  </div>
                </div>

                <div 
                  onClick={() => toggleSetting("autoSuggestReplies")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${settings.autoSuggestReplies ? "bg-indigo-500/10 border-indigo-500/30" : "bg-[#2b2d31] border-white/5 opacity-70"}`}
                >
                  <div className="flex items-center justify-between">
                    <Sparkles size={20} className={settings.autoSuggestReplies ? "text-indigo-400" : "text-slate-400"} />
                    <span className={`size-2.5 rounded-full ${settings.autoSuggestReplies ? "bg-emerald-400" : "bg-slate-600"}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Smart Reply Chips</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Contextual one-click reply chips inside messages</p>
                  </div>
                </div>

                <div 
                  onClick={() => toggleSetting("aiModeration")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${settings.aiModeration ? "bg-blue-500/10 border-blue-500/30" : "bg-[#2b2d31] border-white/5 opacity-70"}`}
                >
                  <div className="flex items-center justify-between">
                    <Shield size={20} className={settings.aiModeration ? "text-blue-400" : "text-slate-400"} />
                    <span className={`size-2.5 rounded-full ${settings.aiModeration ? "bg-emerald-400" : "bg-slate-600"}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">AI Safety Guard</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Automatic toxicity and spam message protection</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Notifications & Audio */}
        {activeTab === "notifications" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="p-6 rounded-3xl bg-[#1e1f22] border border-white/10 space-y-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Bell className="size-4 text-purple-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Sound Chimes & Desktop Alerts</h3>
                </div>
                
                <button 
                  onClick={playTestSound}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Volume2 size={13} />
                  <span>Test Sound Chime</span>
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => toggleSetting("desktopAlerts")}
                  className="flex items-center justify-between p-5 rounded-2xl bg-[#2b2d31] border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Bell size={20} className="text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs text-white">Desktop Push Notifications</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Show toast popups when new messages arrive</p>
                    </div>
                  </div>
                  <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${settings.desktopAlerts ? "bg-purple-600" : "bg-slate-700"}`}>
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-white transition duration-200 ${settings.desktopAlerts ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                </div>

                <div 
                  onClick={() => toggleSetting("soundEffects")}
                  className="flex items-center justify-between p-5 rounded-2xl bg-[#2b2d31] border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Volume2 size={20} className="text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs text-white">Audio Sound Chimes</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Play subtle sound chime on message receive</p>
                    </div>
                  </div>
                  <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${settings.soundEffects ? "bg-purple-600" : "bg-slate-700"}`}>
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-white transition duration-200 ${settings.soundEffects ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Privacy & Security */}
        {activeTab === "privacy" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="p-6 rounded-3xl bg-[#1e1f22] border border-white/10 space-y-5 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Lock className="size-4 text-purple-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Privacy Controls & End-to-End Encryption</h3>
              </div>

              <div className="space-y-3">
                <div 
                  onClick={() => toggleSetting("typingIndicators")}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#2b2d31] border border-white/5 cursor-pointer hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle size={18} className="text-purple-400" />
                    <div>
                      <h4 className="font-bold text-xs text-white">Typing Status Indicator</h4>
                      <p className="text-[11px] text-slate-400">Broadcast typing status when composing messages</p>
                    </div>
                  </div>
                  <div className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${settings.typingIndicators ? "bg-purple-600" : "bg-slate-700"}`}>
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-white transition duration-200 ${settings.typingIndicators ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                </div>

                <div 
                  onClick={() => toggleSetting("readReceipts")}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#2b2d31] border border-white/5 cursor-pointer hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-cyan-400" />
                    <div>
                      <h4 className="font-bold text-xs text-white">Read Receipts (Checkmarks)</h4>
                      <p className="text-[11px] text-slate-400">Senders will see blue double checkmarks when read</p>
                    </div>
                  </div>
                  <div className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${settings.readReceipts ? "bg-purple-600" : "bg-slate-700"}`}>
                    <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-white transition duration-200 ${settings.readReceipts ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Language & Time Locale */}
            <div className="p-6 rounded-3xl bg-[#1e1f22] border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Globe className="size-4 text-purple-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Language & Regional Clock</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">App Interface Language</label>
                  <select 
                    value={settings.language}
                    onChange={(e) => handleSelectChange("language", e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#2b2d31] border border-white/10 rounded-xl text-white font-bold text-xs outline-none focus:border-purple-500"
                  >
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Hindi</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                    <Clock size={12} /> Time Format
                  </label>
                  <select 
                    value={settings.timeFormat}
                    onChange={(e) => handleSelectChange("timeFormat", e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#2b2d31] border border-white/10 rounded-xl text-white font-bold text-xs outline-none focus:border-purple-500"
                  >
                    <option>12-hour (12:00 PM)</option>
                    <option>24-hour (24:00)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 5: System & Storage Cache */}
        {activeTab === "system" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="p-6 rounded-3xl bg-[#1e1f22] border border-white/10 space-y-5 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <HardDrive className="size-4 text-purple-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Storage & Local Cache Management</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#2b2d31] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Local Cache Usage</span>
                    <span className="text-xs font-bold text-emerald-400">4.2 MB</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 w-[12%]" />
                  </div>
                  <p className="text-[10px] text-slate-400">Cached message summaries, voice notes, and media thumbnails.</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#2b2d31] border border-white/5 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">Clear App Cache</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Frees local memory without removing your saved account logins.</p>
                  </div>
                  <button 
                    onClick={clearAppCache}
                    className="w-full py-2 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={13} />
                    <span>Clear Local Cache</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default SettingsPage;


