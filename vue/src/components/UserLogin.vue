<script setup>
import { ref,onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { RouterLink } from 'vue-router';
import { useProfileStore } from '@/stores/profile';

const authStore = useAuthStore();
const profileStore = useProfileStore();

const email = ref('p1@mail.pt');
const password = ref('123');
const responseData = ref('');

const submitLogin = async () => {
    try {
        const user = await authStore.login({
            email: email.value,
            password: password.value,
        });

        responseData.value = `Hello, ${user.data.name}!`;

        await profileStore.fetchProfile();

    } catch (error) {
        responseData.value = 'Login failed. Please check your credentials.';
    }
};

onMounted(async () => {
  if (authStore.user) {
    await profileStore.fetchProfile();
  }
});
</script>

<template>
    <div class="flex items-center justify-center mt-40">
      <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl font-bold text-center text-blue-700">Account Login</h2>
        <form class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-600 mb-1">
              Email:
            </label>
            <input
              type="text"
              id="email"
              v-model="email"
              placeholder="Enter your email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
  
          <div>
            <label for="password" class="block text-sm font-medium text-gray-600 mb-1">
              Password:
            </label>
            <input
              type="password"
              id="password"
              v-model="password"
              placeholder="Enter your password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
  
          <button
            @click.prevent="submitLogin"
            class="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Log In
          </button>
        </form>
  
        <div class="mt-4 text-center">
          <RouterLink to="registration" class="text-blue-500 hover:underline">
            Create an Account
          </RouterLink>
        </div>
  
        <div v-if="responseData" class="mt-4 text-center text-gray-700">
          <p>{{ responseData }}</p>
        </div>
      </div>
    </div>
  </template>
  