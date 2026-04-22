import { useEffect, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import SidebarSkeleton from "../skeletons/SidebarSkeleton";
import { Settings, Mic, Headphones, Search, ChevronDown, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { getUsers, getGroups, users, groups, selectedChat, setSelectedChat, isUsersLoading, unreadCounts, typingUsers, addContact, searchUser, lastMessages } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

  const handleAddContact = async (contactId) => {
    const id = contactId || inviteEmail;
    if (!id) return;
    const success = await addContact(id);
    if (success) {
      setInviteEmail("");
      setSearchQuery("");
    }
  };

  const handleGlobalSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    const result = await searchUser(searchQuery);
    if (!result) toast.error("User not found globally");
  };

  const allChats = [...users.map(u => ({ ...u, type: 'user' })), ...groups.map(g => ({ ...g, type: 'group' }))];
  
  const sortedChats = allChats.sort((a, b) => {
    const lastA = lastMessages[a._id]?.createdAt || '0';
    const lastB = lastMessages[b._id]?.createdAt || '0';
    return new Date(lastB) - new Date(lastA);
  });

  const filteredChats = sortedChats.filter((chat) => {
    const name = (chat.fullName || chat.name || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = name.includes(query);
    if (!matchesSearch) return false;
    if (activeTab === "groups") return chat.type === 'group';
    if (activeTab === "online") return chat.type === 'user' && onlineUsers.includes(chat._id);
    return true;
  }).sort((a, b) => (unreadCounts[b._id] || 0) - (unreadCounts[a._id] || 0));

  if (isUsersLoading && users.length === 0) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-72 lg:w-80 flex flex-col bg-white/[0.01] backdrop-blur-2xl border-r border-white/5 transition-all duration-300 relative z-30 shadow-2xl">
      <div className="p-6 border-b border-white/5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Private Stream</h2>
            <ChevronDown className="size-3 text-slate-500" />
          </div>
          <button className="btn btn-ghost btn-xs btn-circle bg-white/5 hover:bg-purple-500 hover:text-white text-slate-400 transition-all shadow-lg">
            <UserPlus className="size-4" />
          </button>
        </div>
        
        <form onSubmit={handleGlobalSearch} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-purple-400 transition-colors z-10" />
          <input 
            type="text" 
            placeholder="Search stream..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder:text-slate-600 focus:ring-1 focus:ring-purple-500/30 transition-all outline-none relative z-10 font-semibold"
          />
        </form>

        <div className="flex gap-1.5 p-1 bg-black/20 rounded-xl">
          {['all', 'groups', 'online'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === tab ? "bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white shadow-lg" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 premium-scrollbar">
        {filteredChats.map((chat) => (
          <button
            key={chat._id}
            onClick={() => setSelectedChat(chat)}
            className={`w-full px-4 py-4 flex items-center gap-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${selectedChat?._id === chat._id ? "bg-white/10 text-white shadow-xl ring-1 ring-white/10" : "text-slate-400 hover:bg-white/[0.03] hover:text-white hover:translate-x-1"}`}
          >
            <div className="relative shrink-0">
              <img src={chat.profilePic || (chat.type === 'group' ? "/group-avatar.png" : "/avatar.png")} alt={chat.fullName || chat.name} className={`size-12 object-cover rounded-xl shadow-2xl transition-all duration-500 ${selectedChat?._id === chat._id ? 'rounded-lg scale-105' : 'group-hover:rounded-lg'}`} />
              {chat.type === 'user' && onlineUsers.includes(chat._id) && <span className="absolute -bottom-1 -right-1 size-4 bg-[#23A559] rounded-full ring-4 ring-[#12141a] shadow-2xl" />}
            </div>
            <div className="text-left flex-1 min-w-0 relative z-10">
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-[13px] tracking-tight truncate">{chat.fullName || chat.name}</span>
                {unreadCounts[chat._id] > 0 && <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg min-w-[18px] text-center shadow-lg shadow-rose-500/30">{unreadCounts[chat._id]}</span>}
              </div>
              <div className="text-[10px] truncate flex items-center gap-1.5 font-bold">
                {typingUsers[chat._id]?.length > 0 ? <span className="text-purple-400 animate-pulse uppercase tracking-widest">Transmitting...</span> : <span className="opacity-40 uppercase tracking-[0.15em]">{chat.type === 'group' ? 'Server Node' : 'Neural Link'}</span>}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 bg-black/40 backdrop-blur-3xl border-t border-white/5 flex items-center gap-4">
        <div className="relative group cursor-pointer">
          <div className="size-11 rounded-xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 group-hover:scale-110">
            <img src={authUser.profilePic || "/avatar.png"} alt="me" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1 -right-1 size-4 bg-[#23A559] rounded-full ring-2 ring-black shadow-lg"></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black text-white truncate tracking-tight">{authUser.fullName}</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Stream Active</div>
        </div>
        <div className="flex gap-1">
          <button className="p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all"><Mic size={16} /></button>
          <button className="p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all"><Headphones size={16} /></button>
          <Link to="/settings" className="p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all"><Settings size={16} /></Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
