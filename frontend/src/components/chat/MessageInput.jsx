import { useRef, useState, useCallback } from "react";
import { useChatStore } from "../../store/useChatStore";
import { Send, X, PlusCircle, Smile, Mic, MicOff, Image, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// ── Emoji Picker (inline, no dep) ──────────────────────────────────────────
const QUICK_EMOJIS = ["😊","😂","❤️","👍","🙏","🎉","🔥","💯","😎","🤔","😢","👋"];

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  const { sendMessage, sendTypingStatus, selectedChat, runAIFeature } = useChatStore();
  const typingTimeoutRef = useRef(null);

  // ── Image ─────────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !imagePreview) return;
    try {
      await sendMessage({ text: text.trim(), image: imagePreview });
      setText("");
      setImagePreview(null);
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

  // ── Voice Recording (STT via Web Speech API) ───────────────────────────────
  const startRecording = useCallback(async () => {
    // 1. Try Web Speech API first (no backend needed)
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
        toast.success("🎙️ Listening... Speak now!", { duration: 2000 });
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(r => r[0].transcript)
          .join("");
        setText(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        toast.error(`Mic error: ${event.error}`);
        stopRecording();
      };

      recognition.onend = () => stopRecording();

      recognitionRef.current = recognition;
      recognition.start();
      return;
    }

    // 2. Fallback: Record audio blob and send to HuggingFace Whisper
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        await transcribeAudio();
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

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const transcribeAudio = async () => {
    if (audioChunksRef.current.length === 0) return;
    setIsTranscribing(true);
    try {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");

      const HF_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
      if (!HF_KEY) { toast.error("HuggingFace key not set. Add VITE_HUGGINGFACE_API_KEY to frontend .env"); return; }

      const res = await fetch("https://api-inference.huggingface.co/models/openai/whisper-large-v3", {
        method: "POST",
        headers: { Authorization: `Bearer ${HF_KEY}` },
        body: formData,
      });

      if (!res.ok) throw new Error(`Whisper API error: ${res.status}`);
      const data = await res.json();
      const transcript = data.text || "";
      setText(transcript);
      toast.success("✅ Transcribed successfully!");
    } catch (err) {
      console.error("Transcription failed:", err);
      toast.error("Transcription failed. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = () => { isRecording ? stopRecording() : startRecording(); };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="px-4 pb-5 pt-2 w-full">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 mx-2 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="relative group">
            <img src={imagePreview} alt="Preview" className="size-20 object-cover rounded-xl border border-white/20" />
            <button onClick={removeImage} type="button"
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

      {/* Main Input Row */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-3 mx-2">
        <div className="flex-1 flex items-center gap-2 bg-[#1a1b1e] rounded-2xl px-4 py-2.5 border border-white/10 focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/10 transition-all duration-300 shadow-xl">
          {/* Attach image */}
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="text-slate-500 hover:text-purple-400 transition-all hover:scale-110 shrink-0">
            <Image size={19} />
          </button>

          {/* Text input */}
          <input
            type="text"
            className="flex-1 py-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-600 font-medium"
            placeholder={isTranscribing ? "Transcribing audio..." : isRecording ? "Listening..." : `Message ${selectedChat?.fullName || selectedChat?.name || ""}...`}
            value={text}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            disabled={isRecording || isTranscribing}
          />

          {/* Emoji */}
          <button type="button" onClick={() => setShowEmoji(e => !e)}
            className={`text-slate-500 hover:text-amber-400 transition-all hover:scale-110 shrink-0 ${showEmoji ? "text-amber-400" : ""}`}>
            <Smile size={19} />
          </button>

          {/* Mic / STT */}
          <button type="button" onClick={toggleRecording}
            className={`transition-all hover:scale-110 shrink-0 ${isRecording ? "text-red-400 animate-pulse" : "text-slate-500 hover:text-blue-400"}`}
            title={isRecording ? "Stop recording" : "Voice message (Speech-to-Text)"}>
            {isTranscribing ? <Loader2 size={19} className="animate-spin text-purple-400" />
              : isRecording ? <MicOff size={19} />
              : <Mic size={19} />}
          </button>

          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
        </div>

        {/* Send Button */}
        <button type="submit"
          className={`size-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl shrink-0 ${
            text.trim() || imagePreview
              ? "bg-gradient-to-br from-purple-500 to-indigo-500 text-white hover:scale-105 active:scale-95 shadow-purple-500/30"
              : "bg-white/5 text-slate-600 cursor-not-allowed"
          }`}
          disabled={!text.trim() && !imagePreview}>
          <Send size={18} className={text.trim() || imagePreview ? "group-hover:translate-x-0.5 transition-transform" : ""} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
