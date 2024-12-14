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
              <span class="bg-gradient-to-r from-sky-500 to-indigo-500 text-transparent bg-clip-text flex flex-row">
                <img src="/spade.png" alt="Notification Icon"
                  class="w-[28px] h-[28px] object-contain cursor-pointer mt-[2px] mr-4" />
                Memory Game
              </span>
            </RouterLink>
          </div>

          <!-- Menu Hamburger -->
          <div class="flex items-center lg:hidden">
            <button @click="toggleMenu"
              class="text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
              <span v-if="isMenuOpen" class="text-xl">&#10005;</span>
              <span v-else class="text-xl">&#9776;</span>
            </button>
          </div>

          <!-- Links à esquerda -->
          <div :class="{ 'hidden lg:flex': true, 'flex flex-col lg:flex-row lg:space-x-8  pr-8': true }">
            <RouterLink to="/" :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              route.path === '/'
                ? 'text-indigo-500 font-semibold'
                : 'text-gray-900 hover:text-sky-600'
            ]" active-class="text-blue-600 font-semibold">
              Home
            </RouterLink>

            <RouterLink v-if="authStore.isPlayer || !authStore.user" :to="{ name: 'single-player' }" :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              route.path === '/singleplayer'
                ? 'text-indigo-500 font-semibold'
                : 'text-gray-900 hover:text-sky-600'
            ]" active-class="text-blue-600 font-semibold">
              Single-Player
            </RouterLink>

            <RouterLink v-if="authStore.isPlayer" to="/multiplayer" :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              route.path === '/multiplayer'
                ? 'text-indigo-500 font-semibold'
                : 'text-gray-900 hover:text-sky-600'
            ]" active-class="text-blue-600 font-semibold">
              Multi-Player
            </RouterLink>

            <RouterLink v-if="authStore.isPlayer" :to="{ name: 'store' }" :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              route.path === '/store'
                ? 'text-indigo-500 font-semibold'
                : 'text-gray-900 hover:text-sky-600'
            ]" active-class="text-blue-600 font-semibold">
              Store
            </RouterLink>

            <!-- Dropdown Score Board -->
            <div class="relative group pt-[6px]">
              <label for="" :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                route.path === '/scoreBoard/singlePlayer' ||
                  route.path === '/scoreBoard/multiPlayer'
                  ? 'text-indigo-500 font-semibold'
                  : 'text-gray-900 hover:text-sky-600'
              ]" active-class="text-blue-600 font-semibold">
                Score Board
              </label>
              <!-- Dropdown Menu -->
              <div
                class="absolute border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible flex flex-col bg-white shadow-lg rounded-lg w-32 z-10 mt-2 transition-all duration-300 ease-in-out">
                <RouterLink to="/scoreBoard/singlePlayer" :class="[
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  route.path === '/scoreBoard/singlePlayer'
                    ? 'text-indigo-500 font-semibold'
                    : 'text-gray-900 hover:text-sky-600'
                ]" active-class="text-blue-600 font-semibold">
                  Single Player
                </RouterLink>
                <RouterLink to="/scoreBoard/multiPlayer" :class="[
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  route.path === '/scoreBoard/multiPlayer'
                    ? 'text-indigo-500 font-semibold'
                    : 'text-gray-900 hover:text-sky-600'
                ]" active-class="text-blue-600 font-semibold">
                  Multi Player
                </RouterLink>
              </div>
            </div>

            <RouterLink v-if="authStore.isAdmin" :to="{ name: 'ManageUsers' }" :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              route.path === '/ManageUsers'
                ? 'text-indigo-500 font-semibold'
                : 'text-gray-900 hover:text-sky-600'
            ]" active-class="text-blue-600 font-semibold">
              Manage Users
            </RouterLink>

            <RouterLink v-if="authStore.isAdmin" :to="{ name: 'adminTransactions' }" :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              route.path === '/adminTransactions'
                ? 'text-indigo-500 font-semibold'
                : 'text-gray-900 hover:text-sky-600'
            ]" active-class="text-blue-600 font-semibold">
              All Transactions
            </RouterLink>

            <RouterLink v-if="authStore.isAdmin" :to="{ name: 'adminGames' }" :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              route.path === '/adminGames'
                ? 'text-indigo-500 font-semibold'
                : 'text-gray-900 hover:text-sky-600'
            ]" active-class="text-blue-600 font-semibold">
              All Games
            </RouterLink>

            <RouterLink v-if="authStore.isPlayer || authStore.isAdmin" :to="{ name: 'statistics' }" :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors pt-[10px]',
              route.path === '/statistics'
                ? 'text-indigo-500 font-semibold'
                : 'text-gray-900 hover:text-sky-600'
            ]" active-class="text-blue-600 font-semibold">
              Statistics
            </RouterLink>
          </div>

          <div v-if="authStore.user" class="flex flex-row space-x-7">
            <div>
              <div v-if="authStore.isPlayer" class="relative group flex items-center space-x-6 pt-3">
                <!-- Foto do Perfil -->
                <div class="relative inline-block">
                  <!-- Bell Icon -->
                  <img src="/bell.png" alt="Notification Icon"
                    class="w-[22px] h-[22px] object-contain cursor-pointer" />

                  <!-- Notification Badge -->
                  <span
                    class="absolute top-[-8px] right-[-5px] inline-flex items-center justify-center w-[18px] h-[18px] text-xs font-semibold text-white bg-sky-500 rounded-full">
                    {{ authStore.notifications.length }}
                  </span>
                </div>

                <!-- Dropdown Menu -->
                <div
                  class="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible flex flex-col right-[-150px] top-[57px] bg-white shadow-lg rounded-lg w-40 z-10 transition-all duration-300 ease-in-out">
                  <div class="absolute right-0 mt-2 w-[270px] bg-white border border-gray-200 rounded-lg shadow-lg"
                    v-if="authStore.notifications.length > 0">
                    <!-- Adicionar overflow-y-auto e max-h -->
                    <ul class="space-y-1 p-1 overflow-y-auto max-h-72">
                      <div v-for="notification in authStore.notifications" :key="notification.id"
                        class="flex flex-col p-2 rounded-md hover:bg-sky-100 mr-1">
                        <!-- Alinhamento do Tipo e Data -->
                        <div class="flex justify-between items-center w-full mb-1">
                          <span class="text-xs font-semibold">{{ notification.type }}</span>

                          <div class="flex flex-row space-x-1">
                            <span class="text-xs">{{
                              new Date(notification.date).toLocaleDateString()
                              }}</span>

                            <img src="/delete.png" alt="Delete Notification Icon"
                              @click="handleDeleteNotificaitonClick(notification.id)"
                              class="w-[16px] h-[16px] object-contain cursor-pointer pt-1 mt-[-3px] transition-transform transform hover:scale-110 hover:shadow-lg" />
                          </div>
                        </div>

                        <div>
                          <!-- If the transaction type is 'B' (Bonus) -->
                          <div v-if="notification.type === 'Bonus'" class="flex flex-col text-gray-500">
                            <span v-if="notification.msg" class="text-xs">
                              {{ notification.msg }}</span>
                            <span v-else class="text-xs">You receive a bonus of {{ notification.coins }} coins</span>
                          </div>

                          <!-- If the transaction type is 'P' (Purchase) -->
                          <div v-else-if="notification.type === 'Purchase'" class="flex flex-col text-gray-500">
                            <span class="text-xs"> {{ notification.msg }}</span>
                          </div>

                          <div v-else-if="notification.type === 'Game'" class="flex flex-col text-gray-500">
                            <span v-if="notification.msg" class="text-xs">
                              {{ notification.msg }}
                            </span>
                            <span v-else-if="notification.coins < 0" class="text-xs">
                              You spent {{ Math.abs(notification.coins) }} brain coin
                            </span>
                            <span v-else class="text-xs">
                              You earned {{ notification.coins }} brain coin
                            </span>
                          </div>
                        </div>
                      </div>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Login/Register ou Perfil -->
            <div class="relative group flex flex-row items-center">
              <div>
                <div class="relative group flex items-center space-x-6">
                  <!-- Foto do Perfil -->
                  <img :src="authStore.userPhotoUrl" alt="User Profile Picture"
                    class="w-12 h-12 border-2 border-white rounded-full shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl" />

                  <!-- Dropdown Menu -->
                  <div
                    class="border border-gray-200 rounded-lg shadow-lg absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible flex flex-col right-[-65px] top-[64px] bg-white w-40 z-10 transition-all duration-300 ease-in-out">
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
              </div>
            </div>
          </div>
          <div v-else>
            <RouterLink to="/login" :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors',
              route.path === '/login' || route.path === '/registration'
                ? 'text-indigo-500 font-semibold'
                : 'text-gray-900 hover:text-sky-600'
            ]" active-class="text-blue-600 font-semibold">
              Login/Register
            </RouterLink>
          </div>
        </nav>
      </div>
    </header>

    <!-- (mostrado quando o hamburger é clicado) -->
    <div>
      <div v-if="isMenuOpen" class="lg:hidden bg-gray-100">
        <div class="space-y-4 p-4">
          <RouterLink to="/" class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
            Home
          </RouterLink>

          <RouterLink v-if="!authStore.user || authStore.isPlayer" to="/singleplayer"
            class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
            Single-Player
          </RouterLink>

          <RouterLink v-if="authStore.isPlayer" to="/multiplayer"
            class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
            Multi-Player
          </RouterLink>

          <RouterLink v-if="authStore.isPlayer" :to="{ name: 'store' }"
            class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
            Store
          </RouterLink>

          <RouterLink v-if="authStore.isAdmin" :to="{ name: 'ManageUsers' }"
            class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
            Manage Users
          </RouterLink>

          <RouterLink v-if="authStore.isAdmin" :to="{ name: 'adminTransactions' }"
            class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
            All Transactions
          </RouterLink>

          <RouterLink v-if="authStore.isAdmin" :to="{ name: 'adminGames' }"
            class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
            All Games
          </RouterLink>

          <RouterLink v-if="authStore.isAdmin" :to="{ name: 'statistics' }"
            class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
            Statistics
          </RouterLink>

          <button @click="toggleScoreBoard"
            class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
            Score Board
            <label v-if="isScoreBoardExpanded">↑</label>
            <label v-else>↓</label>
          </button>

          <div v-if="isScoreBoardExpanded" class="pl-4 space-y-2">
            <RouterLink to="/scoreBoard/singleplayer"
              class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
              Single Player
            </RouterLink>
            <RouterLink to="/scoreBoard/multiPlayer"
              class="block text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium">
              Multi Player
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import Toaster from './components/ui/toast/Toaster.vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const handleLogout = async () => {
  const success = await authStore.logout()
  if (success) {
    router.push('/login')
  }
}

const handleDeleteNotificaitonClick = async (notificationId) => {
  const success = await authStore.deleteNotification(notificationId)
  if (success && authStore.isPlayer) {
    authStore.getNotifications()
  }
}

const isScoreBoardExpanded = ref(false)
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const toggleScoreBoard = () => {
  isScoreBoardExpanded.value = !isScoreBoardExpanded.value
}
</script>
