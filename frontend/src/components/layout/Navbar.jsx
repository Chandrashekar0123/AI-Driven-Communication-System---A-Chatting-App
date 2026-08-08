import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();

  const isSettings = location.pathname === "/settings";
  const isProfile = location.pathname === "/profile";

  return (
    <header className="fixed w-full top-0 z-50 px-6 pt-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#1e1f22]/80 backdrop-blur-3xl rounded-[2.5rem] px-10 h-20 flex items-center justify-between shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/10 relative overflow-hidden group">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          
          <div className="flex items-center gap-8 relative z-10">
            <Link to="/" className="flex items-center gap-4 hover-elevate group">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-2xl border border-white/10 group-hover:rotate-[10deg] transition-all duration-500">
                <img src="/logo.png" alt="Chatty Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter text-white">Chatty</span>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-400 group-hover:text-purple-300 transition-colors">Settings</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            {authUser && (
              <>
                <Link
                  to={"/settings"}
                  className={`btn btn-ghost btn-sm gap-3 rounded-[1.5rem] transition-all h-12 px-7 border group ${
                    isSettings 
                      ? "bg-purple-500/15 border-purple-500/40 text-white shadow-lg" 
                      : "border-transparent hover:bg-white/5 hover:border-white/5"
                  }`}
                >
                  <Settings className={`w-4 h-4 transition-all duration-700 ${isSettings ? "text-purple-400 rotate-90" : "text-slate-400 group-hover:rotate-90 group-hover:text-white"}`} />
                  <span className={`hidden sm:inline font-black text-[10px] uppercase tracking-[0.2em] ${isSettings ? "text-purple-300" : "text-slate-400 group-hover:text-white"}`}>Settings</span>
                </Link>

                <Link 
                  to={"/profile"} 
                  className={`btn btn-ghost btn-sm gap-3 rounded-[1.5rem] transition-all h-12 px-7 border group ${
                    isProfile 
                      ? "bg-purple-500/15 border-purple-500/40 text-white shadow-lg" 
                      : "border-transparent hover:bg-white/5 hover:border-white/5"
                  }`}
                >
                  <User className={`w-4 h-4 transition-all ${isProfile ? "text-purple-400 scale-110" : "text-slate-400 group-hover:scale-125 group-hover:text-white"}`} />
                  <span className={`hidden sm:inline font-black text-[10px] uppercase tracking-[0.2em] ${isProfile ? "text-purple-300" : "text-slate-400 group-hover:text-white"}`}>Profile</span>
                </Link>

                <div className="w-[1px] h-8 bg-white/5 mx-2" />

                <button 
                  className="btn btn-ghost btn-sm gap-3 rounded-[1.5rem] hover:bg-rose-500/10 hover:text-rose-500 transition-all h-12 px-7 border border-transparent hover:border-rose-500/20 group" 
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden sm:inline font-black text-[10px] uppercase tracking-[0.2em]">Logout</span>
                </button>
              </>
            )}

            {!authUser && (
              <Link
                to="/login"
                className="btn bg-gradient-to-r from-[#8b5cf6] to-[#4752C4] border-none text-white btn-sm rounded-2xl h-12 px-10 shadow-2xl shadow-purple-500/30 font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all"
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
