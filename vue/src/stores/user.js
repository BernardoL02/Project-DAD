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
        const response = await axios.post('/api/users', formData); // Assuming this is your API endpoint
        userProfile.value = response.data.data; // Assuming the response contains the user data
        return response.data;
    } catch (err) {
        error.value = 'Registration failed. Please try again.';
        console.error('Registration error:', err);
        throw err; // Ensure the error is thrown so the frontend can handle it
    } finally {
        loading.value = false;
    }
};

  // Return store methods and properties
  return {
    userProfile,
    loading,
    error,
    register, // Ensure this is returned
    name,
    email,
    nickname,
  }
})
