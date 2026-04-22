import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Palette, Layout, Check, Bell, Shield, Bot, Globe } from "lucide-react";

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-base-200 pt-24 pb-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="space-y-2 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3 justify-center lg:justify-start">
             <h2 className="text-4xl font-black text-white tracking-tighter">Settings</h2>
             <span className="text-xs font-black uppercase tracking-[0.3em] text-[#8b5cf6] pb-1">Neural Config</span>
          </div>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Manage your application preferences and AI features</p>
        </div>

        <div className="grid gap-8">
          {/* Theme Switcher Section */}
          <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><Palette size={120} /></div>
             <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400"><Layout size={20} /></div>
                <h3 className="font-black text-sm uppercase tracking-widest text-white">Visual Themes</h3>
             </div>

             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {THEMES.map((t) => (
                <button
                  key={t}
                  className={`
                    group flex flex-col items-center gap-3 p-3 rounded-2xl transition-all duration-300 relative
                    ${theme === t ? "bg-white/10 ring-2 ring-purple-500 shadow-2xl" : "hover:bg-white/5"}
                  `}
                  onClick={() => setTheme(t)}
                >
                  <div className="relative h-12 w-full rounded-xl overflow-hidden shadow-inner" data-theme={t}>
                    <div className="absolute inset-0 grid grid-cols-4 gap-px p-1.5 bg-base-100">
                      <div className="rounded bg-primary opacity-80"></div>
                      <div className="rounded bg-secondary opacity-80"></div>
                      <div className="rounded bg-accent opacity-80"></div>
                      <div className="rounded bg-neutral opacity-80"></div>
                    </div>
                    {theme === t && (
                      <div className="absolute inset-0 flex items-center justify-center bg-purple-500/20 backdrop-blur-[1px]">
                         <Check size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest truncate w-full text-center text-slate-400 group-hover:text-white transition-colors">
                    {t}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Features Settings */}
          <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400"><Bot size={20} /></div>
                <h3 className="font-black text-sm uppercase tracking-widest text-white">AI Assistant Preferences</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                   <div className="flex items-center gap-4">
                      <div className="text-slate-400"><Bot size={20} /></div>
                      <div>
                         <h4 className="font-black text-sm text-white tracking-tighter">Enable Chatbot</h4>
                         <p className="text-[10px] font-bold text-slate-500 uppercase">Allow the AI to assist in conversations</p>
                      </div>
                   </div>
                   <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                   <div className="flex items-center gap-4">
                      <div className="text-slate-400"><Shield size={20} /></div>
                      <div>
                         <h4 className="font-black text-sm text-white tracking-tighter">AI Content Moderation</h4>
                         <p className="text-[10px] font-bold text-slate-500 uppercase">Automatically filter toxic messages</p>
                      </div>
                   </div>
                   <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>
              </div>
          </div>

          {/* General Settings */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400"><Bell size={20} /></div>
                  <h3 className="font-black text-sm uppercase tracking-widest text-white">Notifications</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Desktop Alerts</span>
                    <input type="checkbox" className="toggle toggle-sm" defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Sound</span>
                    <input type="checkbox" className="toggle toggle-sm" defaultChecked />
                  </div>
                </div>
            </div>

            <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400"><Globe size={20} /></div>
                  <h3 className="font-black text-sm uppercase tracking-widest text-white">Language & Region</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Language</span>
                    <select className="select select-sm select-bordered bg-white/5 border-white/10 text-white font-bold">
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Time Format</span>
                    <select className="select select-sm select-bordered bg-white/5 border-white/10 text-white font-bold">
                      <option>12-hour</option>
                      <option>24-hour</option>
                    </select>
                  </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
