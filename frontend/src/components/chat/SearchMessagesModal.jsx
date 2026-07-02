import { useState, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { X, Search, Loader2, MessageSquare } from "lucide-react";
import { formatMessageTime } from "../../lib/utils";

const SearchMessagesModal = ({ isOpen, onClose }) => {
  const { searchMessages, searchResults, isSearchLoading, selectedChat } = useChatStore();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Execute search
  useEffect(() => {
    if (isOpen && selectedChat) {
      if (debouncedQuery.trim()) {
        searchMessages(selectedChat._id, debouncedQuery.trim());
      } else {
        // Clear results if query is empty
        searchMessages(selectedChat._id, "");
      }
    }
  }, [debouncedQuery, isOpen, selectedChat, searchMessages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e1f22] w-full max-w-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-300 max-h-[80vh]">
        
        {/* Search Input Area */}
        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
          <Search className="text-purple-400 size-5" />
          <input 
            type="text" 
            autoFocus
            placeholder="Search messages in this chat..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 font-medium text-lg"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          )}
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-all">
            Esc
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto min-h-[300px] p-4 flex flex-col gap-2">
          {isSearchLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400">
              <Loader2 className="size-8 animate-spin text-purple-500" />
              <p className="text-sm font-bold uppercase tracking-widest">Searching...</p>
            </div>
          ) : !query ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-500">
              <Search className="size-12 opacity-20" />
              <p className="text-sm font-bold text-center">Type to search for messages,<br/>links, or keywords.</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-500">
              <MessageSquare className="size-12 opacity-20" />
              <p className="text-sm font-bold">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest px-2 pb-2">
                {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''}
              </p>
              {searchResults.map((msg, idx) => (
                <div key={msg._id || idx} className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-3 flex gap-3 cursor-pointer transition-colors group">
                  <img 
                    src={msg.senderId?.profilePic || "/avatar.png"} 
                    alt="avatar" 
                    className="size-8 rounded-full object-cover shrink-0 ring-1 ring-white/10" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-white truncate">{msg.senderId?.fullName || "User"}</span>
                      <span className="text-[10px] text-slate-500">{formatMessageTime(msg.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-300 break-words whitespace-pre-wrap leading-snug">
                      {msg.text}
                    </p>
                    {msg.image && (
                      <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                        📷 Attached Image
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchMessagesModal;
