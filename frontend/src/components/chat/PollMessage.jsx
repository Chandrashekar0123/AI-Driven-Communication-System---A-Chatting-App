import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { CheckCircle2, BarChart2 } from "lucide-react";
import toast from "react-hot-toast";

const PollMessage = ({ message }) => {
  const { authUser } = useAuthStore();
  const { votePoll } = useChatStore();
  const [isVoting, setIsVoting] = useState(false);

  const poll = message?.poll;
  if (!poll || !poll.question || !Array.isArray(poll.options) || poll.options.length === 0) return null;

  // Calculate total votes
  const totalVotes = poll.options.reduce((acc, opt) => acc + (opt.votes?.length || 0), 0);

  const handleVote = async (index) => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      await votePoll(message._id, index);
    } catch (err) {
      toast.error("Failed to submit vote");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-[#1e1f22]/90 rounded-2xl p-4 border border-white/10 space-y-3 shadow-xl my-1">
      <div className="flex items-center gap-2.5 text-purple-400 pb-1 border-b border-white/5">
        <BarChart2 size={16} />
        <span className="text-[11px] font-black uppercase tracking-wider">Group Poll</span>
      </div>

      <h4 className="font-extrabold text-sm text-white leading-snug">{poll.question}</h4>

      <div className="space-y-2">
        {poll.options.map((option, idx) => {
          const voteCount = option.votes?.length || 0;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const hasVoted = option.votes?.some((v) => (typeof v === "object" ? v._id : v) === authUser._id);

          return (
            <button
              key={idx}
              disabled={isVoting}
              onClick={() => handleVote(idx)}
              className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden group ${
                hasVoted 
                  ? "bg-purple-500/20 border-purple-500/50 shadow-md" 
                  : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {/* Background Progress Bar */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-purple-500/20 transition-all duration-500 pointer-events-none"
                style={{ width: `${percentage}%` }}
              />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                  <span className={`text-xs font-bold truncate ${hasVoted ? "text-purple-300" : "text-slate-200"}`}>
                    {option.optionText}
                  </span>
                  {hasVoted && <CheckCircle2 size={14} className="text-purple-400 shrink-0" />}
                </div>
                <div className="flex items-center gap-2 shrink-0 text-[11px] font-extrabold text-slate-400">
                  <span>{voteCount} {voteCount === 1 ? "vote" : "votes"}</span>
                  <span className="text-purple-400">{percentage}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-right pt-1">
        {totalVotes} Total {totalVotes === 1 ? "Vote" : "Votes"}
      </div>
    </div>
  );
};

export default PollMessage;
