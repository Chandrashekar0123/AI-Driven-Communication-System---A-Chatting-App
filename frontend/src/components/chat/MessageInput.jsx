import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { Image, Send, X, PlusCircle, Smile, Gift, Sticker, Mic, Paperclip } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage, sendTypingStatus, selectedChat } = useChatStore();
  const typingTimeoutRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Stop typing
      handleStopTyping();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    
    // Typing status logic
    sendTypingStatus(true);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    sendTypingStatus(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  return (
    <div className="p-6 w-full bg-transparent">
      {imagePreview && (
        <div className="mb-4 mx-4 p-4 rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-500 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-50" />
          <div className="relative group">
            <img
              src={imagePreview}
              alt="Preview"
              className="size-24 object-cover rounded-2xl border border-white/20 shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
            <button
              onClick={removeImage}
              className="absolute -top-3 -right-3 size-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-2xl border-2 border-[#0f1115] z-10"
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex-1 relative">
            <div className="text-[11px] font-black text-purple-400 uppercase tracking-[0.2em] animate-pulse">Image Analysis in progress...</div>
            <div className="text-[10px] text-slate-500 font-bold mt-1">Ready for magic transmission</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-4 px-4">
        <div className="flex-1 flex items-center gap-3 bg-white/5 backdrop-blur-3xl rounded-2xl px-5 py-2 border border-white/10 shadow-2xl group focus-within:border-purple-500/50 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all duration-500">
          <button
            type="button"
            className="flex btn btn-ghost btn-circle btn-sm text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <PlusCircle size={24} className="opacity-40 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <input
            type="text"
            className="flex-1 py-3 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500 font-semibold tracking-wide"
            placeholder={`Type a magic message to ${selectedChat?.fullName || selectedChat?.name}...`}
            value={text}
            onChange={handleTyping}
            onBlur={handleStopTyping}
          />
          
          <div className="hidden lg:flex items-center gap-3">
             <button type="button" className="text-slate-500 hover:text-white transition-all hover:scale-110">
                <Gift size={20} />
             </button>
             <button type="button" className="text-slate-500 hover:text-white transition-all hover:scale-110">
                <Sticker size={20} />
             </button>
             <button type="button" className="text-slate-500 hover:text-white transition-all hover:scale-110">
                <Smile size={20} />
             </button>
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>

        <button
          type="submit"
          className={`size-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl relative overflow-hidden group ${
            text.trim() || imagePreview 
              ? "bg-gradient-to-br from-[#8b5cf6] to-[#4f46e5] text-white hover:scale-105 active:scale-95" 
              : "bg-white/5 text-slate-600 cursor-not-allowed"
          }`}
          disabled={!text.trim() && !imagePreview}
        >
          {text.trim() || imagePreview ? (
             <>
               <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
               <Send size={22} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
             </>
          ) : (
             <Send size={22} />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
