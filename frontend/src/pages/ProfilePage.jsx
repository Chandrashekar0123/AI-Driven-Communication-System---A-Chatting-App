import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Shield, Calendar, CheckCircle2, Save, Image as ImageIcon } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedCover, setSelectedCover] = useState(null);
  
  const [formData, setFormData] = useState({
    bio: "",
    status: ""
  });

  useEffect(() => {
    if (authUser) {
      setFormData({
        bio: authUser.bio || "",
        status: authUser.status || "Hey there! I am using Chatty."
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

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#1E1F22]">
      <div className="max-w-3xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-[#2B2D31] rounded-3xl pb-12 overflow-hidden shadow-2xl border border-white/5 relative">
          
          {/* Cover Photo */}
          <div className="relative h-48 md:h-64 bg-[#1E1F22] group">
            {(selectedCover || authUser.coverPhoto) ? (
              <img src={selectedCover || authUser.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <ImageIcon className="size-16 text-white/10" />
              </div>
            )}
            <label className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 backdrop-blur-md p-2 rounded-xl cursor-pointer transition-all border border-white/10">
              <Camera className="size-5 text-white" />
              <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={isUpdatingProfile} />
            </label>
          </div>

          <div className="px-8 lg:px-12 space-y-10 relative">
            {/* Avatar Section - overlaps cover photo */}
            <div className="flex flex-col items-center gap-4 -mt-20">
              <div className="relative group">
                <div className="size-32 md:size-40 rounded-full overflow-hidden border-8 border-[#2B2D31] bg-[#2B2D31] shadow-2xl ring-4 ring-[#5865F2]/20 transition-all group-hover:ring-[#5865F2]/40">
                  <img
                    src={selectedImg || authUser.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label
                  htmlFor="avatar-upload"
                  className={`
                    absolute bottom-2 right-2 
                    bg-[#5865F2] hover:bg-[#4752C4]
                    p-2 md:p-3 rounded-xl cursor-pointer 
                    transition-all duration-300 shadow-xl border-4 border-[#2B2D31]
                    hover:scale-110 active:scale-95
                    ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                  `}
                >
                  <Camera className="size-4 md:size-5 text-white" />
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
              <div className="text-center mt-2">
                <h1 className="text-3xl font-black text-white">{authUser.fullName}</h1>
                <p className="text-[10px] text-[#949BA4] font-bold uppercase mt-1">
                  {isUpdatingProfile ? "Synchronising..." : "Verified Account Status"}
                </p>
              </div>
            </div>



          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#949BA4] flex items-center gap-2 px-1">
                <User className="size-3 text-[#5865F2]" />
                Display Name
              </div>
              <div className="px-6 py-4 bg-[#1E1F22] rounded-2xl border border-white/5 text-[#DBDEE1] font-bold shadow-inner">
                {authUser?.fullName}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#949BA4] flex items-center gap-2 px-1">
                <Mail className="size-3 text-[#5865F2]" />
                Identity Endpoint
              </div>
              <div className="px-6 py-4 bg-[#1E1F22] rounded-2xl border border-white/5 text-[#DBDEE1] font-bold shadow-inner">
                {authUser?.email}
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveInfo} className="bg-[#232428] rounded-2xl p-6 border border-white/5 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F2F3F5] flex items-center gap-2">
                <User className="size-4 text-[#5865F2]" />
                Advanced Identity
              </h2>
              <button 
                type="submit"
                disabled={isUpdatingProfile}
                className="btn btn-sm bg-[#5865F2] hover:bg-[#4752C4] text-white border-none text-xs rounded-xl flex items-center gap-2"
              >
                <Save size={14} />
                Save Changes
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#949BA4]">Status Message</label>
                <input 
                  type="text"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 bg-[#1E1F22] rounded-xl border border-white/5 text-white font-medium focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] outline-none transition-all"
                  placeholder="Hey there! I am using Chatty."
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#949BA4]">About Me (Bio)</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-4 py-3 bg-[#1E1F22] rounded-xl border border-white/5 text-white font-medium focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] outline-none transition-all resize-none h-24"
                  placeholder="Tell people a little bit about yourself..."
                  maxLength={150}
                />
              </div>
            </div>
          </form>

          {/* Account Metadata */}
          <div className="bg-[#232428] rounded-2xl p-6 border border-white/5 space-y-4 shadow-xl">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F2F3F5] flex items-center gap-2">
              <Shield className="size-4 text-[#5865F2]" />
              Security Information
            </h2>
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-3 border-b border-white/5 font-bold">
                <span className="text-[#949BA4] flex items-center gap-2"><Calendar size={14} /> Member Since</span>
                <span className="text-white">{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-3 font-bold">
                <span className="text-[#949BA4] flex items-center gap-2"><CheckCircle2 size={14} /> Account Status</span>
                <span className="text-[#23A559]">Active & Verified</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
