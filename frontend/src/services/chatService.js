import { io } from "socket.io-client";
import API, { API_BASE_URL } from "./api";
import adminAPI from "./adminApi";
import { getUserToken } from "../utils/authStorage";

export const getMyConversation = async () => {
  const response = await API.get("/chat/me", { skipLoader: true });
  return response.data;
};

export const getAdminConversations = async () => {
  const response = await adminAPI.get("/chat/admin/conversations");
  return response.data;
};

export const getAdminConversation = async (conversationId) => {
  const response = await adminAPI.get(`/chat/admin/conversation/${conversationId}`);
  return response.data;
};

export const claimAdminConversation = async (conversationId) => {
  const response = await adminAPI.post(`/chat/admin/conversation/${conversationId}/claim`);
  return response.data;
};

export const uploadChatAttachment = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await API.post("/chat/upload", formData, { skipLoader: true });
  return response.data.attachment;
};

export function createChatSocket(role = "user") {
  const token = role === "admin" ? sessionStorage.getItem("adminToken") : getUserToken();

  if (!token) {
    return null;
  }

  return io(API_BASE_URL, {
    transports: ["websocket"],
    autoConnect: true,
    withCredentials: true,
    auth: {
      token,
      role,
    },
  });
}
