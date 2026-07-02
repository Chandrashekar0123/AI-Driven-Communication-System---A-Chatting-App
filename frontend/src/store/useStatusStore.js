import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useStatusStore = create((set, get) => ({
  statuses: [],
  isStatusesLoading: false,

  getStatuses: async () => {
    set({ isStatusesLoading: true });
    try {
      const res = await axiosInstance.get("/status");
      set({ statuses: res.data });
    } catch (error) {
      toast.error("Failed to load statuses");
    } finally {
      set({ isStatusesLoading: false });
    }
  },

  createStatus: async (content, type = "text") => {
    try {
      const res = await axiosInstance.post("/status", { content, type });
      // The socket event 'newStatus' will push this to the list,
      // but we can add it optimistically too.
      set({ statuses: [res.data, ...get().statuses] });
      toast.success("Status posted!");
      return true;
    } catch (error) {
      toast.error("Failed to post status");
      return false;
    }
  },

  subscribeToStatusSocket: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    
    socket.on("newStatus", (newStatus) => {
      // Check if it already exists to avoid duplicates
      if (!get().statuses.find(s => s._id === newStatus._id)) {
        set({ statuses: [newStatus, ...get().statuses] });
      }
    });
  },

  unsubscribeFromStatusSocket: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newStatus");
  }
}));
