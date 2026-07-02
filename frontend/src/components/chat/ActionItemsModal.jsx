import { useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { X, CheckSquare, Loader2, Download } from "lucide-react";
import toast from "react-hot-toast";

const ActionItemsModal = ({ isOpen, onClose }) => {
  const { actionItems, isActionItemsLoading, getActionItems, selectedChat } = useChatStore();

  useEffect(() => {
    if (isOpen && selectedChat) {
      getActionItems(selectedChat._id);
    }
  }, [isOpen, selectedChat, getActionItems]);

  if (!isOpen) return null;

  const handleExport = (format) => {
    if (!actionItems || actionItems.length === 0) {
      toast.error("No action items to export.");
      return;
    }

    try {
      let data, type, filename;
      
      if (format === 'json') {
        data = JSON.stringify(actionItems, null, 2);
        type = "application/json";
        filename = "action-items.json";
      } else if (format === 'csv') {
        const headers = ["Task", "Person", "Deadline"];
        const rows = actionItems.map(item => [
          `"${(item.task || "").replace(/"/g, '""')}"`,
          `"${(item.person || "").replace(/"/g, '""')}"`,
          `"${(item.deadline || "").replace(/"/g, '""')}"`
        ]);
        data = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        type = "text/csv";
        filename = "action-items.csv";
      }

      const blob = new Blob([data], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error("Export failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e1f22] w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300 max-h-[80vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CheckSquare className="text-purple-400" /> Action Items
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          {isActionItemsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <Loader2 className="size-8 animate-spin text-purple-500" />
              <p className="text-sm font-bold uppercase tracking-widest">Extracting Tasks...</p>
            </div>
          ) : actionItems?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <CheckSquare className="size-12 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest text-center">No action items found<br/>in recent conversation.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {actionItems.map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2 relative group hover:bg-white/10 transition-colors">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0 size-4 rounded bg-purple-500/20 border border-purple-500/50 flex items-center justify-center" />
                    <p className="text-sm font-medium text-white leading-snug flex-1">{item.task || "Unknown Task"}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-6 text-xs text-slate-400 font-bold">
                    {item.person && (
                      <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full border border-white/5">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500">Who:</span> {item.person}
                      </span>
                    )}
                    {item.deadline && (
                      <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full border border-white/5">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500">When:</span> {item.deadline}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Actions */}
        {!isActionItemsLoading && actionItems?.length > 0 && (
          <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex gap-3">
            <button 
              onClick={() => handleExport('json')}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 text-slate-300 font-bold text-xs hover:bg-white/10 hover:text-white transition-all uppercase tracking-wider border border-white/10"
            >
              <Download size={14} /> Export JSON
            </button>
            <button 
              onClick={() => handleExport('csv')}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-purple-500/20 text-purple-400 font-bold text-xs hover:bg-purple-500 hover:text-white transition-all uppercase tracking-wider border border-purple-500/30"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionItemsModal;
