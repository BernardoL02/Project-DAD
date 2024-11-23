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
    
    try {
      const response = await axios.get('/users/me');
      userProfile.value = response.data.data;
    } catch (err) {
      
      if (err.response?.status === 401) {
        try {
          
          const retryResponse = await axios.get('/users/me');
          userProfile.value = retryResponse.data.data;

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
  


  return {
    userProfile,
    loading,
    error,
    fetchProfile,
  };
});
