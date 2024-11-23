<script setup>
import { onMounted } from 'vue';
import { useProfileStore } from '@/stores/profile';
import { useAuthStore } from '@/stores/auth'; // Import the auth store for logout

const profileStore = useProfileStore();
const authStore = useAuthStore();
const apiDomain = import.meta.env.VITE_API_DOMAIN;

onMounted(() => {
  profileStore.fetchProfile();
});

const handleLogout = async () => {
  const success = await authStore.logout();
  if (success) {
    window.location.href = '/testers/laravel'; 
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto py-10 px-6 space-y-8">
    <!-- Loading and error states -->
    <div v-if="profileStore.loading" class="text-center text-gray-600 animate-pulse">
      <span class="text-xl font-medium">Loading profile...</span>
    </div>

    <div v-if="profileStore.error" class="text-center text-red-600">
      <span class="text-xl font-medium">Error: {{ profileStore.error }}</span>
    </div>

    <!-- Profile data -->
    <div v-else-if="profileStore.userProfile" class="space-y-6">
      <div class="text-center">
        <!-- Profile Picture -->    
        <img
          :src="`http://${apiDomain}/storage/photos/${profileStore.userProfile.photo_filename}`"
          alt="User Profile Picture"
          class="w-60 h-60 rounded-full mx-auto border-4 border-gray-400 shadow-xl"
        />
      </div>

      <!-- User Name and Nickname -->
      <div class="text-center">
        <h2 class="text-3xl font-semibold text-gray-800">{{ profileStore.userProfile.name }}</h2>
      </div>

      <!-- Brain Coins and Type -->
      <div class="bg-gray-100 p-6 rounded-xl shadow-md space-y-4">
        <p class="text-xl font-bold text-yellow-600">
            Brain Coins Balance: 
            <span class="text-xl text-yellow-500">
            {{ profileStore.userProfile.brain_coins_balance }}
            </span>
        </p>
        
        <!-- Account Type with bold font -->
        <p class="text-lg text-gray-500">
            <span class="font-bold">Account Type:</span>
            <span class="font-medium text-black">
            {{ profileStore.userProfile.type === 'P' ? ' Player' : (profileStore.userProfile.type === 'A' ? ' Administrator' : 'Unknown') }}
            </span>
        </p>
        
        <!-- User Name with bold font -->
        <p class="font-medium text-black"> <span class="text-lg text-gray-500 mt-2 font-bold">User Name:</span>  {{ profileStore.userProfile.nickname }}</p>
        </div>

      <div class="text-center mt-8">
        <button
          @click="handleLogout"
          class="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-200"
        >
          Log Out
        </button>
      </div>
    </div>
  </div>
</template>
