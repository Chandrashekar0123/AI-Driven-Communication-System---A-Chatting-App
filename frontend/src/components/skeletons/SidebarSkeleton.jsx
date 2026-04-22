import { Hash } from "lucide-react";

const SidebarSkeleton = () => {
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="h-full w-72 lg:w-80 flex flex-col bg-[#2B2D31] border-r border-black/20 transition-all duration-300">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-black/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-2 bg-[#949BA4] rounded-full opacity-20 animate-pulse" />
            <div className="h-2 w-16 bg-[#949BA4] rounded-full opacity-20 animate-pulse" />
          </div>
          <div className="size-6 bg-[#949BA4] rounded-full opacity-10 animate-pulse" />
        </div>
        <div className="h-8 w-full bg-[#1E1F22] rounded-md opacity-50 animate-pulse" />
        <div className="flex gap-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-5 w-12 bg-[#949BA4] rounded-md opacity-10 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Skeleton Contacts */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="w-full px-3 py-3 flex items-center gap-3">
            <div className="size-10 bg-[#3F4147] rounded-full shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/3 bg-[#3F4147] rounded-full animate-pulse" />
              <div className="h-2 w-1/3 bg-[#3F4147] rounded-full opacity-50 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* User Status Bar Skeleton */}
      <div className="p-2 bg-[#232428] flex items-center gap-2">
        <div className="size-8 bg-[#3F4147] rounded-full animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 w-1/2 bg-[#3F4147] rounded-full animate-pulse" />
          <div className="h-2 w-1/3 bg-[#3F4147] rounded-full opacity-50 animate-pulse" />
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="size-6 bg-[#3F4147] rounded opacity-20 animate-pulse" />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
