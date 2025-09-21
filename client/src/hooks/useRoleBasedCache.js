// hooks/useRoleBasedCache.js
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const roleBasedCache = new Map();

const useRoleBasedCache = (key, apiCall, options = {}) => {
  const { role, user } = useSelector(state => state.auth);
  const { 
    cacheTime = 300000, // 5 minutes
    staleTime = 60000,  // 1 minute
    refetchOnMount = false 
  } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortController = useRef(null);

  // Create role-specific cache key
  const cacheKey = `${role}-${user?.id}-${key}`;

  useEffect(() => {
    const fetchData = async () => {
      // Check role-based cache first
      const cached = roleBasedCache.get(cacheKey);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < staleTime) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      try {
        abortController.current = new AbortController();
        setLoading(true);
        setError(null);
        
        const result = await apiCall({ signal: abortController.current.signal });
        
        // Cache the result with role-specific key
        roleBasedCache.set(cacheKey, {
          data: result,
          timestamp: now
        });
        
        setData(result);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [cacheKey, apiCall, staleTime]);

  useEffect(() => {
    return () => {
      
      for (const [key] of roleBasedCache.entries()) {
        if (key.startsWith(`${role}-${user?.id}`)) {
          roleBasedCache.delete(key);
        }
      }
    };
  }, [role, user?.id]);

  return { data, loading, error };
};

export default useRoleBasedCache;