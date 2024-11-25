<script setup>
import { useProfileStore } from '@/stores/profile';

const profileStore = useProfileStore();

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
        <img :src="profileStore.photoUrl || '/defaultPhotoProfile.jpg'" alt="User Profile Picture"
          class="w-60 h-60 rounded-full mx-auto border-4 border-white shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl" />
      </div>

      <!-- User Name and Nickname -->
      <div class="text-center">
        <h2 class="text-3xl font-semibold text-gray-800">{{ profileStore.name }}</h2>
      </div>

      <!-- Brain Coins and Type -->
      <div class="bg-white p-6 rounded-xl shadow-lg space-y-6">

        <!-- User Name Section -->
        <div class="bg-white p-5 rounded-lg shadow-md flex items-center justify-between">

          <!-- User Name -->
          <div class="flex flex-col items-center ml-4">
            <p class="text-lg font-bold text-black">Nickname</p>
            <p class="text-base  font-semibold text-gray-500">
              {{ profileStore.nickname }}
            </p>
          </div>

          <!-- User Email -->
          <div class="flex flex-col items-center ml-4">
            <p class="text-lg font-bold text-black">Email</p>
            <p class="text-base font-semibold text-gray-500">
              {{ profileStore.email }}
            </p>
          </div>


          <!-- Account Type -->
          <div class="flex flex-col items-center mr-4">
            <p class="text-lg font-bold text-black">Account Type</p>
            <p class="text-base  font-semibold text-gray-500">
              {{ profileStore.type === 'P' ? 'Player' :
                (profileStore.type === 'A' ? 'Administrator' : 'Unknown') }}
            </p>
          </div>
        </div>

        <!-- Brain Coins Section -->
        <div class="bg-sky-100 p-5 rounded-lg shadow-lg flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <img src="/coin.png" alt="Coin Icon" class="w-10 h-10 object-contain" />
            <div>
              <p class="text-xl">
                {{ profileStore.coins }}
              </p>
            </div>
          </div>
          <RouterLink
              :to="{ name: 'store' }" 
              class="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition duration-300 mr-2">
            Buy Coins
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
