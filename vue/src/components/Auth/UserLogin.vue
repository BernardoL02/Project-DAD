<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { RouterLink, useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('p1@mail.pt')
const password = ref('123')
const responseData = ref('')

const submitLogin = async () => {
  responseData.value = ''
  await authStore.login({
    email: email.value,
    password: password.value
  })

  if (authStore.user) {
    await authStore.fetchProfile()
    await authStore.getNotifications();
    router.push('/playerProfile')
  }
}
</script>

<template>
  <div class="flex items-center justify-center mt-36">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-2xl font-bold text-center text-gray-800">Account Login</h2>
      <form class="space-y-4 pt-8" @submit.prevent="submitLogin">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-600 mb-1"> Email </label>
          <input type="text" id="email" v-model="email" placeholder="Enter your email"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" />
        </div>

        <div class="pb-5">
          <label for="password" class="block text-sm font-medium text-gray-600 mb-1">
            Password
          </label>
          <input type="password" id="password" v-model="password" placeholder="Enter your password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400" />
        </div>

        <button type="submit"
          class="w-full py-2 bg-sky-500 text-white rounded-lg transition focus:ring-4 focus:ring-gray-400 focus:outline-none">
          Log In
        </button>
      </form>

      <div class="mt-4 text-center pt-1">
        <RouterLink to="registration" class="text-gray-700 hover:underline text-sm">
          Create an Account
        </RouterLink>
      </div>

      <div v-if="responseData" class="mt-4 text-center text-gray-700">
        <p>{{ responseData }}</p>
      </div>
    </div>
  </div>
</template>
