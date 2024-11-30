<script setup>
import { computed, watch, onMounted } from 'vue';
import { usescoreBoardStore } from '@/stores/scoreBoard';
import { useBoardStore } from '@/stores/board';
import { useGameStore } from '@/stores/game';
import PaginatedTable from '@/components/StandardTablePaginated.vue';

const columns = ['Rank', 'Player', 'Best Time', 'Min Turns', 'Status'];

const scoreBoardStore = usescoreBoardStore();
const boardStore = useBoardStore();
const gameStore = useGameStore();

const scoreboards = computed(() => scoreBoardStore.scoreboards);
const loading = computed(() => scoreBoardStore.loading);
const boardSize = computed(() => gameStore.boardFilter); // Sync with gameStore filter

// Fetch the scoreboard on mount
onMounted(async () => {
  await boardStore.getBoards();
  if (!boardSize.value && boardStore.boards.length > 0) {
    // Set initial board size if not set
    gameStore.handleBoardSizeChange(boardStore.boards[0].board_cols + 'x' + boardStore.boards[0].board_rows);
  }
  await scoreBoardStore.fetchSinglePlayerScoreboard(boardSize.value);
});

// Fetch new scoreboard data when the filter changes
watch(boardSize, async (newSize) => {
  if (newSize) {
    await scoreBoardStore.fetchSinglePlayerScoreboard(newSize);
  }
});

const onBoardClick = (size) => {
  gameStore.handleBoardSizeChange(size); // Update filter
};
</script>

<template>
    <div class="pt-8">
            <div>
                <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                    <div class="text-center mb-6">
                        <p class="text-lg text-gray-700 font-semibold">Global Top 10 Single-Player Games</p>
                        <p class="text-sm text-gray-500 mt-2">
                            This table shows the global best performances across different board sizes.
                        </p>
                    </div>

                    <div class="flex justify-center pt-2">
                        <div class="flex flex-row gap-8">
                          <button 
          v-for="board in boardStore.boards" 
          :key="board.id"
          @click="onBoardClick(board.board_cols + 'x' + board.board_rows)" 
          :class="{
            'bg-sky-600 text-white': board.board_cols + 'x' + board.board_rows == boardSize,
            'bg-sky-500 hover:bg-sky-600 text-white': board.board_cols + 'x' + board.board_rows != boardSize
          }" 
          class="px-4 py-1 rounded-md border transition-all duration-300"
        >
          {{ board.board_cols + 'x' + board.board_rows }}
        </button>
                        </div>
                    </div>
                </div>
            </div>

    <!-- Scoreboard Table -->
    <div>
      <h2 class="text-xl font-semibold mb-4">Top 10 Best Single Players for {{ boardSize }} Board</h2>
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
