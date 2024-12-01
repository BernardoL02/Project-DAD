<script setup>
import { useProfileStore } from '@/stores/profile';
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const profileStore = useProfileStore();
const router = useRouter();

let deleteAccountVisible = ref(false);
const password = ref('');

onMounted(async () => {
  await profileStore.fetchProfile();
});

const showDeleteAccount = () => {
  password.value = ''
  deleteAccountVisible.value = true;
};

const hideDeleteAccount = () => {
  deleteAccountVisible.value = false;
};

const confirmDelete = async () => {

  const accountDeleted = await profileStore.deleteAccount(password.value);

  if (accountDeleted) {
    authStore.clearUser();
    router.push('/login');
  }

  hideDeleteAccount();
  password.value = ''
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
      <div class="text-center pb-6">
        <!-- Profile Picture -->
        <img :src="profileStore.photoUrl" alt="User Profile Picture"
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
              <p class="text-xl font-semibold">
                {{ profileStore.coins }}
              </p>
            </div>
          </div>
          <RouterLink :to="{ name: 'store' }"
            class="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition duration-300 mr-2">
            Buy Coins
          </RouterLink>
        </div>
      </div>

      <div class="flex justify-end mr-4">
        <button @click="showDeleteAccount"
          class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 mr-2"
          type="button">
          Delete Account
        </button>
      </div>
    </div>
  </div>

  <div v-if="deleteAccountVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-auto">
      <h2 class="text-lg font-bold text-gray-800 mb-1">Do you really want to delete your account? </h2>
      <p class="text-gray-600 mb-6">
        This action is irreversible.
      </p>
      <div class="flex justify-center space-x-4 flex-col">

        <div>
          <input type="password" id="register-password" v-model="password" placeholder="Password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" />
        </div>

        <div class="flex flex-row justify-center mt-8 space-x-5">
          <button @click="hideDeleteAccount" class="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600">
            Cancel
          </button>
          <button @click="confirmDelete" class="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>

</template>
