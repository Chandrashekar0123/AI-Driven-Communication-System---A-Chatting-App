import { Sparkles, X, User, Users, MoreVertical, Phone, Video, Search, CheckSquare, Download, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { useState } from "react";
import GroupSettingsModal from "../groups/GroupSettingsModal";

import SearchMessagesModal from "./SearchMessagesModal";

const ChatHeader = () => {
  const { selectedChat, setSelectedChat, runAIFeature, isAILoading, typingUsers, isAIHubOpen, messages } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  if (!selectedChat) return null;

  const isGroup = !!selectedChat.members;
  const isOnline = !isGroup && onlineUsers.includes(selectedChat._id);
  const typing = typingUsers[selectedChat._id]?.length > 0;

  const handleStartCall = () => {
    if (isGroup) return; // Currently only 1-on-1 supported
    window.dispatchEvent(new Event("start-call"));
  };

  const handleExportChat = () => {
    if (!messages || messages.length === 0) return;
    
    const chatName = selectedChat.fullName || selectedChat.name || "Chat";
    let textContent = `Chat Export: ${chatName}\n`;
    textContent += `Date: ${new Date().toLocaleString()}\n`;
    textContent += `-------------------------------------------------\n\n`;
    
    messages.forEach(msg => {
      const sender = msg.senderId === authUser?._id ? "You" : (msg.senderId === selectedChat._id ? chatName : "User");
      const time = new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const content = msg.text || (msg.image ? "[Image]" : "") || (msg.fileUrl ? "[File]" : "") || "";
      textContent += `[${time}] ${sender}: ${content}\n`;
    });
    
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Chat_Export_${chatName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-16 px-4 sm:px-6 flex items-center justify-between bg-white/[0.02] backdrop-blur-3xl border-b border-white/5 shadow-2xl relative z-20">
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Mobile Back Button */}
        <button 
          onClick={() => setSelectedChat(null)}
          className="sm:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="Back to chat list"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Avatar */}
        <div className="relative group">
          <div className="size-11 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10 transition-all duration-500 group-hover:rounded-xl">
            <img src={selectedChat.profilePic || (isGroup ? "/group-avatar.png" : "/avatar.png")} alt="avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          </div>
          {isOnline && (
            <span className="absolute -bottom-1 -right-1 size-4 bg-[#23A559] rounded-full ring-4 ring-[#0f1115] shadow-xl" />
          )}
        </div>

        {/* Info */}
        <div>
          <h3 className="font-black text-[15px] text-white tracking-tight flex items-center gap-2">
            {selectedChat.fullName || selectedChat.name}
            {isGroup && <Users className="size-4 text-slate-500" />}
          </h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">
            {isAILoading ? (
              <span className="text-purple-400 animate-pulse flex items-center gap-1">
                <Sparkles size={10} /> AI is thinking...
              </span>
            ) : typing ? (
              <span className="text-purple-400 animate-pulse">Typing...</span>
            ) : isOnline ? (
              <span className="text-[#23A559] opacity-80">Online</span>
            ) : (
              <span className="text-slate-500">
                {selectedChat.lastSeen ? `Last seen: ${new Date(selectedChat.lastSeen).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : "Offline"}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">

        <button 
          onClick={() => setShowSearch(true)}
          className="btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          title="Search Messages"
        >
          <Search size={18} />
        </button>
        <button 
          onClick={handleExportChat}
          className="btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          title="Export Chat"
        >
          <Download size={18} />
        </button>
        {!isGroup && (
          <button onClick={handleStartCall} className="btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Video size={18} />
          </button>
        )}
        
        <div className="w-[1px] h-6 bg-white/5 mx-2" />
        
        {/* Visible Quick AI Actions */}
        <button
          onClick={() => runAIFeature("auto_reply")}
          disabled={isAILoading}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-bold transition-all shadow-sm group"
          title="Generate 3 Quick Replies"
        >
          <Sparkles size={13} className="text-purple-400 group-hover:rotate-12 transition-transform" />
          <span>Auto Reply</span>
        </button>

        <button
          onClick={() => runAIFeature("summary")}
          disabled={isAILoading}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 text-xs font-bold transition-all shadow-sm group"
          title="Summarize Chat Recap"
        >
          <Sparkles size={13} className="text-blue-400 group-hover:rotate-12 transition-transform" />
          <span>Summarize</span>
        </button>

        <div className="relative group">
          <button 
            className={`btn btn-sm px-4 gap-2 rounded-xl border-none shadow-2xl transition-all duration-500 ${
              isAIHubOpen 
                ? 'bg-gradient-to-r from-[#8b5cf6] to-[#5865F2] text-white shadow-purple-500/30' 
                : isAILoading 
                  ? 'bg-white/5 text-purple-400 animate-pulse' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
            onClick={() => useChatStore.getState().toggleAIHub()}
            disabled={isAILoading}
          >
            <Sparkles className={`size-4 ${isAILoading ? 'animate-spin' : ''} ${isAIHubOpen ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:inline">Magic Hub</span>
          </button>
        </div>

        {isGroup && (
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-white hover:bg-white/5 ml-1 transition-all"
          >
            <MoreVertical size={18} />
          </button>
        )}
        <button 
          onClick={() => setSelectedChat(null)}
          className="btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-red-500 hover:bg-red-500/10 ml-1 transition-all"
        >
          <X size={20} />
        </button>
      </div>
      
      {isGroup && (
        <GroupSettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          group={selectedChat} 
        />
      )}

      <SearchMessagesModal 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
      />
    </div>
  );
};

export default ChatHeader;
