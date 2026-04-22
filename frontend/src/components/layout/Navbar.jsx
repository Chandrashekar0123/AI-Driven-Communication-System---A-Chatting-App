import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="fixed w-full top-0 z-50 px-6 pt-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] px-10 h-20 flex items-center justify-between shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/5 relative overflow-hidden group">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          
          <div className="flex items-center gap-8 relative z-10">
            <Link to="/" className="flex items-center gap-4 hover-elevate group">
              <div className="size-13 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/10 flex items-center justify-center group-hover:from-purple-500 group-hover:to-blue-600 transition-all duration-700 group-hover:rotate-[15deg] shadow-2xl border border-white/10 group-hover:border-transparent">
                <MessageSquare className="w-7 h-7 text-purple-400 group-hover:text-white transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter text-white">Chatty</span>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 group-hover:text-purple-400 transition-colors">Premium</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            {authUser && (
              <>
                <Link
                  to={"/settings"}
                  className="btn btn-ghost btn-sm gap-3 rounded-[1.5rem] hover:bg-white/5 transition-all h-12 px-7 border border-transparent hover:border-white/5 group"
                >
                  <Settings className="w-4 h-4 text-slate-400 group-hover:rotate-90 group-hover:text-white transition-all duration-700" />
                  <span className="hidden sm:inline font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 group-hover:text-white">Neural Config</span>
                </Link>

                <Link 
                  to={"/profile"} 
                  className="btn btn-ghost btn-sm gap-3 rounded-[1.5rem] hover:bg-white/5 transition-all h-12 px-7 border border-transparent hover:border-white/5 group"
                >
                  <User className="w-4 h-4 text-slate-400 group-hover:scale-125 group-hover:text-white transition-all" />
                  <span className="hidden sm:inline font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 group-hover:text-white">Biometrics</span>
                </Link>

                <div className="w-[1px] h-8 bg-white/5 mx-2" />

                <button 
                  className="btn btn-ghost btn-sm gap-3 rounded-[1.5rem] hover:bg-rose-500/10 hover:text-rose-500 transition-all h-12 px-7 border border-transparent hover:border-rose-500/20 group" 
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden sm:inline font-black text-[10px] uppercase tracking-[0.2em]">Disconnect</span>
                </button>
              </>
            )}

            {!authUser && (
              <Link
                to="/login"
                className="btn bg-gradient-to-r from-[#8b5cf6] to-[#4f46e5] border-none text-white btn-sm rounded-2xl h-12 px-10 shadow-2xl shadow-purple-500/30 font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all"
              >
                Access Hub
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
