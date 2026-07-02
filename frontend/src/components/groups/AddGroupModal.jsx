import { useState, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { X, Camera, Users, Loader2 } from "lucide-react";

const AddGroupModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const { createGroup } = useChatStore();

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    const success = await createGroup({
      name: name.trim(),
      description: description.trim(),
      isPublic,
      profilePic: imagePreview,
      members: [] // You can add a member selector later
    });
    setIsSubmitting(false);

    if (success) {
      setName("");
      setDescription("");
      setIsPublic(false);
      setImagePreview(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e1f22] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="text-purple-400" /> Create Server
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="size-24 rounded-full border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-500/10 transition-all relative overflow-hidden group"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera className="text-slate-400 mb-1 size-8 group-hover:text-purple-400 transition-colors" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Upload</span>
                </>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Server Name <span className="text-red-400">*</span></label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="bg-[#111214] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="e.g. Developer Lounge"
              required
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
            <input 
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#111214] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="What is this server about?"
            />
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 mt-2">
            <div>
              <p className="text-sm font-bold text-white">Public Server</p>
              <p className="text-xs text-slate-400 mt-0.5">Allow anyone to find and join this server via Explore.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              <div className="w-11 h-6 bg-black/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500 border border-white/10"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="mt-4 pt-4 border-t border-white/5 flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!name.trim() || isSubmitting}
              className="px-6 py-2 rounded-xl bg-purple-500 text-white text-sm font-bold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Create
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddGroupModal;
