<script setup>
import { ref, onMounted } from 'vue';
import { useProfileStore } from '@/stores/profile';

const profileStore = useProfileStore();

onMounted(async () => {
  if (!profileStore.loading) {
    await profileStore.fetchProfile();
  }
});

const password = ref('');
const confirmPassword = ref('');

const updateUserInfo = async () => {
  profileStore.updatePassword(password.value, confirmPassword.value)

  password.value = '';
  confirmPassword.value = '';
};

</script>

<template>
  <div class="flex items-center justify-center mt-14">
    <div class="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
      <div class="space-y-4">
        <h1 class="text-2xl font-bold text-center">Update Your Password</h1>

        <form @submit.prevent="updateUserInfo">
          <div class="space-y-6 pt-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-600 mb-2">Password</label>
              <input type="password" id="register-password" v-model="password" placeholder="New Password"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-600 mb-2">Confirm Password</label>
              <input type="password" id="register-password" v-model="confirmPassword" placeholder="New Password"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
          </div>

          <div class="pt-10">
            <button type="submit" :disabled="profileStore.loading"
              class="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition focus:ring-4 focus:ring-gray-400 focus:outline-none">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
