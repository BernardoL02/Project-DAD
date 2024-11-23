<script setup>
import { computed, onMounted } from 'vue';
import { usescoreBoardStore } from '@/stores/scoreBoard';
import StandardTable from './StandardTable.vue';

const columns = ['Rank', 'Player', 'Best Time', 'Min Turns', 'Status'];
const scoreBoardStore = usescoreBoardStore();

// Expose store properties as computed properties
const scoreboards = computed(() => scoreBoardStore.scoreboards);
const loading = computed(() => scoreBoardStore.loading);
const boardSize = computed(() => scoreBoardStore.boardSize);



onMounted(() => {
  if (!scoreBoardStore.scoreboards.length) {
        scoreBoardStore.fetchScoreboard(scoreBoardStore.boardSize);
  }
});
</script>

<template>
  <div class="max-w-2xl mx-auto py-8 space-y-6">
    <h1 class="text-3xl font-bold text-center">Single-Player Score Board</h1>

    <!-- Board size buttons -->
    <div class="flex justify-center space-x-4">
      <button
        v-for="size in ['3x4', '4x4', '6x6']"
        :key="size"
        @click="scoreBoardStore.handleBoardSizeChange(size)"
        :class="{
          'bg-indigo-600 text-white': boardSize === size,
          'bg-indigo-400 hover:bg-indigo-600 text-white': boardSize !== size
        }"
        class="px-4 py-2 rounded-md border border-gray-300 transition"
      >
        {{ size }}
      </button>
    </div>

    <div>
      <h2 class="text-xl font-semibold mb-4">Top 10 Best Players for {{ boardSize }} Board</h2>
      <div v-if="loading" class="text-center text-gray-400">Loading...</div>
      <div v-else>
        <StandardTable 
          :columns="columns" 
          :data="scoreboards" 
        />
        <!-- Show a message if there are no scores -->
        <div v-if="!loading && scoreBoardStore.length ==0" class="text-center text-gray-400 mt-4">
          No scores available
        </div>
      </div>
    </div>
  </div>
</template>
