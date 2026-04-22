import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Shield, Calendar, CheckCircle2 } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

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

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#1E1F22]">
      <div className="max-w-3xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-[#2B2D31] rounded-3xl p-8 lg:p-12 space-y-12 shadow-2xl border border-white/5 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 size-64 bg-[#5865F2]/5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-white text-outfit">Identity Profile</h1>
            <p className="text-[#949BA4] font-bold text-sm uppercase tracking-widest">Secure User Information</p>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="size-40 rounded-full overflow-hidden border-4 border-[#1E1F22] shadow-2xl ring-4 ring-[#5865F2]/20 transition-all group-hover:ring-[#5865F2]/40">
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
                  p-3 rounded-2xl cursor-pointer 
                  transition-all duration-300 shadow-xl
                  hover:scale-110 active:scale-95
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="size-6 text-white" />
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
            <div className="text-center">
              <p className="text-sm font-black text-white uppercase tracking-widest">{authUser.fullName}</p>
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
  );
};
export default ProfilePage;
