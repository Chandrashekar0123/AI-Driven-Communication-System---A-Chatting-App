import { Home, MessageSquare, Settings, LogOut, Sparkles, Compass, Plus, Bot } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const ServerRail = () => {
  const { authUser, logout } = useAuthStore();
  const { setSelectedChat, selectedChat, aiResult } = useChatStore();
  const location = useLocation();

  const isAIChatActive = location.pathname === "/ai-chat";

  const staticButtons = [
    { id: "explore", icon: Compass, label: "Explore" },
    { id: "add",     icon: Plus,    label: "Add" },
  ];

  return (
    <nav className="w-[72px] h-full flex flex-col items-center py-3 bg-[#1e1f22] border-r border-white/5 select-none transition-all duration-300 relative z-40">

      {/* Chat Home Button */}
      <div onClick={() => setSelectedChat(null)} className="relative group cursor-pointer mb-2">
        <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white transition-all duration-300 ${!selectedChat && location.pathname === "/" ? "h-8 opacity-100" : "h-0 opacity-0 group-hover:h-5 group-hover:opacity-100"}`} />
        <div className={`size-12 rounded-2xl group-hover:rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg ${!selectedChat && location.pathname === "/" ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl" : "bg-white/[0.06] text-slate-400 group-hover:bg-indigo-500 group-hover:text-white"}`}>
          <MessageSquare className="size-5" />
        </div>
      </div>

      <div className="w-8 h-[1px] bg-white/[0.06] my-2 rounded-full" />

      {/* Static placeholder buttons */}
      <div className="flex flex-col gap-3 items-center">
        {staticButtons.map((btn) => (
          <div key={btn.id} className="relative group cursor-pointer" onClick={() => toast("Coming soon!", { icon: "🚧" })}>
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-0 bg-white rounded-r-full group-hover:h-5 transition-all duration-300 opacity-0 group-hover:opacity-100" />
            <div className="size-12 rounded-2xl group-hover:rounded-xl transition-all duration-300 flex items-center justify-center bg-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10">
              <btn.icon className="size-5" />
            </div>
          </div>
        ))}

        <div className="w-8 h-[1px] bg-white/[0.06] my-1 rounded-full" />

        {/* AI Chatbot Button (like WhatsApp AI) */}
        <Link to="/ai-chat" className="relative group cursor-pointer">
          <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-purple-400 transition-all duration-300 ${isAIChatActive ? "h-8 opacity-100" : "h-0 opacity-0 group-hover:h-5 group-hover:opacity-100"}`} />
          <div className={`size-12 rounded-2xl group-hover:rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg border ${isAIChatActive ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl border-transparent shadow-purple-500/40" : "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500 hover:text-white hover:border-transparent"}`}>
            <Bot className="size-5" />
          </div>
          <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#111214] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl border border-white/10 z-50">
            AI Chatbot
          </div>
        </Link>

        {/* Magic AI Hub */}
        <div className="relative group cursor-pointer" onClick={() => {
          const { selectedChat: sc, toggleAIHub } = useChatStore.getState();
          if (!sc) { toast.error("Select a chat first"); return; }
          toggleAIHub();
        }}>
          <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-purple-400 transition-all duration-300 ${aiResult ? "h-8 opacity-100" : "h-0 opacity-0 group-hover:h-5 group-hover:opacity-100"}`} />
          <div className={`size-12 rounded-2xl group-hover:rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg border border-purple-500/20 ${aiResult ? "bg-purple-600 text-white rounded-xl shadow-purple-500/30" : "bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white hover:border-transparent"}`}>
            <Sparkles className="size-5 animate-pulse" />
          </div>
          <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#111214] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl border border-white/10 z-50">
            Magic Hub
          </div>
        </div>
      </div>

      {/* Bottom: Profile + Settings + Logout */}
      <div className="flex flex-col gap-3 pb-3 pt-3 border-t border-white/[0.06] w-full items-center mt-auto">
        <Link to="/profile" className="relative group cursor-pointer">
          <div className="size-11 rounded-2xl group-hover:rounded-xl overflow-hidden transition-all duration-300 ring-2 ring-transparent group-hover:ring-purple-500 shadow-lg">
            <img src={authUser.profilePic || "/avatar.png"} alt="profile" className="w-full h-full object-cover" />
          </div>
          <span className="absolute bottom-0 right-0 size-3 bg-[#23A559] rounded-full border-2 border-[#1e1f22]" />
          <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#111214] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl border border-white/10 z-50">
            My Profile
          </div>
        </Link>

        <Link to="/settings" className="relative group cursor-pointer">
          <div className="size-11 rounded-2xl group-hover:rounded-xl bg-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all duration-300 shadow-lg">
            <Settings className="size-5" />
          </div>
          <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#111214] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl border border-white/10 z-50">
            Settings
          </div>
        </Link>

        <div onClick={logout} className="relative group cursor-pointer">
          <div className="size-11 rounded-2xl group-hover:rounded-xl bg-white/[0.06] text-rose-400 hover:text-white hover:bg-rose-500 flex items-center justify-center transition-all duration-300 shadow-lg">
            <LogOut className="size-5" />
          </div>
          <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#111214] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl border border-white/10 z-50">
            Logout
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ServerRail;
