import { MessageSquare, Sparkles, MessageCircle, Send } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-16 bg-[#313338] relative overflow-hidden">
      {/* Decorative Discord-style glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-[#5865F2]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-md text-center space-y-8 relative z-10 animate-in fade-in zoom-in duration-700">
        {/* Icon Display */}
        <div className="flex justify-center mb-4">
          <div className="relative group">
            <div className="size-24 rounded-[32px] bg-[#2B2D31] flex items-center justify-center transition-all duration-500 group-hover:rotate-12 shadow-2xl ring-1 ring-white/5">
              <MessageSquare className="size-12 text-[#5865F2] group-hover:scale-110 transition-transform" />
            </div>
            <div className="absolute -top-3 -right-3 p-3 rounded-2xl bg-[#5865F2] text-white shadow-xl animate-bounce">
              <Sparkles className="size-5" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-[#F2F3F5] tracking-tight text-outfit">
            Ready to start chatting?
          </h2>
          <p className="text-[#949BA4] font-medium text-lg max-w-sm mx-auto leading-relaxed">
            Select a friend or join a group to start messaging. Your premium AI assistant is ready to help.
          </p>
        </div>

        {/* Info Tiles */}
        <div className="pt-8 grid grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#2B2D31] border border-white/5 text-left space-y-3 group hover:bg-[#35373C] transition-all cursor-pointer shadow-lg">
            <div className="size-10 rounded-xl bg-[#5865F2]/10 flex items-center justify-center">
               <MessageCircle className="size-5 text-[#5865F2]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Direct Messaging</h4>
              <p className="text-[11px] text-[#949BA4] font-medium leading-relaxed">Fast, real-time communication with your contacts.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-[#2B2D31] border border-white/5 text-left space-y-3 group hover:bg-[#35373C] transition-all cursor-pointer shadow-lg">
             <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Send className="size-5 text-primary" />
             </div>
            <div>
              <h4 className="text-sm font-bold text-white">AI Assistant Hub</h4>
              <p className="text-[11px] text-[#949BA4] font-medium leading-relaxed">Summaries, translations, and smart suggestions.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom info */}
      <div className="absolute bottom-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#4E5058] flex items-center gap-6">
        <span className="flex items-center gap-2">END-TO-END ENCRYPTED</span>
        <div className="size-1 rounded-full bg-[#4E5058]"></div>
        <span className="flex items-center gap-2">VERIFIED AI ENGINE</span>
      </div>
    </div>
  );
};

export default NoChatSelected;
