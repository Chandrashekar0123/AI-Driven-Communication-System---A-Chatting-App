import { useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { X, Compass, Search, Loader2 } from "lucide-react";

const ExploreGroupsModal = ({ isOpen, onClose }) => {
  const { publicGroups, isPublicGroupsLoading, getPublicGroups, joinGroup } = useChatStore();

  useEffect(() => {
    if (isOpen) {
      getPublicGroups();
    }
  }, [isOpen, getPublicGroups]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e1f22] w-full max-w-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300 max-h-[80vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Compass className="text-purple-400" /> Explore Public Servers
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          {/* Search bar (placeholder for future implementation if needed) */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input 
              type="text" 
              placeholder="Search public servers..." 
              className="w-full bg-[#111214] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {isPublicGroupsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <Loader2 className="size-8 animate-spin text-purple-500" />
              <p className="text-sm font-bold uppercase tracking-widest">Finding servers...</p>
            </div>
          ) : publicGroups?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <Compass className="size-12 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest text-center">No public servers found.<br/>Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {publicGroups?.map(group => (
                <div key={group._id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:bg-white/10 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 overflow-hidden">
                      {group.profilePic ? (
                        <img src={group.profilePic} alt={group.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-xl">{group.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate text-sm">{group.name}</h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{group.members?.length || 0} Member{(group.members?.length !== 1) ? 's' : ''}</p>
                    </div>
                  </div>
                  {group.description && (
                    <p className="text-xs text-slate-300 line-clamp-2">{group.description}</p>
                  )}
                  <button 
                    onClick={() => {
                      joinGroup(group._id);
                      onClose();
                    }}
                    className="mt-auto w-full py-2 bg-purple-500/10 text-purple-400 font-bold text-xs rounded-lg hover:bg-purple-500 hover:text-white transition-colors uppercase tracking-wider"
                  >
                    Join Server
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreGroupsModal;
