import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/layout/Sidebar";
import NoChatSelected from "../components/chat/NoChatSelected";
import ChatContainer from "../components/chat/ChatContainer";
import ServerRail from "../components/layout/ServerRail";

const HomePage = () => {
  const { selectedChat } = useChatStore();

  return (
    <div className="h-screen flex overflow-hidden transition-colors duration-300">
      {/* 1st Column: Discord Server Rail */}
      <div className={`${selectedChat ? "hidden sm:flex" : "flex"} h-full`}>
        <ServerRail />
      </div>

      {/* 2nd & 3rd Columns: Sidebar + Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        
        <div className={`${selectedChat ? "hidden sm:block" : "block"} w-full sm:w-auto`}>
          <Sidebar />
        </div>

        <div className={`${selectedChat ? "flex" : "hidden sm:flex"} flex-1 flex-col overflow-hidden bg-[#313338]`}>
          {!selectedChat ? <NoChatSelected /> : <ChatContainer />}
        </div>
      </div>
    </div>
  );
};
export default HomePage;
