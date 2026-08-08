import { useRef, useState, useCallback, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { Send, X, PlusCircle, Smile, Mic, MicOff, Image, Loader2, Timer, Sparkles, BarChart2, ChevronUp } from "lucide-react";
import CreatePollModal from "./CreatePollModal";
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
  const [isDictating, setIsDictating] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showAIToolsMenu, setShowAIToolsMenu] = useState(false);

  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const { sendMessage, sendTypingStatus, selectedChat, runAIFeature, replyingTo, setReplyingTo } = useChatStore();
  const typingTimeoutRef = useRef(null);

  // Auto-focus input when chat selection changes or user starts typing anywhere
  useEffect(() => {
    inputRef.current?.focus();
  }, [selectedChat]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // If typing printable characters and focus is not inside another form field or modal
      if (
        e.key.length === 1 && 
        !e.ctrlKey && 
        !e.altKey && 
        !e.metaKey && 
        document.activeElement?.tagName !== "INPUT" && 
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const toggleDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isDictating) {
      setIsDictating(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsDictating(true);
        toast.success("🎙️ AI Live Voice Dictation listening... Speak now!");
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((res) => res[0].transcript)
          .join(" ");
        setText(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      recognition.start();
    } catch (err) {
      setIsDictating(false);
      toast.error("Failed to start speech dictation.");
    }
  };

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
      
      // Auto-re-focus text area so user can immediately type next message!
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
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
            <button key={emoji} type="button" onClick={() => { setText(t => t + emoji); setShowEmoji(false); setTimeout(() => inputRef.current?.focus(), 10); }}
              className="text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-white/10">
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Timer Menu */}
      {showTimerMenu && (
        <div className="mb-3 mx-2 p-2 rounded-2xl bg-[#1a1b1e] border border-white/10 flex flex-wrap gap-2 animate-in fade-in duration-200 text-xs">
          <button type="button" onClick={() => { setExpiresIn(null); setShowTimerMenu(false); setTimeout(() => inputRef.current?.focus(), 10); }} className={`px-3 py-1.5 rounded-lg ${expiresIn === null ? 'bg-purple-500 text-white' : 'hover:bg-white/10 text-slate-300'}`}>Off</button>
          <button type="button" onClick={() => { setExpiresIn(60); setShowTimerMenu(false); setTimeout(() => inputRef.current?.focus(), 10); }} className={`px-3 py-1.5 rounded-lg ${expiresIn === 60 ? 'bg-purple-500 text-white' : 'hover:bg-white/10 text-slate-300'}`}>1m</button>
          <button type="button" onClick={() => { setExpiresIn(3600); setShowTimerMenu(false); setTimeout(() => inputRef.current?.focus(), 10); }} className={`px-3 py-1.5 rounded-lg ${expiresIn === 3600 ? 'bg-purple-500 text-white' : 'hover:bg-white/10 text-slate-300'}`}>1h</button>
          <button type="button" onClick={() => { setExpiresIn(86400); setShowTimerMenu(false); setTimeout(() => inputRef.current?.focus(), 10); }} className={`px-3 py-1.5 rounded-lg ${expiresIn === 86400 ? 'bg-purple-500 text-white' : 'hover:bg-white/10 text-slate-300'}`}>24h</button>
          <button type="button" onClick={() => { setExpiresIn(604800); setShowTimerMenu(false); setTimeout(() => inputRef.current?.focus(), 10); }} className={`px-3 py-1.5 rounded-lg ${expiresIn === 604800 ? 'bg-purple-500 text-white' : 'hover:bg-white/10 text-slate-300'}`}>7d</button>
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

      {/* Single AI Tools Button & Popover */}
      <div className="relative mb-2 mx-2 inline-block">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowAIToolsMenu(prev => !prev)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 text-purple-300 border border-purple-500/30 text-xs font-extrabold transition-all shadow-md group hover:scale-105 active:scale-95"
        >
          <Sparkles size={14} className="text-purple-400 group-hover:rotate-12 transition-transform" />
          <span>AI Tools</span>
          <ChevronUp size={13} className={`transition-transform duration-200 ${showAIToolsMenu ? "rotate-180" : ""}`} />
        </button>

        {/* Floating Popover Grid with All AI Tools */}
        {showAIToolsMenu && (
          <div className="absolute bottom-full mb-2.5 left-0 w-72 sm:w-80 bg-[#1e1f22]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                <Sparkles size={12} /> Select AI Feature
              </span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowAIToolsMenu(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X size={13} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto no-scrollbar p-0.5">
              {[
                { id: "auto_reply", label: "Auto Replies", icon: "⚡", desc: "3 Smart Replies" },
                { id: "summary", label: "Summarize", icon: "📝", desc: "Key Recap & Tasks" },
                { id: "chatbot", label: "AI Chat", icon: "🤖", desc: "Ask Anything" },
                { id: "sentiment", label: "Sentiment", icon: "📊", desc: "Mood & Emotion" },
                { id: "tasks", label: "Extract Tasks", icon: "🎯", desc: "Assignments" },
                { id: "keyphrase", label: "Key Topics", icon: "🔑", desc: "Keywords" },
                { id: "translate", label: "Translate", icon: "🌐", desc: "To English" },
                { id: "grammar", label: "Fix Grammar", icon: "✍️", desc: "Spelling Check" },
                { id: "tone", label: "Tone Rewriter", icon: "🎭", desc: "Polish Tone" },
                { id: "emoji", label: "Emoji Suggest", icon: "😃", desc: "Mood Emojis" },
                { id: "search", label: "Smart Search", icon: "🔍", desc: "AI Search" },
                { id: "moderate", label: "Safety Check", icon: "🛡️", desc: "Toxicity Audit" }
              ].map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    runAIFeature(tool.id);
                    setShowAIToolsMenu(false);
                    setTimeout(() => inputRef.current?.focus(), 10);
                  }}
                  className="flex flex-col items-start p-2.5 rounded-xl bg-[#2b2d31] hover:bg-purple-500/20 text-left border border-white/5 hover:border-purple-500/30 transition-all hover:scale-[1.02] active:scale-95 group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-purple-300">
                    <span>{tool.icon}</span>
                    <span>{tool.label}</span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-400 mt-0.5 truncate w-full">{tool.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

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
            ref={inputRef}
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
            <Smile size={18} />
          </button>

          {/* Timer */}
          <button type="button" onClick={() => setShowTimerMenu(e => !e)}
            className={`hidden sm:flex text-slate-500 hover:text-purple-400 transition-all hover:scale-110 shrink-0 ${expiresIn ? "text-purple-400" : ""}`}
            title="Disappearing Message">
            <Timer size={18} />
          </button>

          {/* Poll Button */}
          <button type="button" onClick={() => setShowPollModal(true)}
            className="hidden sm:flex text-slate-500 hover:text-purple-400 transition-all hover:scale-110 shrink-0"
            title="Create Poll">
            <BarChart2 size={18} />
          </button>

          {/* AI Speech-To-Text Dictation Mic */}
          <button type="button" onClick={toggleDictation}
            className={`transition-all hover:scale-110 shrink-0 ${isDictating ? "text-purple-400 animate-pulse" : "text-slate-500 hover:text-purple-400"}`}
            title={isDictating ? "Listening... Speak now" : "AI Live Voice Dictation (STT)"}>
            <Sparkles size={17} className={isDictating ? "animate-spin" : ""} />
          </button>

          {/* Mic / Audio Rec */}
          <button type="button" onClick={toggleRecording}
            className={`transition-all hover:scale-110 shrink-0 ${isRecording ? "text-red-400 animate-pulse" : "text-slate-500 hover:text-blue-400"}`}
            title={isRecording ? "Stop recording" : "Voice message"}>
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input type="file" accept="*/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        </div>

        {/* Send Button */}
        <button type="submit"
          onMouseDown={(e) => e.preventDefault()}
          className={`size-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl shrink-0 ${
            text.trim() || imagePreview || filePreview || audioBlob
              ? "bg-gradient-to-br from-purple-500 to-indigo-500 text-white hover:scale-105 active:scale-95 shadow-purple-500/30"
              : "bg-white/5 text-slate-600 cursor-not-allowed"
          }`}
          disabled={!text.trim() && !imagePreview && !filePreview && !audioBlob}>
          <Send size={18} className={text.trim() || imagePreview || filePreview || audioBlob ? "group-hover:translate-x-0.5 transition-transform" : ""} />
        </button>
      </form>
      <CreatePollModal isOpen={showPollModal} onClose={() => setShowPollModal(false)} />
    </div>
  );
};

export default MessageInput;
