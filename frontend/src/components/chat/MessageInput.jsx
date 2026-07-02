import { useRef, useState, useCallback } from "react";
import { useChatStore } from "../../store/useChatStore";
import { Send, X, PlusCircle, Smile, Mic, MicOff, Image, Loader2, Timer } from "lucide-react";
import toast from "react-hot-toast";

// ── Emoji Picker (inline, no dep) ──────────────────────────────────────────
const QUICK_EMOJIS = ["😊","😂","❤️","👍","🙏","🎉","🔥","💯","😎","🤔","😢","👋"];

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioPreview, setAudioPreview] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [expiresIn, setExpiresIn] = useState(null); // in seconds
  const [showTimerMenu, setShowTimerMenu] = useState(false);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const { sendMessage, sendTypingStatus, selectedChat, runAIFeature, replyingTo, setReplyingTo } = useChatStore();
  const typingTimeoutRef = useRef(null);

  // ── File & Image ──────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (e.g., 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (file.type.startsWith("image/")) {
        setImagePreview(reader.result);
        setFilePreview(null);
      } else {
        setFilePreview(reader.result);
        setImagePreview(null);
      }
      setFileData({ name: file.name, type: file.type });
    };
    reader.readAsDataURL(file);
  };

  const removeFileOrImage = () => {
    setImagePreview(null);
    setFilePreview(null);
    setFileData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAudio = () => {
    setAudioPreview(null);
    setAudioBlob(null);
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !imagePreview && !filePreview && !audioBlob) return;
    try {
      // Read audioBlob as DataURL so backend can upload it to cloudinary
      let audioData = null;
      if (audioBlob) {
        audioData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(audioBlob);
        });
      }

      await sendMessage({ 
        text: text.trim(), 
        image: imagePreview, 
        file: filePreview,
        fileType: fileData?.type,
        audio: audioData,
        repliedTo: replyingTo?._id || null,
        expiresIn: expiresIn // passing seconds
      });
      setText("");
      setImagePreview(null);
      setFilePreview(null);
      setFileData(null);
      setAudioPreview(null);
      setAudioBlob(null);
      setReplyingTo(null);
      setShowEmoji(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      sendTypingStatus(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (err) {
      console.error("Failed to send:", err);
    }
  };

  // ── Typing ────────────────────────────────────────────────────────────────
  const handleTyping = (e) => {
    setText(e.target.value);
    sendTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTypingStatus(false), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  // ── Voice Recording (Native Audio) ───────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioPreview(URL.createObjectURL(blob));
        toast.success("✅ Audio recorded!");
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
      toast.success("🎙️ Recording... Press mic again to stop");
    } catch (err) {
      toast.error("Microphone permission denied. Please allow mic access.");
      console.error("Mic access denied:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    clearInterval(timerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const toggleRecording = () => { isRecording ? stopRecording() : startRecording(); };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="px-4 pb-5 pt-2 w-full">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 mx-2 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="relative group">
            <img src={imagePreview} alt="Preview" className="size-20 object-cover rounded-xl border border-white/20" />
            <button onClick={removeFileOrImage} type="button"
              className="absolute -top-2 -right-2 size-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg">
              <X className="size-3" />
            </button>
          </div>
          <div>
            <p className="text-[11px] font-black text-purple-400 uppercase tracking-widest animate-pulse">Image Ready</p>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Ready to send</p>
          </div>
        </div>
      )}

      {/* File Preview */}
      {filePreview && (
        <div className="mb-3 mx-2 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="relative group flex items-center gap-3">
            <div className="size-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
              <PlusCircle className="size-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white truncate max-w-[150px]">{fileData?.name || "File"}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5">Ready to send</p>
            </div>
            <button onClick={removeFileOrImage} type="button"
              className="absolute -top-2 -right-2 size-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg">
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Audio Preview */}
      {audioPreview && (
        <div className="mb-3 mx-2 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex-1 flex items-center gap-3">
            <div className="size-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Mic size={20} />
            </div>
            <audio src={audioPreview} controls className="h-10 outline-none flex-1" />
          </div>
          <button onClick={removeAudio} type="button"
            className="size-8 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-lg">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="mb-3 mx-2 px-4 py-2 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-in slide-in-from-bottom-2">
          <span className="size-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span className="text-xs font-black text-red-400 uppercase tracking-widest">Recording {formatTime(recordingTime)}</span>
          <span className="text-[10px] text-slate-500 ml-auto">Tap mic to stop</span>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="mb-3 mx-2 p-3 rounded-2xl bg-[#1a1b1e] border border-white/10 flex flex-wrap gap-2 animate-in fade-in duration-200">
          {QUICK_EMOJIS.map(emoji => (
            <button key={emoji} type="button" onClick={() => { setText(t => t + emoji); setShowEmoji(false); }}
              className="text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-white/10">
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Timer Menu */}
      {showTimerMenu && (
        <div className="mb-3 mx-2 p-2 rounded-2xl bg-[#1a1b1e] border border-white/10 flex flex-wrap gap-2 animate-in fade-in duration-200 text-xs">
          <button type="button" onClick={() => { setExpiresIn(null); setShowTimerMenu(false); }} className={`px-3 py-1.5 rounded-lg ${expiresIn === null ? 'bg-purple-500 text-white' : 'hover:bg-white/10 text-slate-300'}`}>Off</button>
          <button type="button" onClick={() => { setExpiresIn(60); setShowTimerMenu(false); }} className={`px-3 py-1.5 rounded-lg ${expiresIn === 60 ? 'bg-purple-500 text-white' : 'hover:bg-white/10 text-slate-300'}`}>1m</button>
          <button type="button" onClick={() => { setExpiresIn(3600); setShowTimerMenu(false); }} className={`px-3 py-1.5 rounded-lg ${expiresIn === 3600 ? 'bg-purple-500 text-white' : 'hover:bg-white/10 text-slate-300'}`}>1h</button>
          <button type="button" onClick={() => { setExpiresIn(86400); setShowTimerMenu(false); }} className={`px-3 py-1.5 rounded-lg ${expiresIn === 86400 ? 'bg-purple-500 text-white' : 'hover:bg-white/10 text-slate-300'}`}>24h</button>
          <button type="button" onClick={() => { setExpiresIn(604800); setShowTimerMenu(false); }} className={`px-3 py-1.5 rounded-lg ${expiresIn === 604800 ? 'bg-purple-500 text-white' : 'hover:bg-white/10 text-slate-300'}`}>7d</button>
        </div>
      )}

      {/* Reply Preview */}
      {replyingTo && (
        <div className="mb-2 mx-2 p-2 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2 relative animate-in slide-in-from-bottom-2">
          <div className="w-1 h-full absolute left-0 top-0 bottom-0 bg-purple-500 rounded-l-xl"></div>
          <div className="flex-1 ml-2">
            <p className="text-[10px] font-black text-purple-400">Replying to {replyingTo.senderId?.fullName || "User"}</p>
            <p className="text-xs text-slate-300 truncate max-w-[90%]">
              {replyingTo.text || (replyingTo.image ? "📷 Image" : replyingTo.audio ? "🎤 Voice Message" : "Attachment")}
            </p>
          </div>
          <button onClick={() => setReplyingTo(null)} className="p-1 rounded-md text-slate-500 hover:bg-white/10 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Input Row */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-3 mx-2">
        <div className="flex-1 flex items-center gap-2 bg-[#1a1b1e] rounded-2xl px-4 py-2.5 border border-white/10 focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/10 transition-all duration-300 shadow-xl">
          {/* Attach file */}
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="text-slate-500 hover:text-purple-400 transition-all hover:scale-110 shrink-0">
            <PlusCircle size={19} />
          </button>

          {/* Text input */}
          <input
            type="text"
            className="flex-1 py-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-600 font-medium"
            placeholder={isRecording ? "Recording..." : `Message ${selectedChat?.fullName || selectedChat?.name || ""}...`}
            value={text}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            disabled={isRecording}
          />

          {/* Emoji */}
          <button type="button" onClick={() => setShowEmoji(e => !e)}
            className={`text-slate-500 hover:text-purple-400 transition-all hover:scale-110 shrink-0 ${showEmoji ? "text-purple-400" : ""}`}>
            <Smile size={19} />
          </button>

          {/* Timer */}
          <button type="button" onClick={() => setShowTimerMenu(e => !e)}
            className={`text-slate-500 hover:text-purple-400 transition-all hover:scale-110 shrink-0 ${expiresIn ? "text-purple-400" : ""}`}
            title="Disappearing Message">
            <Timer size={19} />
          </button>

          {/* Mic / Audio Rec */}
          <button type="button" onClick={toggleRecording}
            className={`transition-all hover:scale-110 shrink-0 ${isRecording ? "text-red-400 animate-pulse" : "text-slate-500 hover:text-blue-400"}`}
            title={isRecording ? "Stop recording" : "Voice message"}>
            {isRecording ? <MicOff size={19} /> : <Mic size={19} />}
          </button>

          <input type="file" accept="*/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        </div>

        {/* Send Button */}
        <button type="submit"
          className={`size-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl shrink-0 ${
            text.trim() || imagePreview || filePreview || audioBlob
              ? "bg-gradient-to-br from-purple-500 to-indigo-500 text-white hover:scale-105 active:scale-95 shadow-purple-500/30"
              : "bg-white/5 text-slate-600 cursor-not-allowed"
          }`}
          disabled={!text.trim() && !imagePreview && !filePreview && !audioBlob}>
          <Send size={18} className={text.trim() || imagePreview || filePreview || audioBlob ? "group-hover:translate-x-0.5 transition-transform" : ""} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
