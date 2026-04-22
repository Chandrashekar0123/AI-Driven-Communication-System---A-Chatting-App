import { Home, MessageSquare, Settings, LogOut, Sparkles, Compass, Plus } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const ServerRail = () => {
  const { authUser, logout } = useAuthStore();
  const { setSelectedChat, selectedChat, aiResult } = useChatStore();

  const servers = [
    { id: "home", icon: Home },
    { id: "explore", icon: Compass },
    { id: "add", icon: Plus },
  ];

  return (
    <nav className="w-[76px] h-full flex flex-col items-center py-4 bg-white/[0.01] backdrop-blur-3xl border-r border-white/5 select-none transition-all duration-300 relative z-40">
      <div onClick={() => setSelectedChat(null)} className="relative group cursor-pointer mb-3">
        <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-2 bg-white rounded-r-full group-hover:h-6 transition-all duration-500 opacity-0 group-hover:opacity-100 ${!selectedChat ? 'h-8 opacity-100' : ''}`} />
        <div className={`size-13 rounded-2xl group-hover:rounded-xl transition-all duration-500 flex items-center justify-center shadow-2xl ${!selectedChat ? 'bg-gradient-to-br from-[#8b5cf6] to-[#4f46e5] text-white' : 'bg-white/5 text-slate-400 group-hover:bg-gradient-to-br group-hover:from-[#8b5cf6] group-hover:to-[#4f46e5] group-hover:text-white'}`}>
          <MessageSquare className="size-6" />
        </div>
      </div>

      <div className="w-8 h-[1px] bg-white/5 my-3 rounded-full" />

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar py-1 w-full items-center">
        {servers.map((server) => (
          <div key={server.id} className="relative group cursor-pointer" onClick={() => toast.success("Feature coming in next update!")}>
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-0 bg-white rounded-r-full group-hover:h-6 transition-all duration-500" />
            <div className="size-13 rounded-2xl group-hover:rounded-xl transition-all duration-500 flex items-center justify-center shadow-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5">
              <server.icon className="size-6" />
            </div>
          </div>
        ))}

        <div className="w-8 h-[1px] bg-white/5 my-1 rounded-full" />

        <div className="relative group cursor-pointer" onClick={() => {
          const { selectedChat, toggleAIHub } = useChatStore.getState();
          if (!selectedChat) {
             toast.error("Please select a chat first to use the Magic Hub");
          } else {
             toggleAIHub();
          }
        }}>
          <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-0 bg-purple-500 rounded-r-full group-hover:h-10 transition-all duration-500 ${aiResult ? 'h-10 opacity-100' : ''}`} />
          <div className={`size-13 rounded-2xl group-hover:rounded-xl transition-all duration-500 flex items-center justify-center shadow-2xl border border-purple-500/20 ${aiResult ? 'bg-purple-600 text-white scale-110 shadow-purple-500/30' : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white'}`}>
            <Sparkles className="size-6 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 pb-4 pt-4 border-t border-white/5 w-full items-center">
        <Link to="/profile" className="relative group cursor-pointer">
          <div className="size-12 rounded-2xl group-hover:rounded-xl overflow-hidden transition-all duration-500 ring-2 ring-transparent group-hover:ring-purple-500 shadow-2xl">
            <img src={authUser.profilePic || "/avatar.png"} alt="profile" className="w-full h-full object-cover" />
          </div>
          <span className="absolute bottom-0 right-0 size-3.5 bg-[#23A559] rounded-full border-2 border-[#12141a] shadow-lg" />
        </Link>

        <Link to="/settings" className="relative group cursor-pointer">
          <div className="size-13 rounded-2xl group-hover:rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all duration-500 shadow-lg border border-white/5">
            <Settings className="size-6" />
          </div>
        </Link>

        <div onClick={logout} className="relative group cursor-pointer">
          <div className="size-13 rounded-2xl group-hover:rounded-xl bg-white/5 text-rose-500 hover:text-white hover:bg-rose-500 flex items-center justify-center transition-all duration-500 shadow-lg border border-white/5">
            <LogOut className="size-6" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ServerRail;
