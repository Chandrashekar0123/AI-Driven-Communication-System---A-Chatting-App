import { useEffect, useState, useRef } from "react";
import { useStatusStore } from "../../store/useStatusStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Plus, X, Camera, Send, Loader2 } from "lucide-react";

const StatusRail = () => {
  const { statuses, isStatusesLoading, getStatuses, createStatus, subscribeToStatusSocket, unsubscribeFromStatusSocket } = useStatusStore();
  const { authUser } = useAuthStore();
  
  const [isViewing, setIsViewing] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newStatusText, setNewStatusText] = useState("");
  const [newStatusImage, setNewStatusImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    getStatuses();
    subscribeToStatusSocket();
    return () => unsubscribeFromStatusSocket();
  }, [getStatuses, subscribeToStatusSocket, unsubscribeFromStatusSocket]);

  // Group statuses by user
  const groupedStatuses = statuses.reduce((acc, status) => {
    const userId = status.userId?._id;
    if (!userId) return acc;
    if (!acc[userId]) acc[userId] = [];
    acc[userId].push(status);
    return acc;
  }, {});

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => setNewStatusImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newStatusText.trim() && !newStatusImage) return;
    
    setIsSubmitting(true);
    const success = await createStatus(
      newStatusImage || newStatusText,
      newStatusImage ? "image" : "text"
    );
    setIsSubmitting(false);

    if (success) {
      setNewStatusText("");
      setNewStatusImage(null);
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full bg-[#111214] border-b border-white/5 py-3 px-4 flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0 h-[100px]">
      {/* My Status (Create) */}
      <div className="flex flex-col items-center gap-1.5 shrink-0 relative cursor-pointer group" onClick={() => setIsCreating(true)}>
        <div className="relative size-14 rounded-full p-[2px] bg-white/10 group-hover:bg-purple-500/50 transition-colors">
          <div className="w-full h-full bg-[#1e1f22] rounded-full overflow-hidden border-2 border-[#111214]">
            <img src={authUser?.profilePic || "/avatar.png"} alt="My Status" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 bg-purple-500 rounded-full border-2 border-[#111214] size-5 flex items-center justify-center shadow-lg">
            <Plus size={12} className="text-white font-bold" />
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">My Status</span>
      </div>

      {/* Contacts Statuses */}
      {Object.values(groupedStatuses).map((userStatuses, idx) => {
        const user = userStatuses[0].userId;
        const isAllViewed = false; // Add viewed logic later
        
        return (
          <div key={user._id} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group" onClick={() => setIsViewing(userStatuses)}>
            <div className={`size-14 rounded-full p-[2px] ${isAllViewed ? 'bg-slate-600' : 'bg-gradient-to-tr from-purple-500 to-indigo-500'} transition-all group-hover:scale-105`}>
              <div className="w-full h-full bg-[#1e1f22] rounded-full overflow-hidden border-2 border-[#111214]">
                <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-300 w-16 text-center truncate">{user.fullName.split(' ')[0]}</span>
          </div>
        );
      })}

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <button onClick={() => setIsCreating(false)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={32} /></button>
          
          <div className="bg-[#1e1f22] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10">
            <div className="p-4 border-b border-white/5 font-black text-center text-white">Create Status</div>
            <form onSubmit={handleCreateSubmit} className="p-4 flex flex-col gap-4">
              
              {newStatusImage ? (
                <div className="relative rounded-2xl overflow-hidden aspect-[9/16] bg-black">
                  <img src={newStatusImage} className="w-full h-full object-cover" alt="Preview" />
                  <button type="button" onClick={() => setNewStatusImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full backdrop-blur-sm"><X size={16} /></button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <textarea 
                    value={newStatusText}
                    onChange={e => setNewStatusText(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full h-32 bg-[#111214] border border-white/10 rounded-2xl p-4 text-white resize-none focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <div className="flex items-center justify-center">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">OR</span>
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="py-4 border-2 border-dashed border-white/20 rounded-2xl text-slate-400 hover:text-purple-400 hover:border-purple-400 hover:bg-purple-500/5 transition-all flex flex-col items-center justify-center gap-2">
                    <Camera size={24} />
                    <span className="text-xs font-bold uppercase tracking-widest">Upload Photo</span>
                  </button>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                </div>
              )}

              <button disabled={(!newStatusText && !newStatusImage) || isSubmitting} type="submit" className="mt-2 w-full py-3.5 rounded-xl bg-purple-500 text-white font-black uppercase tracking-widest hover:bg-purple-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Share Status
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Modal (Simple Auto-play) */}
      {isViewing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-lg animate-in fade-in p-4" onClick={() => setIsViewing(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white z-50"><X size={32} /></button>
          
          <div className="w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden relative shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
            {/* Progress Bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
              {isViewing.map((s, i) => (
                <div key={s._id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                  <div className={`h-full bg-white transition-all duration-300 ${i === 0 ? 'w-full' : 'w-0'}`}></div>
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-4 right-4 flex items-center gap-3 z-20">
              <img src={isViewing[0].userId.profilePic || "/avatar.png"} className="size-10 rounded-full border-2 border-white/20" alt="Avatar" />
              <div className="text-white shadow-black drop-shadow-md">
                <div className="font-bold">{isViewing[0].userId.fullName}</div>
                <div className="text-[10px] opacity-80">{new Date(isViewing[0].createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
              </div>
            </div>

            {/* Content (For simplicity, just showing the first status in the array for now) */}
            {isViewing[0].type === "image" ? (
              <img src={isViewing[0].content} className="w-full h-full object-cover" alt="Status" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center p-8 text-center text-white text-2xl font-bold font-serif leading-relaxed">
                {isViewing[0].content}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusRail;
