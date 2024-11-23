import { ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import { useErrorStore } from '@/stores/error';

export const useProfileStore = defineStore('profile', () => {
  const storeError = useErrorStore();
  
  const userProfile = ref(null);
  const loading = ref(false);
  const error = ref(null);
    
  const fetchProfile = async () => {
    loading.value = true;
    error.value = null;
  
    // First check for token in sessionStorage
    const token = sessionStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      error.value = 'Unauthorized: No token found';
      loading.value = false;
      return;
    }
  
    try {
      const response = await axios.get('/users/me');
      userProfile.value = response.data.data;
    } catch (err) {
      
      if (err.response?.status === 401) {
        try {
          const refreshedToken = await refreshAuthToken();
          if (refreshedToken) {
            axios.defaults.headers.common.Authorization = `Bearer ${refreshedToken}`;

            const retryResponse = await axios.get('/users/me');
            userProfile.value = retryResponse.data.data;
          } else {
            error.value = 'Failed to refresh token. Please log in again.';
          }
        } catch (e) {
          error.value = 'Error refreshing token. Please log in again.';
          storeError.setErrorMessages(
            err.response?.data?.message,
            err.response?.data?.errors,
            err.response?.status,
            'Profile Fetch Error'
          );
        }
      } else {
        error.value = 'Failed to load user profile.';
      }
      console.error('Error fetching profile:', err);
    } finally {
      loading.value = false;
    }
  };
  
  // Function to refresh the token
  const refreshAuthToken = async () => {
    try {
      const response = await axios.post('/auth/refreshtoken');
      const newToken = response.data.token;
      sessionStorage.setItem('token', newToken); // Update token in sessionStorage
      return newToken;
    } catch (err) {
      console.error('Error refreshing token:', err);
      return null;
    }
  };

  return {
    userProfile,
    loading,
    error,
    fetchProfile,
  };
});
