import { useChatStore } from "../../store/useChatStore";
import { useEffect, useRef, useState, useCallback } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import AIHubPanel from "../ai/AIHubPanel";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import { useAuthStore } from "../../store/useAuthStore";
import { formatMessageTime } from "../../lib/utils";
import { Check, CheckCheck, Trash2, Reply, Sparkles, Volume2, VolumeX } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    isMessagesLoading,
    recommendations,
    sendMessage,
    deleteMessage,
    isAIHubOpen,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  useEffect(() => {
    if (messageEndRef.current && messages?.length) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages?.length]);

  // ── TTS: speak a message using browser's SpeechSynthesis ─────────────────
  const speakMessage = useCallback((msg) => {
    if (!("speechSynthesis" in window)) {
      import("react-hot-toast").then(({ default: toast }) => toast.error("TTS not supported in this browser"));
      return;
    }
    // Stop if already speaking this message
    if (speakingMsgId === msg._id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(msg.text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onstart = () => setSpeakingMsgId(msg._id);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    window.speechSynthesis.speak(utterance);
  }, [speakingMsgId]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#313338]">
        <ChatHeader />
        <MessageSkeleton />
        <div className="mt-auto"><MessageInput /></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#12141a]">
      <div className="flex-1 flex flex-col overflow-hidden border-r border-white/5">
        <ChatHeader />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-1 premium-scrollbar"
          style={{ background: "linear-gradient(180deg, #12141a 0%, #0d0e12 100%)" }}>

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
              <Sparkles className="size-12 text-purple-500 animate-pulse" />
              <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No messages yet. Say hello!</p>
            </div>
          )}

          {messages.map((message, idx) => {
            const senderIdData = message.senderId;
            const messageSenderId = senderIdData && typeof senderIdData === "object" ? senderIdData._id : senderIdData;
            const isMe = String(messageSenderId) === String(authUser?._id);
            const isRead = message.readBy?.length > 0;
            const prevMsg = messages[idx - 1];
            const showSenderLabel = !isMe && (!prevMsg || (typeof prevMsg.senderId === "object" ? prevMsg.senderId._id : prevMsg.senderId) !== messageSenderId);
            const isSpeaking = speakingMsgId === message._id;

            return (
              <div
                key={message._id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} group relative mb-1`}
                onMouseEnter={() => setHoveredMessage(message._id)}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                {/* Sender label for received messages in group */}
                {showSenderLabel && senderIdData?.fullName && (
                  <span className="text-[10px] font-black text-purple-400/70 uppercase tracking-widest ml-12 mb-1">
                    {senderIdData.fullName}
                  </span>
                )}

                <div className={`flex gap-2 max-w-[80%] sm:max-w-[65%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar (received only) */}
                  {!isMe && (
                    <div className="shrink-0 self-end mb-1">
                      <img
                        src={senderIdData?.profilePic || "/avatar.png"}
                        alt="avatar"
                        className="size-7 rounded-full object-cover ring-1 ring-white/10"
                      />
                    </div>
                  )}

                  {/* Bubble */}
                  <div className={`relative px-4 py-2.5 transition-all duration-200 ${
                    isMe
                      ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-lg shadow-purple-900/30"
                      : "bg-[#2b2d31] text-[#dcddde] rounded-2xl rounded-tl-sm shadow-lg border border-white/[0.04]"
                  } ${message.deleted ? "italic opacity-40" : ""}`}>

                    {/* Reply context */}
                    {message.repliedTo && (
                      <div className="mb-2 p-2 rounded-lg bg-black/20 border-l-2 border-white/30 text-[10px] opacity-70 truncate">
                        <Reply size={9} className="inline mr-1" /> Replying...
                      </div>
                    )}

                    {/* Image */}
                    {message.image && (
                      <div className="mb-2 overflow-hidden rounded-xl">
                        <img src={message.image} alt="Attachment" className="max-w-full h-auto rounded-xl hover:scale-[1.02] transition-transform duration-300" />
                      </div>
                    )}

                    {/* Text */}
                    {message.text && (
                      <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap font-medium">
                        {message.text}
                      </p>
                    )}

                    {/* Timestamp + read receipts */}
                    <div className={`flex items-center gap-1 mt-1.5 text-[9px] font-bold ${isMe ? "justify-end text-white/50" : "text-slate-600"}`}>
                      <time>{formatMessageTime(message.createdAt)}</time>
                      {isMe && !message.deleted && (
                        isRead
                          ? <CheckCheck size={11} className="text-blue-300" />
                          : <Check size={11} className="text-white/30" />
                      )}
                    </div>

                    {/* Hover Actions */}
                    {!message.deleted && hoveredMessage === message._id && (
                      <div className={`absolute top-1 ${isMe ? "-left-20" : "-right-20"} flex gap-1.5 animate-in fade-in duration-150`}>
                        {/* TTS Button */}
                        {message.text && (
                          <button
                            onClick={() => speakMessage(message)}
                            className={`p-1.5 rounded-lg border transition-all hover:scale-110 shadow-lg ${
                              isSpeaking
                                ? "bg-purple-500 border-purple-400 text-white"
                                : "bg-[#1a1b1e] border-white/10 text-slate-400 hover:text-purple-400 hover:border-purple-500/30"
                            }`}
                            title={isSpeaking ? "Stop speaking" : "Listen (TTS)"}
                          >
                            {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                          </button>
                        )}

                        {/* Delete (my messages only) */}
                        {isMe && (
                          <button
                            onClick={() => deleteMessage(message._id)}
                            className="p-1.5 rounded-lg bg-[#1a1b1e] border border-white/10 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all hover:scale-110 shadow-lg"
                            title="Delete message"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messageEndRef} />
        </div>

        {/* AI Smart Suggestions Bar */}
        {Array.isArray(recommendations) && recommendations.length > 0 && (
          <div className="px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-white/5 bg-[#1a1b1e]/80 backdrop-blur-sm">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest shrink-0 flex items-center gap-1">
              <Sparkles size={8} className="text-purple-500" /> AI
            </span>
            {recommendations.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage({ text: suggestion })}
                className="shrink-0 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold text-slate-300 hover:bg-purple-500/20 hover:text-white hover:border-purple-500/40 transition-all duration-200 whitespace-nowrap"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <MessageInput />
      </div>

      {isAIHubOpen && <AIHubPanel />}
    </div>
  );
};

export default ChatContainer;
