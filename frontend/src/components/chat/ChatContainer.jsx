import { useChatStore } from "../../store/useChatStore";
import { useEffect, useRef, useState, useCallback } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import AIHubPanel from "../ai/AIHubPanel";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import { useAuthStore } from "../../store/useAuthStore";
import { formatMessageTime } from "../../lib/utils";
import { Check, CheckCheck, Trash2, Reply, Sparkles, Edit2, Smile, Globe, Bot } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const ChatContainer = () => {
  const {
    messages,
    isMessagesLoading,
    recommendations,
    sendMessage,
    deleteMessage,
    editMessage,
    reactToMessage,
    isAIHubOpen,
    setReplyingTo,
    pinnedSummary,
    isSummaryLoading,
    getPinnedSummary,
    selectedChat,
    runAIFeature,
    translateMessage,
    translations,
    isTranslating
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editOriginalText, setEditOriginalText] = useState("");
  const [reactingToMsgId, setReactingToMsgId] = useState(null);

  const handleEditSubmit = async (e, messageId) => {
    e.preventDefault();
    if (!editOriginalText.trim()) return;
    const success = await editMessage(messageId, editOriginalText.trim());
    if (success) setEditingMsgId(null);
  };

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

  const handleAskAI = (message) => {
    runAIFeature("chatbot", { message: `Explain or summarize this message: "${message.text}"` });
    if (!isAIHubOpen) {
      useChatStore.getState().toggleAIHub();
    }
  };

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

        {/* Pinned AI Summary */}
        <div className="bg-purple-900/20 border-b border-purple-500/20 px-4 py-2 flex items-center justify-between shadow-inner">
          <div className="flex items-start gap-3">
            <Sparkles className="size-4 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-0.5">Pinned AI Summary</p>
              <p className="text-xs text-slate-300 leading-snug max-w-3xl">
                {isSummaryLoading ? "Updating summary..." : (pinnedSummary || "No summary available for this chat yet.")}
              </p>
            </div>
          </div>
          <button 
            onClick={() => getPinnedSummary(selectedChat._id, true)} 
            disabled={isSummaryLoading}
            className="p-1.5 rounded-lg text-purple-400 hover:text-white hover:bg-purple-500/20 transition-all ml-4 shrink-0"
            title="Refresh Summary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isSummaryLoading ? "animate-spin" : ""}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
          </button>
        </div>

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
                id={`msg-${message._id}`}
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

                    {/* Reply context (Quoted Message) */}
                    {message.repliedTo && (
                      <div className="mb-2 p-2 rounded-lg bg-black/20 border-l-4 border-purple-500 text-[11px] opacity-80 cursor-pointer hover:bg-black/30 transition-colors"
                           onClick={() => {
                             // Basic scroll to message if on page
                             const el = document.getElementById(`msg-${message.repliedTo}`);
                             if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                           }}>
                        <div className="flex items-center gap-1 font-bold text-purple-300 mb-0.5">
                          <Reply size={10} /> Quoted Message
                        </div>
                        <div className="truncate text-slate-300">
                          {messages.find(m => m._id === message.repliedTo)?.text || "Original message..."}
                        </div>
                      </div>
                    )}

                    {/* Image */}
                    {message.image && (
                      <div className="mb-2 overflow-hidden rounded-xl">
                        <img src={message.image} alt="Attachment" className="max-w-full h-auto rounded-xl hover:scale-[1.02] transition-transform duration-300" />
                      </div>
                    )}

                    {/* Audio */}
                    {message.audio && (
                      <div className="mb-2">
                        <audio src={message.audio} controls className="max-w-[200px] h-10 outline-none" />
                      </div>
                    )}

                    {/* Generic File */}
                    {message.fileUrl && !message.image && !message.audio && (
                      <div className="mb-2">
                        <a 
                          href={message.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-xl bg-black/20 hover:bg-black/30 border border-white/10 transition-colors"
                        >
                          <div className="size-8 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-white uppercase">{message.fileType?.split('/')?.[1]?.substring(0,4) || "FILE"}</span>
                          </div>
                          <span className="text-xs text-white underline">Download File</span>
                        </a>
                      </div>
                    )}

                    {/* Text */}
                    {message.text && (
                      <div className="text-[14px] leading-relaxed break-words whitespace-pre-wrap font-medium">
                        {editingMsgId === message._id ? (
                          <form onSubmit={(e) => handleEditSubmit(e, message._id)} className="flex items-center gap-2 mt-1">
                            <input
                              type="text"
                              value={editOriginalText}
                              onChange={(e) => setEditOriginalText(e.target.value)}
                              className="bg-black/20 border border-white/20 rounded px-2 py-1 text-sm outline-none w-full"
                              autoFocus
                            />
                            <button type="submit" className="text-xs bg-purple-500 px-2 py-1 rounded">Save</button>
                            <button type="button" onClick={() => setEditingMsgId(null)} className="text-xs bg-white/10 px-2 py-1 rounded">Cancel</button>
                          </form>
                        ) : (
                          <>
                            <p>{message.text} {message.edited && <span className="text-[9px] opacity-60 ml-1">(edited)</span>}</p>
                            
                            {/* Translation */}
                            {isTranslating[message._id] && (
                              <p className="text-xs mt-2 text-purple-400 animate-pulse italic flex items-center gap-1">
                                <Globe size={10} /> Translating...
                              </p>
                            )}
                            {translations[message._id] && !isTranslating[message._id] && (
                              <div className="mt-2 pt-2 border-t border-white/10 text-[13px] text-yellow-100/90 italic flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500/80 flex items-center gap-1">
                                  <Globe size={10} /> Translation
                                </span>
                                {translations[message._id]}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Reactions */}
                    {message.reactions?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {Object.entries(
                          message.reactions.reduce((acc, r) => {
                            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([emoji, count]) => (
                          <span key={emoji} className="px-1.5 py-0.5 rounded-full bg-black/20 border border-white/10 text-[11px] cursor-pointer" onClick={() => reactToMessage(message._id, emoji)}>
                            {emoji} <span className="opacity-70">{count}</span>
                          </span>
                        ))}
                      </div>
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
                      <div className={`absolute top-1 ${isMe ? "-left-[190px]" : "-right-[150px]"} flex gap-1 animate-in fade-in duration-150 z-10 bg-black/40 p-1 rounded-xl backdrop-blur-md border border-white/10`}>
                        
                        {/* Translate */}
                        {message.text && (
                          <button
                            onClick={() => translateMessage(message._id, message.text)}
                            className="p-1.5 rounded-lg bg-[#1a1b1e] border border-white/5 text-slate-400 hover:text-purple-400 hover:border-purple-500/30 transition-all shadow-lg"
                            title="Translate"
                          >
                            <Globe size={13} />
                          </button>
                        )}

                        {/* Ask AI */}
                        {message.text && (
                          <button
                            onClick={() => handleAskAI(message)}
                            className="p-1.5 rounded-lg bg-[#1a1b1e] border border-white/5 text-slate-400 hover:text-purple-400 hover:border-purple-500/30 transition-all shadow-lg"
                            title="Ask AI about this"
                          >
                            <Bot size={13} />
                          </button>
                        )}

                        {/* Reply Button */}
                        <button
                          onClick={() => setReplyingTo(message)}
                          className="p-1.5 rounded-lg bg-[#1a1b1e] border border-white/5 text-slate-400 hover:text-purple-400 hover:border-purple-500/30 transition-all shadow-lg"
                          title="Reply"
                        >
                          <Reply size={13} />
                        </button>

                        {/* Reaction Button */}
                        <div className="relative">
                          <button
                            onClick={() => setReactingToMsgId(reactingToMsgId === message._id ? null : message._id)}
                            className="p-1.5 rounded-lg bg-[#1a1b1e] border border-white/10 text-slate-400 hover:text-yellow-400 hover:border-yellow-500/30 transition-all shadow-lg"
                            title="React"
                          >
                            <Smile size={13} />
                          </button>
                          {reactingToMsgId === message._id && (
                            <div className={`absolute bottom-full mb-2 z-[999] ${message.senderId?._id === authUser._id ? "right-0" : "left-0"}`}>
                              <EmojiPicker
                                theme="dark"
                                onEmojiClick={(e) => {
                                  reactToMessage(message._id, e.emoji);
                                  setReactingToMsgId(null);
                                }}
                                width={280}
                                height={350}
                              />
                            </div>
                          )}
                        </div>

                        {/* Edit (my messages only) */}
                        {isMe && message.text && (
                          <button
                            onClick={() => {
                              setEditingMsgId(message._id);
                              setEditOriginalText(message.text);
                            }}
                            className="p-1.5 rounded-lg bg-[#1a1b1e] border border-white/10 text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all shadow-lg"
                            title="Edit message"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}

                        {/* Delete (my messages only) */}
                        {isMe && (
                          <button
                            onClick={() => deleteMessage(message._id)}
                            className="p-1.5 rounded-lg bg-[#1a1b1e] border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all shadow-lg"
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
