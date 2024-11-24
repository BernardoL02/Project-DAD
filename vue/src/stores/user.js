// In your user store (useUserStore.js)
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  const userProfile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed properties for user data
  const name = computed(() => userProfile.value ? userProfile.value.name : '')
  const email = computed(() => userProfile.value ? userProfile.value.email : '')
  const nickname = computed(() => userProfile.value ? userProfile.value.nickname : '')

  // Registration function
  const register = async (formData) => {
    loading.value = true;
    error.value = null;

    try {
        const response = await axios.post('/users', formData);
        userProfile.value = response.data.data; 
        return response.data;
    } catch (err) {
        error.value = 'Registration failed. Please try again.';
        console.error('Registration error:', err);
        throw err; 
    } finally {
        loading.value = false;
    }
};

  return {
    userProfile,
    loading,
    error,
    register,
    name,
    email,
    nickname,
  }
})
