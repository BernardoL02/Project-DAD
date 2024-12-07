<script setup>
import { computed, onMounted } from 'vue'
import { usescoreBoardStore } from '@/stores/scoreBoard'
import PaginatedTable from '@/components/ui/table/StandardTablePaginated.vue'

const columns = ['Rank', 'Player', 'Victories', 'Losses', 'Win/Loss Ratio']
const scoreBoardStore = usescoreBoardStore()

const scoreboards = computed(() => scoreBoardStore.scoreboards)
const loading = computed(() => scoreBoardStore.loading)

onMounted(async () => {
  await scoreBoardStore.fetchMultiPlayerScoreboard()

  scoreBoardStore.topPlayer1 = await scoreBoardStore.fetchProfileTopPlayers(
    scoreBoardStore.scoreboards[0].Player
  )
  scoreBoardStore.topPlayer2 = await scoreBoardStore.fetchProfileTopPlayers(
    scoreBoardStore.scoreboards[1].Player
  )
  scoreBoardStore.topPlayer3 = await scoreBoardStore.fetchProfileTopPlayers(
    scoreBoardStore.scoreboards[2].Player
  )
})
</script>

<template>
  <div class="max-w-3xl mx-auto py-8 space-y-6">
    <div class="pt-8">
      <div>
        <div class="bg-white p-6 rounded-lg shadow-md mb-6">
          <div class="flex items-end justify-center space-x-12 mb-6">
            <div class="player-container flex flex-col items-center top-12">
              <img v-if="scoreBoardStore.topPlayer2?.photo_filename" :src="scoreBoardStore.topPlayer2.photo_filename"
                alt="User Profile Picture"
                class="w-20 h-20 rounded-full shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl cursor-pointer" />
              <p v-if="scoreBoardStore.topPlayer2?.nickname" class="text-sm text-gray-600 mt-2">
                {{ scoreBoardStore.topPlayer2.nickname }}
              </p>
            </div>

            <div class="player-container flex flex-col items-center top-4">
              <img v-if="scoreBoardStore.topPlayer1?.photo_filename" :src="scoreBoardStore.topPlayer1.photo_filename"
                alt="User Profile Picture"
                class="w-20 h-20 rounded-full shadow-xl transform transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-2xl cursor-pointer" />
              <p v-if="scoreBoardStore.topPlayer1?.nickname" class="text-sm text-gray-600 mt-2">
                {{ scoreBoardStore.topPlayer1.nickname }}
              </p>
            </div>

            <div class="player-container flex flex-col items-center top-20">
              <img v-if="scoreBoardStore.topPlayer3?.photo_filename" :src="scoreBoardStore.topPlayer3.photo_filename"
                alt="User Profile Picture"
                class="w-20 h-20 rounded-full shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl cursor-pointer" />
              <p v-if="scoreBoardStore.topPlayer3?.nickname" class="text-sm text-gray-600 mt-2">
                {{ scoreBoardStore.topPlayer3.nickname }}
              </p>
            </div>
          </div>
          <img src="/podium.png" alt="Podium" class="mx-auto w-96 h-auto pb-10" />
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
        <div v-if="!loading && scoreboards.length === 0" class="text-center text-gray-400 mt-4">
          No scores available
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-container {
  position: relative;
  animation: slide-in 0.8s ease-in-out;
}

@keyframes slide-in {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.top-12 {
  top: 3rem;
}

.top-4 {
  top: 1rem;
}

.top-20 {
  top: 5rem;
}
</style>
