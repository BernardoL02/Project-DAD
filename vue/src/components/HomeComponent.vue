<script setup>
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted } from 'vue'
import { useStatisticsStore } from '@/stores/statistics'

const authStore = useAuthStore()
const statisticsStore = useStatisticsStore()

const totalGamesAnonymous = computed(() => statisticsStore.gameStatisticsAnonymous.total || 0)
const totalGamesThisMonth = computed(
  () => statisticsStore.gameStatisticsAnonymous.totalGamesCurrentMonth || 0
)
const totalPlayers = computed(() => statisticsStore.gameStatisticsAnonymous.totalPlayers || 0)

onMounted(() => {
  statisticsStore.fetchGameAnonymous()
})
</script>

<template>
  <div class="bg-gradient-to-b from-blue-100 to-blue-50 pb-4 flex flex-col items-center rounded-lg mt-10">
    <!-- Banner -->
    <div
      class="w-full relative bg-gradient-to-r from-sky-500 to-indigo-700 text-white py-10 rounded-lg animate-fade-in">
      <div class="flex flex-col justify-center items-center text-center space-y-2 px-2">
        <h1 class="text-4xl sm:text-5xl font-bold tracking-wide animate-slide-in-down">
          Welcome to Memory Game
        </h1>
        <p class="text-lg sm:text-xl max-w-3xl opacity-90">
          Challenge your memory, compete with others, and reach the top of the leaderboard!
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl w-full px-6 pt-10 space-y-8">
      <!-- About the Game -->
      <section class="text-center space-y-4 animate-fade-in">
        <h2 class="text-3xl font-bold text-gray-800">What is Memory Game?</h2>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          Memory Game is a fun and challenging game designed to test your memory and skills. <br />
          Play solo or with friends and see who can remember more!
        </p>
      </section>

      <!-- Highlights -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-delayed">
        <div
          class="bg-white shadow-md p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-transform transform hover:scale-105">
          <h3 class="text-xl font-bold text-sky-600">Single-Player Mode</h3>
          <p class="text-gray-600">
            Play on your own and improve your memory while climbing the rankings.
          </p>
        </div>
        <div
          class="bg-white shadow-md p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-transform transform hover:scale-105">
          <h3 class="text-xl font-bold text-sky-600">Multi-Player Mode</h3>
          <p class="text-gray-600">
            Challenge your friends or compete online for the ultimate victory.
          </p>
        </div>
        <div
          class="bg-white shadow-md p-6 rounded-lg text-center space-y-4 hover:shadow-lg transition-transform transform hover:scale-105">
          <h3 class="text-xl font-bold text-sky-600">Scoreboard</h3>
          <p class="text-gray-600">Check out the leaderboard and see who has the best memory!</p>
        </div>
      </section>

      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-delayed pt-2">
        <section class="col-span-full text-center space-y-2 animate-fade-in">
          <div class="flex flex-row justify-center">
            <h2 class="text-2xl font-bold text-gray-800">Overall Statistics</h2>
          </div>
        </section>

        <div
          class="bg-white shadow-md p-4 rounded-lg text-center space-y-2 hover:shadow-lg transition-transform transform hover:scale-105">
          <div class="text-lg font-semibold mb-1 text-gray-700 flex flex-row justify-center">
            <img src="/people.png" alt="Lock" class="w-6 h-6 mr-3 mt-[2px] transition-opacity duration-200" />
            Total Players Registered
          </div>
          <span class="text-sky-600 text-2xl">{{ totalPlayers }}</span>
        </div>
        <div
          class="bg-white shadow-md p-4 rounded-lg text-center space-y-2 hover:shadow-lg transition-transform transform hover:scale-105">
          <div class="text-lg font-semibold mb-1 text-gray-700 flex flex-row justify-center">
            <img src="/controller.png" alt="Lock" class="w-7 h-7 mr-3 mt-[-7px] transition-opacity duration-200" />
            Total Games Played
          </div>
          <span class="text-sky-600 text-2xl">{{ totalGamesAnonymous }}</span>
        </div>
        <div
          class="bg-white shadow-md p-4 rounded-lg text-center space-y-2 hover:shadow-lg transition-transform transform hover:scale-105">
          <div class="text-lg font-semibold mb-1 text-gray-700 flex flex-row justify-center">
            <img src="/calendar.png" alt="Lock" class="w-6 h-6 mr-3  transition-opacity duration-200" />
            Total Games Played This Month
          </div>
          <span class="text-sky-600 text-2xl">{{ totalGamesThisMonth }}</span>
        </div>
      </section>



      <!-- Call to Action -->
      <section class="text-center animate-fade-in pt-5">
        <p v-if="!authStore.user" class="text-lg text-gray-700 pb-4">
          Want to get started? <br />
          Create an account and join the fun!
        </p>
        <div class="flex justify-center gap-4">
          <router-link v-if="!authStore.user" to="/registration"
            class="bg-sky-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-sky-600 transition-transform transform hover:scale-105 hover:shadow-lg">
            Register Now
          </router-link>
          <router-link to="/scoreBoard/multiPlayer"
            class="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg shadow-md hover:bg-gray-300 transition-transform transform hover:scale-105 hover:shadow-lg">
            View Leaderboard
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-in-out;
}

.animate-fade-in-delayed {
  animation: fade-in 1s ease-in-out 0.3s;
  animation-fill-mode: both;
}

.animate-slide-in-down {
  animation: slide-in-down 1s ease-in-out;
}
</style>
