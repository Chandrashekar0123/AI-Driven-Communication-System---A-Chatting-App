import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedChat: null, // Unified for User or Group
  isUsersLoading: false,
  isGroupsLoading: false,
  isMessagesLoading: false,
  recommendations: [],
  isRecommendationsLoading: false,
  aiResult: null,
  isAILoading: false,
  isAIHubOpen: false,
  typingUsers: {}, // { chatId: [userIds] }
  unreadCounts: {}, // { chatId: count }
  lastMessages: {}, // { chatId: messageObject }

  toggleAIHub: () => set({ isAIHubOpen: !get().isAIHubOpen }),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  addContact: async (contactId) => {
    try {
      const res = await axiosInstance.post("/messages/add-contact", { contactId });
      const contact = res.data.contact;
      set((state) => ({ 
        users: state.users.some(u => u._id === contact._id) ? state.users : [...state.users, contact] 
      }));
      toast.success("Contact added successfully!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add contact");
      return false;
    }
  },

  searchUser: async (query) => {
    try {
      const res = await axiosInstance.get(`/messages/search?query=${query}`);
      return res.data;
    } catch (error) {
      return null;
    }
  },

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error("Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  getMessages: async (chatId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${chatId}`);
      set({ messages: res.data });
      get().markAsSeen(chatId);
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedChat, messages } = get();
    if (!selectedChat) return;

    try {
      const payload = {
        ...messageData,
        groupId: selectedChat.members ? selectedChat._id : null
      };
      console.log("DEBUG: Sending message payload:", payload);
      const res = await axiosInstance.post(`/messages/send/${selectedChat._id}`, payload);
      console.log("DEBUG: Message sent response:", res.data);
      set({ 
        messages: [...messages, res.data],
        lastMessages: { ...get().lastMessages, [selectedChat._id]: res.data },
        recommendations: [] 
      });
    } catch (error) {
      console.error("DEBUG: Failed to send message error:", error);
      toast.error("Failed to send message");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);
      set({
        messages: get().messages.map(m => m._id === messageId ? { ...m, deleted: true, text: "This message was deleted", image: null, fileUrl: null } : m)
      });
    } catch (error) {
      toast.error("Failed to delete message");
    }
  },

  markAsSeen: async (chatId) => {
    try {
      await axiosInstance.post(`/messages/seen/${chatId}`);
      set((state) => ({
        unreadCounts: { ...state.unreadCounts, [chatId]: 0 }
      }));
    } catch (error) {
      console.error("Failed to mark as seen");
    }
  },

  sendTypingStatus: (isTyping) => {
    const { selectedChat } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedChat || !socket) return;

    const event = isTyping ? "typing" : "stopTyping";
    const payload = selectedChat.members 
      ? { groupId: selectedChat._id } 
      : { receiverId: selectedChat._id };
    
    socket.emit(event, payload);
  },

  runAIFeature: async (feature, additionalData = {}) => {
    const { selectedChat } = get();
    if (!selectedChat) return;

    set({ isAILoading: true, aiResult: null });
    try {
      const res = await axiosInstance.post("/messages/ai", {
        feature,
        chatId: selectedChat._id,
        ...additionalData,
      });
      set({ aiResult: res.data });
      if (feature === "auto_reply") set({ recommendations: Array.isArray(res.data.result) ? res.data.result : [] });
      return res.data;
    } catch (error) {
      toast.error("AI Assistant is unavailable");
      if (feature === "auto_reply") set({ recommendations: ["Hey!", "How's it going?", "Good morning!"] });
    } finally {
      set({ isAILoading: false });
    }
  },

  subscribeToSocket: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("DEBUG: subscribeToSocket called but socket is NULL");
      return;
    }
    
    console.log("DEBUG: subscribeToSocket activated. Listening for events...");

    socket.on("newMessage", (newMessage) => {
      console.log("DEBUG: Received newMessage via socket:", newMessage);
      const { selectedChat, messages, unreadCounts, users } = get();
      const senderId = typeof newMessage.senderId === 'object' ? newMessage.senderId._id : newMessage.senderId;
      const chatId = newMessage.groupId || senderId;
      
      console.log("DEBUG: Current selectedChat ID:", selectedChat?._id);
      console.log("DEBUG: Incoming message chatId:", chatId);

      if (selectedChat && (selectedChat._id === chatId)) {
        console.log("DEBUG: Updating messages state with new message");
        set({ 
          messages: [...messages, newMessage],
          lastMessages: { ...get().lastMessages, [chatId]: newMessage }
        });
        get().markAsSeen(chatId);
      } else {
        console.log("DEBUG: Message not for current chat. Updating unread counts.");
        set({
          unreadCounts: { ...unreadCounts, [chatId]: (unreadCounts[chatId] || 0) + 1 },
          lastMessages: { ...get().lastMessages, [chatId]: newMessage }
        });
        
        const senderName = newMessage.senderId?.fullName || "Someone";
        const snippet = newMessage.text ? (newMessage.text.substring(0, 30) + (newMessage.text.length > 30 ? "..." : "")) : "sent an image";
        
        toast(`${senderName}: ${snippet}`, { 
          icon: '💬',
          style: {
            border: '1px solid #5865F2',
            padding: '12px',
            color: '#DBDEE1',
            background: '#2B2D31',
          }
        });
        get().getUsers();
      }
    });

    socket.on("typing", ({ senderId, groupId }) => {
      console.log("DEBUG: Received typing event:", { senderId, groupId });
      const chatId = groupId || senderId;
      set((state) => ({
        typingUsers: { 
          ...state.typingUsers, 
          [chatId]: [...(state.typingUsers[chatId] || []), senderId] 
        }
      }));
    });

    socket.on("stopTyping", ({ senderId, groupId }) => {
      const chatId = groupId || senderId;
      set((state) => ({
        typingUsers: { 
          ...state.typingUsers, 
          [chatId]: (state.typingUsers[chatId] || []).filter(id => id !== senderId) 
        }
      }));
    });

    socket.on("messageDeleted", ({ messageId }) => {
      set({
        messages: get().messages.map(m => m._id === messageId ? { ...m, deleted: true, text: "This message was deleted" } : m)
      });
    });

    socket.on("messagesSeen", ({ chatId, seenBy }) => {
      const { selectedChat, messages } = get();
      if (selectedChat && selectedChat._id === chatId) {
        set({
          messages: messages.map(m => m.senderId === seenBy ? m : { ...m, readBy: [...(m.readBy || []), seenBy] })
        });
      }
    });
  },

  unsubscribeFromSocket: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("messageDeleted");
    socket.off("messagesSeen");
  },

  setSelectedChat: (chat) => {
    set({ selectedChat: chat, recommendations: [], aiResult: null });
    if (chat) {
      get().getMessages(chat._id);
      get().runAIFeature("auto_reply");
    }
  },
}));
