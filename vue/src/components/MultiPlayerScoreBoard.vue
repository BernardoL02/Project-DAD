<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router' // Import router for navigation
import { usescoreBoardStore } from '@/stores/scoreBoard'
import PaginatedTable from '@/components/StandardTablePaginated.vue'

const columns = ['Rank', 'Player', 'Victories', 'Losses']
const scoreBoardStore = usescoreBoardStore()
const router = useRouter() // Access Vue Router

const scoreboards = computed(() => scoreBoardStore.scoreboards)
const loading = computed(() => scoreBoardStore.loading)

// Handle navigation to player profiles
const goToProfile = (playerName) => {
  router.push({
    path: '/playerProfile',
    query: { name: playerName }
  })
}

onMounted(() => {
  scoreBoardStore.fetchMultiPlayerScoreboard()
})
</script>

<template>
  <div class="max-w-3xl mx-auto py-8 space-y-6">
    <!-- Podium Image with Clickable Areas -->
    <div class="relative text-center my-4">
      <img src="/podium.png" alt="Podium" class="mx-auto w-96 h-auto" />

      <!-- First Place -->
      <div
        class="absolute top-8 left-36 w-16 h-16 cursor-pointer"
        @click="goToProfile(scoreboards[0]?.Player)"
        v-if="scoreboards.length >= 1"
        title="First Place"
      ></div>

      <!-- Second Place -->
      <div
        class="absolute top-20 left-20 w-16 h-16 cursor-pointer"
        @click="goToProfile(scoreboards[1]?.Player)"
        v-if="scoreboards.length >= 2"
        title="Second Place"
      ></div>

      <!-- Third Place -->
      <div
        class="absolute top-20 left-52 w-16 h-16 cursor-pointer"
        @click="goToProfile(scoreboards[2]?.Player)"
        v-if="scoreboards.length >= 3"
        title="Third Place"
      ></div>
    </div>

    <!-- Scoreboard Table -->
    <div class="pt-8">
      <div>
        <div class="bg-white p-6 rounded-lg shadow-md mb-6">
          <div class="text-center mb-6">
            <p class="text-lg text-gray-700 font-semibold">Multi-Player Global Score Board</p>
            <p class="text-sm text-gray-500 mt-2">
              This table shows top 5 players with the most victories in any board.
            </p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center text-gray-400">Loading...</div>
      <div v-else>
        <PaginatedTable :columns="columns" :data="scoreboards" :pagination="false" />
        <!-- Show a message if there are no scores -->
        <div v-if="!loading && scoreboards.length === 0" class="text-center text-gray-400 mt-4">
          No scores available
        </div>
      </div>
    </div>
  </div>
</template>
