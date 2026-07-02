import { useState, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { X, Users, UserMinus, UserPlus, LogOut, Shield } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";

const GroupSettingsModal = ({ isOpen, onClose, group }) => {
  const { authUser } = useAuthStore();
  const { getGroups, setSelectedChat } = useChatStore();
  const [memberId, setMemberId] = useState("");
  const [loading, setLoading] = useState(false);
  const [editName, setEditName] = useState(group?.name || "");
  const [editDescription, setEditDescription] = useState(group?.description || "");

  useEffect(() => {
    if (group) {
      setEditName(group.name || "");
      setEditDescription(group.description || "");
    }
  }, [group]);

  if (!isOpen || !group) return null;

  const isAdmin = group.admins?.includes(authUser._id);

  const handleAddMember = async () => {
    if (!memberId.trim()) return;
    setLoading(true);
    try {
      await axiosInstance.post(`/groups/add/${group._id}`, { userId: memberId });
      toast.success("Member added successfully");
      setMemberId("");
      getGroups();
      onClose(); // In a real app we'd fetch the group again, closing is easier for now
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (id) => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/groups/remove/${group._id}/${id}`);
      toast.success("Member removed");
      getGroups();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(`/groups/leave/${group._id}`);
      toast.success("You left the group");
      getGroups();
      setSelectedChat(null);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to leave group");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroup = async () => {
    setLoading(true);
    try {
      await axiosInstance.put(`/groups/${group._id}`, { name: editName, description: editDescription });
      toast.success("Group updated");
      getGroups();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("Are you sure you want to delete this group? This cannot be undone.")) return;
    setLoading(true);
    try {
      await axiosInstance.delete(`/groups/${group._id}`);
      toast.success("Group deleted");
      getGroups();
      setSelectedChat(null);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e1f22] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="text-purple-400" /> Group Settings
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 max-h-[60vh] overflow-y-auto">
          {/* Add Member (Admins Only) */}
          {isAdmin && (
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <UserPlus size={14} /> Add Member (User ID)
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={memberId} 
                  onChange={(e) => setMemberId(e.target.value)}
                  className="flex-1 bg-[#111214] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Paste User ID"
                />
                <button 
                  onClick={handleAddMember}
                  disabled={loading || !memberId}
                  className="px-4 py-2 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Edit Group Info (Admins Only) */}
          {isAdmin && (
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Group Info</label>
              <input 
                type="text" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#111214] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Group Name"
              />
              <textarea 
                value={editDescription} 
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-[#111214] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors resize-none h-20"
                placeholder="Group Description"
              />
              <button 
                onClick={handleUpdateGroup}
                disabled={loading || !editName}
                className="w-full py-2.5 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          )}

          {/* Members List */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Members</label>
            <div className="flex flex-col gap-2">
              {group.members?.map(member => (
                <div key={typeof member === 'object' ? member._id : member} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#111214] flex items-center justify-center overflow-hidden">
                      {typeof member === 'object' && member.profilePic ? (
                        <img src={member.profilePic} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Users size={16} className="text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-1">
                        {typeof member === 'object' ? member.fullName : member}
                        {group.admins?.includes(typeof member === 'object' ? member._id : member) && (
                          <Shield size={12} className="text-yellow-500" />
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {isAdmin && (typeof member === 'object' ? member._id : member) !== authUser._id && (
                    <button 
                      onClick={() => handleRemoveMember(typeof member === 'object' ? member._id : member)}
                      disabled={loading}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500 transition-colors"
                    >
                      <UserMinus size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-2 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
            <button 
              onClick={handleLeaveGroup}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-500 font-bold hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Leave Group
            </button>
            {isAdmin && (
              <button 
                onClick={handleDeleteGroup}
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <X size={16} /> Delete Group
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GroupSettingsModal;
