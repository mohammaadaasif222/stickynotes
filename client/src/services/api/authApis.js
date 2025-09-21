// services/api/userApi.js
import { apiClient } from "./client";

export const authApi = {
  // Profile Management
  login: (data) => apiClient.post("/auth/login", data),

adminLoginAsUser: (data) =>
  apiClient.post("/auth/admin/login",{preferAdmin:true ,...data}),

  signup: (data) => apiClient.post("/auth/signup", data),

  forgot: (data) => apiClient.post("/auth/forgot-password", data),
};
