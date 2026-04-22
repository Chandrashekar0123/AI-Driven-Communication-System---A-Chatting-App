import { useChatStore } from "../../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import AIHubPanel from "../ai/AIHubPanel";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import { useAuthStore } from "../../store/useAuthStore";
import { formatMessageTime } from "../../lib/utils";
import { Check, CheckCheck, Trash2, Reply, MessageSquare } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    isMessagesLoading,
    selectedChat,
    subscribeToSocket,
    unsubscribeFromSocket,
    recommendations,
    isRecommendationsLoading,
    sendMessage,
    deleteMessage,
    isAIHubOpen,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#313338]">
        <ChatHeader />
        <MessageSkeleton />
        <div className="mt-auto">
          <MessageInput />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#12141a]">
      <div className="flex-1 flex flex-col overflow-hidden border-r border-white/5">
        <ChatHeader />
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 premium-scrollbar bg-chat-pattern">
          {messages.map((message, idx) => {
            const messageSenderId = typeof message.senderId === "object" ? message.senderId._id : message.senderId;
            const isMe = messageSenderId === authUser._id;
            const isRead = message.readBy?.length > 0;
            const showAvatar = idx === 0 || messages[idx-1].senderId !== message.senderId;

            return (
              <div
                key={message._id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} group relative`}
                onMouseEnter={() => setHoveredMessage(message._id)}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                <div className={`flex gap-3 max-w-[85%] sm:max-w-[70%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Bubble */}
                  <div className={`relative px-5 py-3 transition-all duration-300 ${
                    isMe 
                      ? "premium-bubble-sent rounded-2xl rounded-tr-none hover:translate-x-[-4px]" 
                      : "premium-bubble-received rounded-2xl rounded-tl-none hover:translate-x-[4px]"
                  } ${message.deleted ? "italic opacity-40" : ""}`}>
                    
                    {/* Reply Context */}
                    {message.repliedTo && (
                      <div className="mb-2 p-2 rounded-lg bg-black/10 border-l-2 border-white/20 text-[10px] opacity-60 truncate">
                         <Reply size={10} className="inline mr-1" /> Replying...
                      </div>
                    )}

                    {message.image && (
                      <div className="mb-3 overflow-hidden rounded-xl border border-white/10">
                        <img src={message.image} alt="Attachment" className="max-w-full h-auto rounded-xl hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    
                    <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap font-medium">
                      {message.text}
                    </p>

                    <div className={`flex items-center gap-1 mt-2 text-[9px] font-bold uppercase tracking-widest ${isMe ? "justify-end text-white/50" : "text-slate-500"}`}>
                      <time>{formatMessageTime(message.createdAt)}</time>
                      {isMe && !message.deleted && (
                        isRead ? <CheckCheck size={12} className="text-white" /> : <Check size={12} className="text-white/40" />
                      )}
                    </div>

                    {/* Action Menu (Desktop Hover) */}
                    {!message.deleted && hoveredMessage === message._id && (
                      <div className={`absolute top-0 ${isMe ? "-left-14" : "-right-14"} flex flex-col gap-2 animate-in fade-in slide-in-from-${isMe ? "right" : "left"}-2 duration-200`}>
                        <button className="p-2 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-slate-400 hover:text-white shadow-2xl transition-all hover:scale-110"><Reply size={14} /></button>
                        {isMe && <button onClick={() => deleteMessage(message._id)} className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white shadow-2xl transition-all hover:scale-110"><Trash2 size={14} /></button>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messageEndRef} />
        </div>

        {/* AI Smart Suggestions */}
        {Array.isArray(recommendations) && recommendations.length > 0 && !isRecommendationsLoading && (
          <div className="px-6 py-4 flex gap-3 animate-in slide-in-from-bottom-4 duration-500 overflow-x-auto no-scrollbar bg-white/[0.02] border-t border-white/5">
            {(recommendations || []).map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage({ text: suggestion })}
                className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-300 hover:bg-gradient-to-r hover:from-[#8b5cf6] hover:to-[#6366f1] hover:text-white hover:border-transparent transition-all duration-300 whitespace-nowrap shadow-lg flex items-center gap-2 group"
              >
                <Sparkles size={12} className="text-purple-400 group-hover:text-white group-hover:rotate-12 transition-all" />
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
