import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Lock, Unlock, Key, Plus, Trash2, ShieldCheck, X, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const SecretVaultModal = ({ isOpen, onClose }) => {
  const { authUser } = useAuthStore();
  const [pin, setPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [savedPin, setSavedPin] = useState(() => localStorage.getItem(`vault_pin_${authUser?._id}`) || "");
  const [notes, setNotes] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showNoteContent, setShowNoteContent] = useState({});

  useEffect(() => {
    if (isUnlocked && authUser?._id) {
      const stored = localStorage.getItem(`vault_notes_${authUser._id}`);
      if (stored) {
        try {
          setNotes(JSON.parse(stored));
        } catch (e) {
          setNotes([]);
        }
      }
    }
  }, [isUnlocked, authUser]);

  if (!isOpen) return null;

  const handleSetOrUnlockPin = (e) => {
    e.preventDefault();
    if (pin.length < 4) return toast.error("PIN must be 4 digits");

    if (!savedPin) {
      localStorage.setItem(`vault_pin_${authUser?._id}`, pin);
      setSavedPin(pin);
      setIsUnlocked(true);
      toast.success("🔒 Vault PIN created & unlocked!");
    } else if (pin === savedPin) {
      setIsUnlocked(true);
      toast.success("🔓 Vault unlocked!");
    } else {
      toast.error("Incorrect PIN code");
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return toast.error("Title and content are required");

    const newNote = {
      id: Date.now(),
      title: newTitle.trim(),
      content: newContent.trim(),
      date: new Date().toLocaleDateString()
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem(`vault_notes_${authUser?._id}`, JSON.stringify(updated));
    setNewTitle("");
    setNewContent("");
    toast.success("Encrypted note saved");
  };

  const handleDeleteNote = (id) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem(`vault_notes_${authUser?._id}`, JSON.stringify(updated));
    toast.success("Note deleted");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1e1f22] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-white/10 space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3 text-purple-400">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              {isUnlocked ? <Unlock size={20} /> : <Lock size={20} />}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">Encrypted Secret Vault</h3>
              <p className="text-[11px] text-slate-400 font-medium">PIN-protected secure private storage</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* PIN Authentication Screen */}
        {!isUnlocked ? (
          <form onSubmit={handleSetOrUnlockPin} className="space-y-5 py-4 text-center">
            <div className="size-16 rounded-3xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center border border-purple-500/20 shadow-xl">
              <Key size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-lg text-white">
                {savedPin ? "Enter Vault PIN" : "Create Secret Vault PIN"}
              </h4>
              <p className="text-xs text-slate-400">
                {savedPin ? "Enter your 4-digit passcode to view confidential notes" : "Set a 4-digit passcode to lock your encrypted notes"}
              </p>
            </div>

            <input
              type="password"
              maxLength={4}
              autoFocus
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="w-36 text-center text-2xl tracking-[0.5em] font-black bg-[#2b2d31] border border-white/10 rounded-2xl py-3 text-white outline-none focus:border-purple-500 transition-all mx-auto block"
            />

            <button
              type="submit"
              disabled={pin.length < 4}
              className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${
                pin.length === 4
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:scale-102"
                  : "bg-white/5 text-slate-600 cursor-not-allowed"
              }`}
            >
              {savedPin ? "Unlock Vault" : "Create PIN & Lock"}
            </button>
          </form>
        ) : (
          /* Vault Notes Storage UI */
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
            {/* Create New Note Form */}
            <form onSubmit={handleAddNote} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                <Plus size={14} /> Add Private Note / Passkey
              </div>
              <input
                type="text"
                placeholder="Title (e.g. Bank PIN, Private Key, Personal Note)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-[#2b2d31] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-purple-500"
              />
              <textarea
                placeholder="Encrypted content..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-[#2b2d31] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-purple-500 resize-none h-20"
              />
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-101 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-purple-500/20"
              >
                Save Encrypted Note
              </button>
            </form>

            {/* Saved Notes List */}
            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Your Encrypted Vault Notes ({notes.length})</p>
              {notes.length === 0 ? (
                <div className="text-center py-8 text-slate-500 space-y-2">
                  <ShieldCheck className="size-10 mx-auto opacity-30 text-purple-400" />
                  <p className="text-xs font-bold">No secret notes saved yet.</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-4 rounded-2xl bg-[#2b2d31] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <Lock size={13} className="text-purple-400" />
                        <span>{note.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowNoteContent(prev => ({ ...prev, [note.id]: !prev[note.id] }))}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                          title={showNoteContent[note.id] ? "Hide content" : "Reveal content"}
                        >
                          {showNoteContent[note.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#1e1f22] p-3 rounded-xl border border-white/5 font-mono text-xs text-slate-300 break-words">
                      {showNoteContent[note.id] ? note.content : "••••••••••••••••••••"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SecretVaultModal;
