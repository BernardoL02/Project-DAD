<script setup>
import { computed, onMounted, ref } from 'vue'
import { usescoreBoardStore } from '@/stores/scoreBoard'
import { useBoardStore } from '@/stores/board'
import PaginatedTable from '@/components/ui/table/StandardTablePaginated.vue'

const columns = ['Rank', 'Player', 'Best Time', 'Min Turns', 'Status']

const boardStore = useBoardStore()
const scoreBoardStore = usescoreBoardStore()

const loading = computed(() => scoreBoardStore.loading)
const boardSize = ref('3x4')
const filteredScoreboards = computed(() => scoreBoardStore.filteredScoreboards)

onMounted(async () => {
  await boardStore.getBoards()
  if (!boardSize.value && boardStore.boards.length > 0) {
    scoreBoardStore.boardSize = `${boardStore.boards[0].board_cols}x${boardStore.boards[0].board_rows}`
  }
  await scoreBoardStore.fetchAllScoreboards()
})

const onBoardClick = (size) => {
  scoreBoardStore.boardSize = size
  boardSize.value = size
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-8 space-y-6">
    <h1 class="text-3xl font-bold text-center mb-8">Single-Player</h1>
    <div>
      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <div class="text-center mb-6">
          <p class="text-lg text-gray-700 font-semibold">Global Top 10 Single-Player Games</p>
          <p class="text-sm text-gray-500 mt-2">
            The table shows the top 10 global single-player performances across board sizes, with
            each user appearing only once based on their highest score.
          </p>
        </div>

        <div class="flex justify-center pt-2">
          <div class="flex flex-row gap-8">
            <button
              v-for="board in boardStore.boards"
              :key="board.id"
              @click="onBoardClick(board.board_cols + 'x' + board.board_rows)"
              :class="{
                'bg-sky-500 text-white':
                  board.board_cols + 'x' + board.board_rows == scoreBoardStore.boardSize,
                'bg-gray-200 hover:bg-gray-300 text-gray-700':
                  board.board_cols + 'x' + board.board_rows != scoreBoardStore.boardSize
              }"
              class="px-4 py-1 rounded-md border transition-all duration-100"
            >
              {{ board.board_cols + 'x' + board.board_rows }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Scoreboard Table -->
    <div>
      <div v-if="loading" class="text-center text-gray-400">Loading...</div>
      <div v-else>
        <PaginatedTable
          :columns="columns"
          :data="filteredScoreboards"
          :pagination="false"
          :showActions="false"
        />

        <div class="bg-white p-6 rounded-lg shadow-md mt-6">
          <p class="text-sm text-gray-700 font-semibold mb-1">Sorting Criteria</p>
          <p class="text-xs text-gray-500">
            1. <strong>Best Time</strong> - The fastest time achieved by players for completing
            games on each board size. <br />
            2. <strong>Turns</strong> - The total number of moves players made to complete a game on
            each board size.
          </p>
        </div>

        <div
          v-if="!loading && filteredScoreboards.length === 0"
          class="text-center text-gray-400 mt-4"
        >
          No scores available
        </div>
      </div>
    </div>
  </div>
</template>
