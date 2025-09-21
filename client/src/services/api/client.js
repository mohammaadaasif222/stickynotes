// services/api/client.js
import axios from "axios";
import { BASEURL } from "../../baseurl";

// Lazy store import using dynamic imports to avoid circular dependency
let store = null;
const getStore = async () => {
  if (!store) {
    const storeModule = await import("../../store");
    store = storeModule.store;
  }
  return store;
};

// Lazy import of auth actions using dynamic imports
let authActions = null;
const getAuthActions = async () => {
  if (!authActions) {
    authActions = await import("../../store/slices/authSlice");
  }
  return authActions;
};

// Helper function to get auth data from the enhanced state structure
const getAuthData = (state, preferAdmin = false) => {
  const authState = state.auth;
  
  if (!authState) return { token: null, role: null, isAdmin: false };
  
  // Determine if we should use admin or user token
  const useAdmin = preferAdmin || 
                   (authState.isAdminAuthenticated && !authState.isAuthenticated) ||
                   (authState.isAdminAuthenticated && window.location.pathname.includes('/admin'));
  
  let token, role, userData;
  
  if (useAdmin && authState.isAdminAuthenticated) {
    token = authState.adminToken;
    userData = authState.admin;
    role = userData?.role || 'admin';
  } else if (authState.isAuthenticated) {
    token = authState.userToken;
    userData = authState.user;
    role = userData?.role || 'user';
  } else {
    token = null;
    role = null;
    userData = null;
  }
  
  return { 
    token, 
    role, 
    isAdmin: useAdmin,
    userData 
  };
};

// Enhanced API client factory
const createApiClient = (baseURL, options = {}) => {
  const client = axios.create({
    baseURL,
    timeout: options.timeout || 15000,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    async (config) => {
      try {
        const currentStore = await getStore();
        const state = currentStore.getState();
        
        // Check if this request is specifically for admin routes
        const isAdminRequest = config.url?.includes('/admin') || 
                              config.headers?.['X-Admin-Request'] === 'true' ||
                              options.preferAdmin;
        
        const { token, role, isAdmin } = getAuthData(state, isAdminRequest);

        // Add Authorization header if token exists
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add role-specific headers
        if (role) {
          config.headers["X-User-Role"] = role;
        }
        
        // Add admin flag header
        if (isAdmin) {
          config.headers["X-Admin-Request"] = "true";
        }

        // Add timestamp for cache busting if needed
        if (config.method === 'get' && options.cacheBusting) {
          config.params = {
            ...config.params,
            _t: Date.now()
          };
        }

        return config;
      } catch (error) {
        console.warn('Request interceptor error:', error);
        return config;
      }
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      try {
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const currentStore = await getStore();
          const { resetAuth, resetUserAuth, resetAdminAuth } = await getAuthActions();
          
          // Check if this was an admin request
          const wasAdminRequest = originalRequest.headers?.['X-Admin-Request'] === 'true';
          
          if (wasAdminRequest) {
            // Only clear admin auth for admin requests
            currentStore.dispatch(resetAdminAuth());
            
            // Redirect to admin login if on admin routes
            if (window.location.pathname.includes('/admin')) {
              window.location.href = '/admin-login';
            }
          } else {
            // Clear user auth for regular requests
            currentStore.dispatch(resetUserAuth());
            
            // Redirect to user login
            if (!window.location.pathname.includes('/admin') && 
                window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        } else if (error.response?.status === 403) {
          // Forbidden - redirect to appropriate unauthorized page
          const isAdminRoute = window.location.pathname.includes('/admin');
          const unauthorizedPath = isAdminRoute ? '/admin/unauthorized' : '/unauthorized';
          
          // if (window.location.pathname !== unauthorizedPath) {
          //   window.location.href = unauthorizedPath;
          // }
        } else if (error.response?.status === 500) {
          console.error('Server error:', error.response.data);
        }
      } catch (interceptorError) {
        console.error('Response interceptor error:', interceptorError);
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

// Create default API client
export const apiClient = createApiClient(BASEURL);

// Create admin-specific API client
export const adminApiClient = createApiClient(BASEURL, { 
  preferAdmin: true,
  headers: {
    'X-Admin-Request': 'true'
  }
});

// Create user-specific API client  
export const userApiClient = createApiClient(BASEURL, {
  preferAdmin: false
});

export default apiClient;