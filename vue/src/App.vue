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
            <RouterLink to="/" :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              route.path === '/' ? 'text-indigo-500 font-semibold' : 'text-gray-900 hover:text-sky-600'
            ]" active-class="text-blue-600 font-semibold">
              Home
            </RouterLink>

            <RouterLink to="/singlePlayer"
              :class="['px-3 py-2 rounded-md text-sm font-medium transition-colors', route.path === '/singlePlayer' ? 'text-indigo-500 font-semibold' : 'text-gray-900 hover:text-sky-600']"
              active-class="text-blue-600 font-semibold">
              Single-Player
            </RouterLink>

            <RouterLink to="/multiplayer"
              :class="['px-3 py-2 rounded-md text-sm font-medium transition-colors', route.path === '/multiplayer' ? 'text-indigo-500 font-semibold' : 'text-gray-900 hover:text-sky-600']"
              active-class="text-blue-600 font-semibold">
              Multi-Player
            </RouterLink>
            <RouterLink :to="{ name: 'store' }"
              :class="['px-3 py-2 rounded-md text-sm font-medium transition-colors', route.path === '/Store' ? 'text-indigo-500 font-semibold' : 'text-gray-900 hover:text-sky-600']"
              active-class="text-blue-600 font-semibold">
              Store
            </RouterLink>

            <!-- Dropdown Score Board -->
            <div class="relative group pt-[6px]">
              <label for=""
                class="text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                active-class="text-blue-600 font-semibold">
                Score Board
              </label>
              <!-- Dropdown Menu -->
              <div
                class="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible flex flex-col bg-white shadow-lg rounded-lg w-40 z-10 mt-2 transition-all duration-300 ease-in-out">
                <RouterLink to="/scoreBoard/singlePlayer"
                  class="block text-gray-900 hover:bg-sky-100 px-4 py-2 text-sm rounded-md">
                  Single Player
                </RouterLink>
                <RouterLink to="/scoreBoard/multiPlayer"
                  class="block text-gray-900 hover:bg-sky-100 px-4 py-2 text-sm rounded-md">
                  Multi Player
                </RouterLink>
              </div>
            </div>
          </div>

          <!-- Login/Register ou Perfil do Usuário -->
          <div class="relative group flex flex-row items-center">
            <div v-if="authStore.user">
              <!-- Foto do Perfil -->
              <img :src="profileStore.photoUrl" alt="User Profile Picture"
                class="mr-2 ml-16 w-12 h-12 rounded-full border-1 border-black shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl cursor-pointer" />
              <!-- Dropdown Menu -->
              <div
                class="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible flex flex-col right-[-60px] top-[2px] mt-14 bg-white shadow-lg rounded-lg w-40 z-10 transition-all duration-300 ease-in-out">
                <RouterLink to="/playerProfile"
                  class="block text-gray-900 hover:bg-sky-100 px-4 py-2 text-sm rounded-t-lg">
                  View Profile
                </RouterLink>
                <RouterLink to="/updateProfile" class="block text-gray-900 hover:bg-sky-100 px-4 py-2 text-sm">
                  Update Profile
                </RouterLink>
                <RouterLink to="/changePassword" class="block text-gray-900 hover:bg-sky-100 px-4 py-2 text-sm">
                  Change Password
                </RouterLink>
                <button @click="handleLogout"
                  class="block text-left w-full text-gray-900 hover:bg-red-100 hover:text-red-600 px-4 py-2 text-sm rounded-b-lg">
                  Log Out
                </button>
              </div>
            </div>
            <div v-else>
              <RouterLink 
                  to="/login"
                  :class="[
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors', 
                    (route.path === '/login' || route.path === '/registration') 
                      ? 'text-indigo-500 font-semibold' 
                      : 'text-gray-900 hover:text-sky-600'
                  ]"
                  active-class="text-blue-600 font-semibold">
                  Login/Register
              </RouterLink>
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
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';
import { useRoute, useRouter } from 'vue-router';

const profileStore = useProfileStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const handleLogout = async () => {
  const success = await authStore.logout();
  if (success) {
    router.push('/login');
  }
};

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>
