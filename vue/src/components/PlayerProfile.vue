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
        <img :src="`http://${apiDomain}/storage/photos/${profileStore.userProfile.photo_filename}`"
          alt="User Profile Picture"
          class="w-60 h-60 rounded-full mx-auto border-4 border-white shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl" />
      </div>

      <!-- User Name and Nickname -->
      <div class="text-center">
        <h2 class="text-3xl font-semibold text-gray-800">{{ profileStore.userProfile.name }}</h2>
      </div>

      <!-- Brain Coins and Type -->
      <div class="bg-white p-6 rounded-xl shadow-lg space-y-6">

        <!-- User Name Section -->
        <div class="bg-white p-5 rounded-lg shadow-md flex items-center justify-between">

          <!-- User Name -->
          <div class="flex flex-col items-center ml-6">
            <p class="text-lg font-bold text-black">User Name</p>
            <p class="text-lg font-semibold text-gray-500">
              {{ profileStore.userProfile.nickname }}
            </p>
          </div>

          <!-- Account Type -->
          <div class="flex flex-col items-center mr-6">
            <p class="text-lg font-bold text-black">Account Type</p>
            <p class="text-lg font-semibold text-gray-500">
              {{ profileStore.userProfile.type === 'P' ? 'Player' :
                (profileStore.userProfile.type === 'A' ? 'Administrator' : 'Unknown') }}
            </p>
          </div>

        </div>


        <!-- Brain Coins Section -->
        <div class="bg-indigo-100 p-5 rounded-lg shadow-lg flex items-center justify-between ">
          <div class="flex items-center space-x-3">
            <img src="/coin.png" alt="Coin Icon" class="w-10 h-10 object-contain" />
            <div>
              <p class="text-sm font-semibold text-indigo-600">Brain Coins</p>
              <p class="text-xl font-bold text-indigo-800">
                {{ profileStore.userProfile.brain_coins_balance }}
              </p>
            </div>
          </div>
          <button class="bg-indigo-700 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition duration-300">
            Buy Coins
          </button>
        </div>
      </div>

      <div class="text-center mt-8">
        <button @click="handleLogout"
          class="px-6 py-2 bg-red-700 text-white font-semibold rounded-lg shadow-md hover:bg-red-500 transition duration-200">
          Log Out
        </button>
      </div>
    </div>
  </div>
</template>
