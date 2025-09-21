// services/api/userApi.js
import { adminApiClient, userApiClient, apiClient } from "./client";
import { BASEURL as BASE_URL } from "../../baseurl";
// Base URL for user-related endpoints

export const userApi = {
  // User Management
  getAllUsers: (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    return adminApiClient.get(`${BASE_URL}/users?${params}`);
  },

  getAllNonUsers: () => adminApiClient.get(`${BASE_URL}/users/non/users`),

  getUser: (id) => adminApiClient.get(`${BASE_URL}/users/${id}`),

  getUserByEmail: (email) =>
    adminApiClient.get(`${BASE_URL}/users?email=${encodeURIComponent(email)}`),

  createUser: (userData) => adminApiClient.post(`${BASE_URL}/users`, userData),

  updateUser: (id, userData) =>
    apiClient.put(`${BASE_URL}/users/${id}`, userData),

  deleteUser: (id) => adminApiClient.delete(`${BASE_URL}/users/${id}`),

  // Bulk operations
  bulkUpdateUsers: (userIds, updateData) =>
    adminApiClient.put(`${BASE_URL}/users/bulk`, { userIds, updateData }),

  bulkDeleteUsers: (userIds) =>
    adminApiClient.delete(`${BASE_URL}/users/bulk`, { data: { userIds } }),

  exportUsers: (format = "csv", filters = {}) =>
    adminApiClient.get(`${BASE_URL}/users/export?format=${format}`, {
      params: filters,
      responseType: "blob",
    }),

  // Profile Management
  getProfile: () => userApiClient.get(`${BASE_URL}/users/me`),
  selfRoiProcess: () => userApiClient.get(`${BASE_URL}/users/self-roi`),

  updateProfile: (profileData) =>
    userApiClient.put(`${BASE_URL}/users/profile/update`, profileData),

  uploadProfileImage: (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    return userApiClient.post(`${BASE_URL}/user/profile/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteProfileImage: () =>
    userApiClient.delete(`${BASE_URL}/user/profile/image`),

  // Income Data
  getIncomeStats: (period = "all") =>
    adminApiClient.get(`${BASE_URL}/user/income/stats?period=${period}`),

  getIncomeHistory: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: "1",
      limit: "50",
      ...params,
    });
    return apiClient.get(`${BASE_URL}/user/income/history?${queryParams}`);
  },

  getIncomeBreakdown: (startDate, endDate) =>
    userApiClient.get(`${BASE_URL}/user/income/breakdown`, {
      params: { startDate, endDate },
    }),

  downloadIncomeReport: (format = "pdf", period = "monthly") =>
    apiClient.get(`${BASE_URL}/user/income/report`, {
      params: { format, period },
      responseType: "blob",
    }),

  // Network Data
  getNetworkTree: (depth = 3) =>
    apiClient.get(`${BASE_URL}/user/network/tree?depth=${depth}`),

  getNetworkStats: () => apiClient.get(`${BASE_URL}/user/network/stats`),

  getReferrals: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: "1",
      limit: "20",
      status: "all",
      ...params,
    });
    return apiClient.get(`${BASE_URL}/user/referrals?${queryParams}`);
  },

  getDownlineUsers: (level = 1, limit = 50) =>
    apiClient.get(`${BASE_URL}/user/network/downline`, {
      params: { level, limit },
    }),

  // Referral System
  generateReferralLink: (campaign = "default") =>
    apiClient.post(`${BASE_URL}/user/referral/generate`, { campaign }),

  getReferralStats: (period = "30d") =>
    apiClient.get(`${BASE_URL}/user/referral/stats?period=${period}`),

  getReferralCommissions: (params = {}) =>
    apiClient.get(`${BASE_URL}/user/referral/commissions`, { params }),

  updateReferralSettings: (settings) =>
    apiClient.put(`${BASE_URL}/user/referral/settings`, settings),

  // Rewards System
  getAllRewards: (status = "all") =>
    apiClient.get(`${BASE_URL}/users/rewards?status=${status}`),

  getUserRewards: (userId, params = {}) =>
    apiClient.get(`${BASE_URL}/users/${userId}/rewards`, { params }),

  createReward: (rewardData) =>
    adminApiClient.post(`${BASE_URL}/users/rewards`, rewardData),

  updateReward: (rewardId, rewardData) =>
    apiClient.put(`${BASE_URL}/users/rewards/${rewardId}`, rewardData),

  deleteReward: (rewardId) =>
    apiClient.delete(`${BASE_URL}/users/rewards/${rewardId}`),

  claimReward: (rewardId) =>
    apiClient.post(`${BASE_URL}/user/rewards/${rewardId}/claim`),

  // Notifications System
  sendRewardNotification: (notificationData) =>
    adminApiClient.post(`${BASE_URL}/users/send/reward`, notificationData),

  getDefaulterNotification: (id) =>
    apiClient.get(`${BASE_URL}/users/get/defaulterreward/${id}`),

  sendBulkNotification: (notificationData) =>
    adminApiClient.post(
      `${BASE_URL}/users/notifications/bulk`,
      notificationData
    ),

  getUserNotifications: (userId, params = {}) =>
    apiClient.get(`${BASE_URL}/users/${userId}/notifications`, { params }),

  markNotificationAsRead: (notificationId) =>
    apiClient.put(`${BASE_URL}/notifications/${notificationId}/read`),

  deleteNotification: (notificationId) =>
    adminApiClient.delete(`${BASE_URL}/notifications/${notificationId}`),

  // Authentication & Security
  changePassword: (currentPassword, newPassword) =>
    apiClient.put(`${BASE_URL}/user/password`, {
      currentPassword,
      newPassword,
    }),

  enableTwoFactor: () => apiClient.post(`${BASE_URL}/user/2fa/enable`),

  disableTwoFactor: (code) =>
    apiClient.post(`${BASE_URL}/user/2fa/disable`, { code }),

  verifyTwoFactor: (code) =>
    apiClient.post(`${BASE_URL}/user/2fa/verify`, { code }),

  investMoney: (data) =>
    apiClient.post(`${BASE_URL}/investments`, data),

  userInvestments: () =>
    apiClient.get(`${BASE_URL}/investments/user/me`),

  getSecuritySettings: () => adminApiClient.get(`${BASE_URL}/user/security`),

  updateSecuritySettings: (settings) =>
    apiClient.put(`${BASE_URL}/user/security`, settings),

  // Account Management
  deactivateAccount: (reason) =>
    adminApiClient.put(`${BASE_URL}/user/deactivate`, { reason }),

  reactivateAccount: () => adminApiClient.put(`${BASE_URL}/user/reactivate`),

  deleteAccount: (password, reason) =>
    apiClient.delete(`${BASE_URL}/user/account`, {
      data: { password, reason },
    }),

  // Wallet & Transactions
  addWalletBalance: (userId, data) =>
    apiClient.post(`${BASE_URL}/wallet/admin/user/${userId}/add-balance`, data, {
      headers: {
        "X-Admin-Request": "true",
      },
    }),
  deductWalletBalance: (userId, data) =>
    apiClient.post(`${BASE_URL}/wallet/admin/user/${userId}/deduct-balance`, data, {
      headers: {
        "X-Admin-Request": "true",
      },
    }),
  getUserWallet: () => apiClient.get(`${BASE_URL}/wallet/user`),

  getTransactionHistory: (params = {}) =>
    apiClient.get(`${BASE_URL}/user/wallet/transactions`, { params }),

  createWithdrawalRequest: (amount, method, details) =>
    apiClient.post(`${BASE_URL}/user/wallet/withdraw`, {
      amount,
      method,
      details,
    }),

  getWithdrawalHistory: (params = {}) =>
    apiClient.get(`${BASE_URL}/user/wallet/withdrawals`, { params }),

  cancelWithdrawal: (withdrawalId) =>
    apiClient.put(`${BASE_URL}/user/wallet/withdrawals/${withdrawalId}/cancel`),

  // KYC & Verification
  submitKYCDocuments: (documents) => {
    const formData = new FormData();
    Object.keys(documents).forEach((key) => {
      formData.append(key, documents[key]);
    });
    return apiClient.post(`${BASE_URL}/user/kyc/submit`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getKYCStatus: () => apiClient.get(`${BASE_URL}/user/kyc/status`),

  updateKYCInfo: (kycData) =>
    apiClient.put(`${BASE_URL}/user/kyc/update`, kycData),

  // Analytics & Reports
  getUserAnalytics: (period = "30d") =>
    apiClient.get(`${BASE_URL}/user/analytics?period=${period}`),

  getPerformanceMetrics: (startDate, endDate) =>
    apiClient.get(`${BASE_URL}/user/performance`, {
      params: { startDate, endDate },
    }),

  generateCustomReport: (reportConfig) =>
    apiClient.post(`${BASE_URL}/user/reports/custom`, reportConfig),

  downloadReport: (reportId) =>
    apiClient.get(`${BASE_URL}/user/reports/${reportId}/download`, {
      responseType: "blob",
    }),

  // Support & Help
  createSupportTicket: (ticketData) =>
    apiClient.post(`${BASE_URL}/user/support/tickets`, ticketData),

  getSupportTickets: (params = {}) =>
    apiClient.get(`${BASE_URL}/user/support/tickets`, { params }),

  updateSupportTicket: (ticketId, update) =>
    apiClient.put(`${BASE_URL}/user/support/tickets/${ticketId}`, update),

  closeSupportTicket: (ticketId) =>
    apiClient.put(`${BASE_URL}/user/support/tickets/${ticketId}/close`),

  // Communication Preferences
  getCommunicationPreferences: () =>
    apiClient.get(`${BASE_URL}/user/preferences/communication`),

  updateCommunicationPreferences: (preferences) =>
    apiClient.put(`${BASE_URL}/user/preferences/communication`, preferences),

  subscribeToNewsletter: (email) =>
    apiClient.post(`${BASE_URL}/user/newsletter/subscribe`, { email }),

  unsubscribeFromNewsletter: (token) =>
    apiClient.post(`${BASE_URL}/user/newsletter/unsubscribe`, { token }),

  // Activity Logs
  getActivityLogs: (params = {}) =>
    apiClient.get(`${BASE_URL}/user/activity/logs`, { params }),

  getLoginHistory: (limit = 50) =>
    apiClient.get(`${BASE_URL}/user/activity/logins?limit=${limit}`),

  // Admin Functions (if user has admin privileges)
  getAllUsersAdmin: (params = {}) =>
    
    adminApiClient.get(`${BASE_URL}/users`, {
      params,
      headers: {
        "X-Admin-Request": "true",
      },
    }),

  getUserDetailsAdmin: (userId) =>
    adminApiClient.get(`${BASE_URL}/users/${userId}`, {
      headers: {
        "X-Admin-Request": "true",
      },
    }),

  updateUserAdmin: (userId, userData) =>
    adminApiClient.put(`${BASE_URL}/users/${userId}`, userData),

  suspendUser: (userId, reason, duration) =>
    adminApiClient.put(`${BASE_URL}/users/${userId}/suspend`, {
      reason,
      duration,
    }),

  unsuspendUser: (userId) =>
    adminApiClient.put(`${BASE_URL}/admin/users/${userId}/unsuspend`),

  impersonateUser: (userId) =>
    adminApiClient.post(`${BASE_URL}/admin/users/${userId}/impersonate`),

  // System Settings
  getSystemSettings: () => apiClient.get(`${BASE_URL}/admin/settings`),

  updateSystemSettings: (settings) =>
    apiClient.put(`${BASE_URL}/admin/settings`, settings),

  // Cache Management
  clearUserCache: (userId) =>
    apiClient.delete(`${BASE_URL}/admin/cache/user/${userId}`),

  clearAllCache: () => apiClient.delete(`${BASE_URL}/admin/cache/all`),

  // Utility Functions
  searchUsers: (query, filters = {}) =>
    adminApiClient.get(`${BASE_URL}/users/search`, {
      params: { q: query, ...filters },
    }),

  validateEmail: (email) =>
    apiClient.post(`${BASE_URL}/users/validate/email`, { email }),

  checkUsernameAvailability: (username) =>
    apiClient.get(`${BASE_URL}/users/check/username/${username}`),

  uploadFile: (file, type = "document") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    return apiClient.post(`${BASE_URL}/user/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteFile: (fileId) =>
    adminApiClient.delete(`${BASE_URL}/user/files/${fileId}`),

  // Rate Limiting Helper
  checkRateLimit: (endpoint) =>
    adminApiClient.get(`${BASE_URL}/rate-limit/check/${endpoint}`),

  // Health Check
  healthCheck: () => apiClient.get(`${BASE_URL}/health`),

  // API Version
  getApiVersion: () => apiClient.get(`${BASE_URL}/version`),
};

// Export specialized API modules for better organization
export const profileApi = {
  get: userApi.getProfile,
  update: userApi.updateProfile,
  uploadImage: userApi.uploadProfileImage,
  deleteImage: userApi.deleteProfileImage,
};

export const incomeApi = {
  getStats: userApi.getIncomeStats,
  getHistory: userApi.getIncomeHistory,
  getBreakdown: userApi.getIncomeBreakdown,
  downloadReport: userApi.downloadIncomeReport,
  selfRoiProcess: userApi.selfRoiProcess,
};

export const networkApi = {
  getTree: userApi.getNetworkTree,
  getStats: userApi.getNetworkStats,
  getReferrals: userApi.getReferrals,
  getDownline: userApi.getDownlineUsers,
};

export const referralApi = {
  generateLink: userApi.generateReferralLink,
  getStats: userApi.getReferralStats,
  getCommissions: userApi.getReferralCommissions,
  updateSettings: userApi.updateReferralSettings,
};

export const rewardsApi = {
  getAll: userApi.getAllRewards,
  getUserRewards: userApi.getUserRewards,
  create: userApi.createReward,
  update: userApi.updateReward,
  delete: userApi.deleteReward,
  claim: userApi.claimReward,
};

export const notificationApi = {
  sendReward: userApi.sendRewardNotification,
  getDefaulter: userApi.getDefaulterNotification,
  sendBulk: userApi.sendBulkNotification,
  getUser: userApi.getUserNotifications,
  markRead: userApi.markNotificationAsRead,
  delete: userApi.deleteNotification,
};

export const walletApi = {
  addWalletBalance: userApi.addWalletBalance,
  getUserWallet: userApi.getUserWallet,
  deductWalletBalance: userApi.deductWalletBalance,
  getTransactions: userApi.getTransactionHistory,
  withdraw: userApi.createWithdrawalRequest,
  getWithdrawals: userApi.getWithdrawalHistory,
  cancelWithdrawal: userApi.cancelWithdrawal,
  
};

export const securityApi = {
  changePassword: userApi.changePassword,
  enable2FA: userApi.enableTwoFactor,
  disable2FA: userApi.disableTwoFactor,
  verify2FA: userApi.verifyTwoFactor,
  getSettings: userApi.getSecuritySettings,
  updateSettings: userApi.updateSecuritySettings,
};

export const adminApi = {
  getAllUsers: userApi.getAllUsersAdmin,
  getUserDetails: userApi.getUserDetailsAdmin,
  updateUser: userApi.updateUserAdmin,
  suspendUser: userApi.suspendUser,
  unsuspendUser: userApi.unsuspendUser,
  impersonate: userApi.impersonateUser,
  getSettings: userApi.getSystemSettings,
  updateSettings: userApi.updateSystemSettings,
  clearUserCache: userApi.clearUserCache,
  clearAllCache: userApi.clearAllCache,
};

// Export default userApi
export default userApi;
