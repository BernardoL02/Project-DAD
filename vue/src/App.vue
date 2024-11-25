<template>
  <Toaster />
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex items-center justify-between h-16 space-x-8">
          <!-- Logo ou título -->
          <div class="flex-shrink-0">
            <RouterLink to="/"
              class="text-2xl font-semibold text-gray-900 hover:text-sky-600 transition-all duration-300 ease-in-out transform hover:scale-105">
              <span class="bg-gradient-to-r from-sky-500 to-indigo-500 text-transparent bg-clip-text">
                Memory Game
              </span>
            </RouterLink>
          </div>

          <!-- Menu Hamburger para telas pequenas -->
          <div class="flex items-center lg:hidden">
            <button @click="toggleMenu"
              class="text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
              <span v-if="isMenuOpen">&#10005;</span>
              <span v-else>&#9776;</span> <!-- Ícone do hambúrguer -->
            </button>
          </div>

          <!-- Links à esquerda -->
          <div :class="{ 'hidden lg:flex': true, 'flex flex-col lg:flex-row lg:space-x-8': true }">
            <RouterLink to="/"
              class="text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 font-semibold">
              Home
            </RouterLink>
            <RouterLink to="/login"
              class="text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 font-semibold">
              Login
            </RouterLink>
            <RouterLink to="/websocket"
              class="text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 font-semibold">
              WebSockets Tester
            </RouterLink>
            <RouterLink to="/singlePlayer"
              class="text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 font-semibold">
              Single-Player
            </RouterLink>

            <RouterLink to="/multiplayer"
              class="text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 font-semibold">
              Multi-Player
            </RouterLink>

            <!-- Dropdown Score Board -->
            <div class="relative group pt-[6px]">
              <label for=""
                class="text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                active-class="text-blue-600 font-semibold">
                Score Board
              </label>
              <!-- Dropdown Menu -->
              <div class="absolute left-0 hidden mt-2 space-y-2 bg-white shadow-lg rounded-md w-48 group-hover:block">
                <RouterLink to="/scoreBoard/singlePlayer"
                  class="block text-gray-900 hover:bg-sky-100 px-4 py-2 text-sm rounded-md">
                  Single Player Score
                </RouterLink>
                <RouterLink to="/scoreBoard/multiPlayer"
                  class="block text-gray-900 hover:bg-sky-100 px-4 py-2 text-sm rounded-md">
                  Multi Player Score
                </RouterLink>
              </div>
            </div>
          </div>

          <!-- Link Profile separado à direita com Dropdown -->
          <div class="relative group flex flex-row items-center">
            <div v-show="authStore.user">
              <img :src="profileStore.photoUrl || '/defaultPhotoProfile.jpg'" alt="User Profile Picture"
                class="w-12 h-12 rounded-full border-1 border-black shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl cursor-pointer" />
            </div>

            <!-- Dropdown Menu -->
            <div v-show="authStore.user"
              class="absolute hidden group-hover:flex flex-col right-[-75px] top-[-1px] mt-14 bg-white shadow-lg rounded-lg w-48 z-10 transition-opacity duration-300">
              <RouterLink to="/playerProfile"
                class="block text-gray-900 hover:bg-sky-100 px-4 py-2 text-sm rounded-t-lg">
                View Profile
              </RouterLink>
              <RouterLink to="/updateProfile" class="block text-gray-900 hover:bg-sky-100 px-4 py-2 text-sm">
                Update Profile
              </RouterLink>
              <button @click="handleLogout"
                class="block text-left w-full text-gray-900 hover:bg-red-100 hover:text-red-600 px-4 py-2 text-sm rounded-b-lg">
                Log Out
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>

    <!-- Menu de navegação em telas pequenas (exibido quando o hamburger é clicado) -->
    <div v-if="isMenuOpen" class="lg:hidden bg-gray-100">
      <div class="space-y-4 p-4">
        <RouterLink to="/" class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
          Home
        </RouterLink>
        <RouterLink to="/testers/laravel"
          class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
          Laravel Tester
        </RouterLink>
        <RouterLink to="/testers/websocket"
          class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
          WebSockets Tester
        </RouterLink>
        <RouterLink to="/singlePlayer"
          class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
          Single-Player
        </RouterLink>

        <RouterLink class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
          Score Board
        </RouterLink>

        <RouterLink to="/playerProfile"
          class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
          Profile
        </RouterLink>
      </div>
    </div>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import Toaster from './components/ui/toast/Toaster.vue';
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile';

const profileStore = useProfileStore();
const authStore = useAuthStore();

const handleLogout = async () => {
  const success = await authStore.logout();
  if (success) {
    window.location.href = '/login';
  }
};


const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>
