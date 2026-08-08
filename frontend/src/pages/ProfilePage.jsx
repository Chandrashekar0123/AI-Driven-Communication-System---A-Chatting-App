import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { 
  Camera, 
  Mail, 
  User, 
  Shield, 
  Calendar, 
  CheckCircle2, 
  Save, 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Check, 
  Lock, 
  MessageSquare, 
  Users, 
  HardDrive, 
  Activity,
  Key
} from "lucide-react";
import toast from "react-hot-toast";

const COVER_PRESETS = [
  "from-purple-900 via-indigo-900 to-slate-900",
  "from-blue-900 via-purple-900 to-pink-900",
  "from-emerald-900 via-teal-900 to-slate-900",
  "from-amber-900 via-rose-900 to-purple-900"
];

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const navigate = useNavigate();
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedCover, setSelectedCover] = useState(null);
  const [activePreset, setActivePreset] = useState(COVER_PRESETS[0]);
  const [copiedId, setCopiedId] = useState(false);
  const [userPresence, setUserPresence] = useState("Online");

  const [formData, setFormData] = useState({
    bio: "",
    status: ""
  });

  useEffect(() => {
    if (authUser) {
      setFormData({
        bio: authUser.bio || "",
        status: authUser.status || "Hey there! I am using Chat app."
      });
    }
  }, [authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedCover(base64Image);
      await updateProfile({ coverPhoto: base64Image });
    };
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    await updateProfile({
      bio: formData.bio,
      status: formData.status
    });
  };

  const copyUserId = () => {
    if (!authUser?._id) return;
    navigator.clipboard.writeText(authUser._id);
    setCopiedId(true);
    toast.success("User ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#111214] text-[#DBDEE1] font-sans pb-12">
      
      {/* Compact Top Navigation Bar */}
      <div className="bg-[#1e1f22]/90 border-b border-white/5 px-4 sm:px-6 py-3.5 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/5 font-bold text-xs group"
          >
            <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Chat</span>
          </button>

          <div className="flex items-center gap-2">
            <User className="size-4 text-purple-400" />
            <h1 className="font-extrabold text-sm text-white">User Profile</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">Active</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-5 animate-in fade-in duration-300">
        
        {/* Profile Card Header Banner */}
        <div className="bg-[#1e1f22] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
          
          {/* Cover Photo / Preset Banner */}
          <div className={`relative h-36 sm:h-48 bg-gradient-to-r ${activePreset} border-b border-white/5 group`}>
            {(selectedCover || authUser?.coverPhoto) ? (
              <img src={selectedCover || authUser.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-xs font-bold text-slate-300">
                  <Sparkles className="size-3.5 text-purple-400" />
                  <span>Personalized Gradient Banner</span>
                </div>
              </div>
            )}

            {/* Gradient Preset Selector & Upload Button */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-lg">
              {COVER_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedCover(null); setActivePreset(preset); }}
                  className={`size-5 rounded-full bg-gradient-to-r ${preset} border transition-all ${activePreset === preset && !selectedCover ? "ring-2 ring-purple-400 scale-110 border-white" : "border-white/20 opacity-70 hover:opacity-100"}`}
                  title={`Preset ${idx + 1}`}
                />
              ))}
              <label className="p-1 rounded-xl hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer transition-all">
                <Camera className="size-4" />
                <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={isUpdatingProfile} />
              </label>
            </div>
          </div>

          {/* Avatar & Header Details */}
          <div className="px-6 sm:px-8 pb-6 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
              
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                {/* Avatar */}
                <div className="relative group">
                  <div className="size-24 sm:size-32 rounded-full overflow-hidden border-4 border-[#1e1f22] bg-[#2b2d31] shadow-2xl ring-4 ring-purple-500/30 group-hover:ring-purple-500/60 transition-all">
                    <img
                      src={selectedImg || authUser?.profilePic || "/avatar.png"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className={`
                      absolute bottom-0 right-0 
                      bg-gradient-to-r from-purple-500 to-indigo-600
                      p-2 rounded-xl cursor-pointer 
                      transition-all duration-300 shadow-xl border-2 border-[#1e1f22]
                      hover:scale-110 active:scale-95 text-white
                      ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                    `}
                    title="Change profile picture"
                  >
                    <Camera className="size-3.5" />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUpdatingProfile}
                    />
                  </label>
                </div>

                {/* Name & ID */}
                <div className="space-y-1 mb-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{authUser?.fullName}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-extrabold uppercase">
                      Pro User
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium truncate max-w-xs">{authUser?.email}</p>
                </div>
              </div>

              {/* User ID Copy & Presence Selector */}
              <div className="flex items-center gap-2 bg-[#2b2d31] p-1.5 rounded-2xl border border-white/5">
                <select
                  value={userPresence}
                  onChange={(e) => setUserPresence(e.target.value)}
                  className="bg-[#1e1f22] text-xs font-bold text-white px-3 py-1.5 rounded-xl border border-white/10 outline-none focus:border-purple-500"
                >
                  <option value="Online">🟢 Online</option>
                  <option value="Away">🟡 Away</option>
                  <option value="Busy">🔴 Busy</option>
                  <option value="Invisible">⚪ Invisible</option>
                </select>

                <button
                  onClick={copyUserId}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-bold transition-all"
                  title="Copy User ID"
                >
                  {copiedId ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedId ? "Copied" : "Copy ID"}</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* 2-Column High-Density Content Grid */}
        <div className="grid md:grid-cols-3 gap-5">
          
          {/* Left 2-Cols: Edit Information & Bio */}
          <div className="md:col-span-2 space-y-5">
            
            {/* Editable Profile Form */}
            <form onSubmit={handleSaveInfo} className="p-6 rounded-3xl bg-[#1e1f22] border border-white/10 space-y-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-purple-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Edit Personal Information</h3>
                </div>
                <button 
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-102 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save size={13} />
                  <span>Save Profile</span>
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Full Display Name</label>
                  <div className="px-4 py-2.5 bg-[#2b2d31] rounded-xl border border-white/5 text-sm font-bold text-white flex items-center gap-2">
                    <User size={15} className="text-purple-400" />
                    <span>{authUser?.fullName}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Email Address</label>
                  <div className="px-4 py-2.5 bg-[#2b2d31] rounded-xl border border-white/5 text-sm font-bold text-white flex items-center gap-2 truncate">
                    <Mail size={15} className="text-purple-400" />
                    <span className="truncate">{authUser?.email}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Status Message (Headline)</label>
                <input 
                  type="text"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#2b2d31] rounded-xl border border-white/10 text-xs text-white placeholder:text-slate-500 font-medium focus:border-purple-500 outline-none transition-all"
                  placeholder="Hey there! I am using Chat app."
                  maxLength={60}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  <span>About Me (Bio)</span>
                  <span>{formData.bio.length}/150</span>
                </div>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#2b2d31] rounded-xl border border-white/10 text-xs text-white placeholder:text-slate-500 font-medium focus:border-purple-500 outline-none transition-all resize-none h-20"
                  placeholder="Tell your contacts a little bit about yourself, interests, or projects..."
                  maxLength={150}
                />
              </div>
            </form>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[#1e1f22] border border-white/10 text-center space-y-1 shadow-lg">
                <MessageSquare className="size-5 text-purple-400 mx-auto" />
                <p className="text-lg font-black text-white">1,280+</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Messages Sent</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1e1f22] border border-white/10 text-center space-y-1 shadow-lg">
                <Users className="size-5 text-indigo-400 mx-auto" />
                <p className="text-lg font-black text-white">14</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Groups Joined</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1e1f22] border border-white/10 text-center space-y-1 shadow-lg">
                <HardDrive className="size-5 text-emerald-400 mx-auto" />
                <p className="text-lg font-black text-white">100%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Free</p>
              </div>
            </div>

          </div>

          {/* Right 1-Col: Security & Account Details */}
          <div className="space-y-5">
            
            {/* Account Metadata */}
            <div className="p-6 rounded-3xl bg-[#1e1f22] border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Shield className="size-4 text-purple-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Security & Status</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-white/5 font-bold">
                  <span className="text-slate-400 flex items-center gap-1.5"><Calendar size={13} /> Member Since</span>
                  <span className="text-white">{authUser?.createdAt?.split("T")[0] || "2026-08-08"}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-white/5 font-bold">
                  <span className="text-slate-400 flex items-center gap-1.5"><CheckCircle2 size={13} /> Account Status</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-400" /> Active & Verified
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-white/5 font-bold">
                  <span className="text-slate-400 flex items-center gap-1.5"><Lock size={13} /> Secret Vault PIN</span>
                  <span className="text-purple-400">Encrypted</span>
                </div>

                <div className="flex items-center justify-between py-2 font-bold">
                  <span className="text-slate-400 flex items-center gap-1.5"><Key size={13} /> Auth Token</span>
                  <span className="text-indigo-400 font-mono text-[10px]">E2EE JWT Valid</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="p-5 rounded-3xl bg-[#1e1f22] border border-white/10 space-y-3 shadow-xl">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Account Management</h4>
              
              <button 
                onClick={() => navigate("/settings")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2b2d31] hover:bg-white/10 text-white font-bold text-xs transition-all flex items-center justify-between border border-white/5"
              >
                <span>System Preferences</span>
                <Activity size={14} className="text-purple-400" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;


