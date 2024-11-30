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

const updateUserProfile = async (updatedData) => {
  loading.value = true;
  error.value = null;

  if (!userProfile.value) {
    throw new Error('User profile is not loaded yet');
  }

  // Prepare data to send: only include fields that are changed
  const dataToSend = {};

  // Check if each field has changed, and only include the changed ones
  if (updatedData.name !== userProfile.value.name) {
    dataToSend.name = updatedData.name;
  }
  if (updatedData.email !== userProfile.value.email) {
    dataToSend.email = updatedData.email;
  }
  if (updatedData.nickname !== userProfile.value.nickname) {
    dataToSend.nickname = updatedData.nickname;
  }
  if (updatedData.photo) {
    dataToSend.photo_filename = updatedData.photo;
  }

  try {
    const response = await axios.put('/users/me', dataToSend); // Update the user with only the changed data
    userProfile.value = response.data.data; // Update user profile in store
    return response.data;
  } catch (err) {
    error.value = 'Failed to update profile. Please try again.';
    console.error('Profile update error:', err);
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
    updateUserProfile,
  }
})
