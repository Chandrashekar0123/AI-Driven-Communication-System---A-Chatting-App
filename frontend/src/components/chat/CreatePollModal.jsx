import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { X, Plus, Trash2, BarChart2 } from "lucide-react";
import toast from "react-hot-toast";

const CreatePollModal = ({ isOpen, onClose }) => {
  const { sendMessage, selectedChat } = useChatStore();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length >= 6) return toast.error("Maximum 6 options allowed");
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) return toast.error("Minimum 2 options required");
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return toast.error("Poll question is required");
    const validOptions = options.map(o => o.trim()).filter(Boolean);
    if (validOptions.length < 2) return toast.error("At least 2 valid options are required");

    try {
      await sendMessage({
        text: `📊 Poll: ${question.trim()}`,
        poll: {
          question: question.trim(),
          options: validOptions.map(opt => ({ optionText: opt, votes: [] }))
        }
      });
      toast.success("Poll created!");
      setQuestion("");
      setOptions(["", ""]);
      onClose();
    } catch (err) {
      toast.error("Failed to create poll");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1e1f22] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/10 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3 text-purple-400">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <BarChart2 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">Create Group Poll</h3>
              <p className="text-[11px] text-slate-400 font-medium">Ask a question & let members vote live</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Question</label>
            <input
              type="text"
              placeholder="e.g. What time should we meet tomorrow?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-[#2b2d31] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 outline-none transition-all font-medium"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Options</label>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                <Plus size={14} /> Add Option
              </button>
            </div>

            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="flex-1 bg-[#2b2d31] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 outline-none transition-all font-medium"
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-102 text-white font-bold text-xs transition-all shadow-lg shadow-purple-500/30"
            >
              Create Poll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;
