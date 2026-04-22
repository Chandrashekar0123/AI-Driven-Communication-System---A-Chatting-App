const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 bg-[#313338] bg-chat-pattern">
      {skeletonMessages.map((_, idx) => {
        const isMe = idx % 2 !== 0;
        return (
          <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-pulse`}>
            <div className={`flex gap-3 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar Circle */}
              <div className="size-10 rounded-full bg-[#2B2D31] shrink-0 opacity-40 border border-white/5" />
              
              <div className="space-y-2">
                {/* Header info */}
                <div className={`flex items-center gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className="h-2 w-16 bg-[#3F4147] rounded-full opacity-40" />
                  <div className="h-2 w-8 bg-[#3F4147] rounded-full opacity-20" />
                </div>
                
                {/* Bubble */}
                <div className={`px-4 py-3 rounded-2xl shadow-lg border border-white/5 ${
                  isMe ? "bg-[#5865F2]/20 rounded-tr-none" : "bg-[#2B2D31] rounded-tl-none"
                }`}>
                  <div className="space-y-2">
                    <div className={`h-3 ${isMe ? "w-48" : "w-64"} bg-[#3F4147] rounded-full opacity-30`} />
                    <div className={`h-3 ${isMe ? "w-32" : "w-40"} bg-[#3F4147] rounded-full opacity-10`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageSkeleton;
