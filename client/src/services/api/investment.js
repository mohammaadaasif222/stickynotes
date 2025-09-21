// services/api/investmentService.js
import { BASEURL } from '../../baseurl';
import { apiClient, adminApiClient, userApiClient } from './client';

class InvestmentService {
  // Base endpoint
  static BASE_PATH = BASEURL

  // Helper method to build query string
  static buildQueryString(params) {
    if (!params || Object.keys(params).length === 0) return '';
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    return searchParams.toString() ? `?${searchParams.toString()}` : '';
  }

  // Helper method to handle API responses
static async handleResponse(apiCall) {
  try {
    const response = await apiCall;
    console.log("API Success", response);
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    console.error("API Error", error);
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";

    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
}


  // User Investment Methods
  static async createInvestment(investmentData) {
    console.log(investmentData)
    return userApiClient.post(this.BASE_PATH, investmentData)
    ;
  }

  static async getUserInvestments(params = {}) {
    const queryString = this.buildQueryString(params);
    return this.handleResponse(
      userApiClient.get(`${this.BASE_PATH}/user/me${queryString}`)
    );
  }

  static async getInvestmentById(id, isAdminRequest = false) {
    const client = isAdminRequest ? adminApiClient : userApiClient;
    return this.handleResponse(
      client.get(`${this.BASE_PATH}/${id}`)
    );
  }

  static async updateInvestmentStatus(id, status, isAdminRequest = false) {
    const client = isAdminRequest ? adminApiClient : userApiClient;
    return this.handleResponse(
      client.patch(`${this.BASE_PATH}/${id}/status`, { status })
    );
  }

  static async updateInvestmentROI(id, roiData, isAdminRequest = false) {
    const client = isAdminRequest ? adminApiClient : userApiClient;
    return this.handleResponse(
      client.patch(`${this.BASE_PATH}/${id}/roi`, roiData)
    );
  }

  // Admin Investment Methods
  static async getAllInvestments(params = {}) {
    const queryString = this.buildQueryString(params);
    return this.handleResponse(
      adminApiClient.get(`${this.BASE_PATH}${queryString}`)
    );
  }

  static async getInvestmentStats(params = {}) {
    const queryString = this.buildQueryString(params);
    return this.handleResponse(
      adminApiClient.get(`${this.BASE_PATH}/stats${queryString}`)
    );
  }

  static async getDueForROI(params = {}) {
    const queryString = this.buildQueryString(params);
    return this.handleResponse(
      adminApiClient.get(`${this.BASE_PATH}/due-roi${queryString}`)
    );
  }

  static async updateInvestment(id, data) {
    return this.handleResponse(
      adminApiClient.put(`${this.BASE_PATH}/${id}`, data)
    );
  }

  static async deleteInvestment(id) {
    return this.handleResponse(
      adminApiClient.delete(`${this.BASE_PATH}/${id}`)
    );
  }

  static async getInvestmentsByUserId(userId, params = {}) {
    const queryString = this.buildQueryString(params);
    return this.handleResponse(
      adminApiClient.get(`${this.BASE_PATH}/user/${userId}${queryString}`)
    );
  }

  // Bulk Operations (Admin)
  static async bulkUpdateStatus(investmentIds, status) {
    const promises = investmentIds.map(id => 
      this.updateInvestmentStatus(id, status, true)
    );
    
    try {
      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      return {
        success: failed.length === 0,
        successful: successful.length,
        failed: failed.length,
        results,
        errors: failed.map(f => f.error)
      };
    } catch (error) {
      return {
        success: false,
        error: 'Bulk operation failed',
        details: error.message
      };
    }
  }

  static async bulkDelete(investmentIds) {
    const promises = investmentIds.map(id => this.deleteInvestment(id));
    
    try {
      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      return {
        success: failed.length === 0,
        successful: successful.length,
        failed: failed.length,
        results,
        errors: failed.map(f => f.error)
      };
    } catch (error) {
      return {
        success: false,
        error: 'Bulk delete operation failed',
        details: error.message
      };
    }
  }

  static async bulkUpdateROI(roiUpdates) {
    // roiUpdates should be an array of { id, roiData }
    const promises = roiUpdates.map(({ id, roiData }) => 
      this.updateInvestmentROI(id, roiData, true)
    );
    
    try {
      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      return {
        success: failed.length === 0,
        successful: successful.length,
        failed: failed.length,
        results,
        errors: failed.map(f => f.error)
      };
    } catch (error) {
      return {
        success: false,
        error: 'Bulk ROI update operation failed',
        details: error.message
      };
    }
  }

  // Advanced Query Methods
  static async getInvestmentsByDateRange(startDate, endDate, params = {}) {
    const queryParams = {
      ...params,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    
    return this.getAllInvestments(queryParams);
  }

  static async getInvestmentsByStatus(status, params = {}) {
    return this.getAllInvestments({ ...params, status });
  }

  static async getInvestmentsByAmountRange(minAmount, maxAmount, params = {}) {
    const queryParams = {
      ...params,
      minAmount,
      maxAmount
    };
    
    return this.getAllInvestments(queryParams);
  }

  static async searchInvestments(searchTerm, searchFields = ['user.name', 'user.email'], params = {}) {
    const queryParams = {
      ...params,
      search: searchTerm,
      searchFields: searchFields.join(',')
    };
    
    return this.getAllInvestments(queryParams);
  }

  // Analytics Methods
  static async getInvestmentAnalytics(params = {}) {
    const queryString = this.buildQueryString(params);
    return this.handleResponse(
      adminApiClient.get(`${this.BASE_PATH}/analytics${queryString}`)
    );
  }

  static async getMonthlyInvestmentTrend(months = 12) {
    return this.handleResponse(
      adminApiClient.get(`${this.BASE_PATH}/analytics/trend?months=${months}`)
    );
  }

  static async getTopInvestors(limit = 10) {
    return this.handleResponse(
      adminApiClient.get(`${this.BASE_PATH}/analytics/top-investors?limit=${limit}`)
    );
  }

  static async getInvestmentGrowthRate(period = 'monthly') {
    return this.handleResponse(
      adminApiClient.get(`${this.BASE_PATH}/analytics/growth-rate?period=${period}`)
    );
  }

  // Export/Import Methods
  static async exportInvestments(format = 'csv', params = {}) {
    const queryParams = { ...params, format };
    const queryString = this.buildQueryString(queryParams);
    
    try {
      const response = await adminApiClient.get(
        `${this.BASE_PATH}/export${queryString}`,
        { responseType: 'blob' }
      );
      
      return {
        success: true,
        data: response.data,
        filename: response.headers['content-disposition']?.split('filename=')[1] || `investments.${format}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Export failed'
      };
    }
  }

  static async importInvestments(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    return this.handleResponse(
      adminApiClient.post(`${this.BASE_PATH}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    );
  }

  // Validation Methods
  static async validateInvestmentData(investmentData) {
    return this.handleResponse(
      apiClient.post(`${this.BASE_PATH}/validate`, investmentData)
    );
  }

  static async checkInvestmentEligibility(userId, amount) {
    return this.handleResponse(
      apiClient.post(`${this.BASE_PATH}/check-eligibility`, { userId, amount })
    );
  }

  // Notification Methods
  static async getInvestmentNotifications(params = {}) {
    const queryString = this.buildQueryString(params);
    return this.handleResponse(
      apiClient.get(`${this.BASE_PATH}/notifications${queryString}`)
    );
  }

  static async markNotificationRead(notificationId) {
    return this.handleResponse(
      apiClient.patch(`${this.BASE_PATH}/notifications/${notificationId}/read`)
    );
  }

  // Utility Methods
  static calculateROI(principal, rate, time) {
    const roi = (principal * rate * time) / 100;
    const totalAmount = principal + roi;
    
    return {
      principal,
      rate,
      time,
      roi,
      totalAmount,
      percentage: ((roi / principal) * 100).toFixed(2)
    };
  }

  static formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  static getInvestmentStatusColor(status) {
    const statusColors = {
      pending: '#fbbf24',      // yellow
      approved: '#10b981',     // green
      rejected: '#ef4444',     // red
      completed: '#8b5cf6',    // purple
      cancelled: '#6b7280',    // gray
      processing: '#3b82f6'    // blue
    };
    
    return statusColors[status] || '#6b7280';
  }

  static getInvestmentStatusText(status) {
    const statusTexts = {
      pending: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
      cancelled: 'Cancelled',
      processing: 'Processing'
    };
    
    return statusTexts[status] || 'Unknown';
  }

  // Cache Methods (if you want to implement client-side caching)
  static _cache = new Map();
  static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async getCachedData(key, fetcher, duration = this.CACHE_DURATION) {
    const cached = this._cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < duration) {
      return cached.data;
    }
    
    const data = await fetcher();
    this._cache.set(key, {
      data,
      timestamp: now
    });
    
    return data;
  }

  static clearCache(key) {
    if (key) {
      this._cache.delete(key);
    } else {
      this._cache.clear();
    }
  }

  // Real-time Methods (if you have WebSocket support)
  static subscribeToInvestmentUpdates(callback) {
    // Implementation would depend on your WebSocket setup
    // This is a placeholder for real-time functionality
    console.log('Investment updates subscription not implemented yet');
  }

  static unsubscribeFromInvestmentUpdates() {
    // Implementation would depend on your WebSocket setup
    console.log('Investment updates unsubscription not implemented yet');
  }
}

export default InvestmentService;

// Named exports for specific functionalities
export const {
  createInvestment,
  getAllInvestments, 
  getInvestmentById,
  updateInvestment,
  deleteInvestment,
  getUserInvestments,
  getInvestmentsByUserId,
  updateInvestmentStatus,
  updateInvestmentROI,
  getInvestmentStats,
  getDueForROI,
  bulkUpdateStatus,
  bulkDelete,
  exportInvestments,
  importInvestments,
  calculateROI,
  formatCurrency
} = InvestmentService;