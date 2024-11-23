<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import StandardTable from './StandardTable.vue'; // Import the StandardTable component

const boardSize = ref('3x4'); // Default board size is '3x4'
const scoreboards = ref([]); // Data for the scoreboard
const loading = ref(false);

// Define table columns to pass to StandardTable
const columns = ref(['Rank', 'Player', 'Best Time', 'Min Turns']);

// Fetch scoreboard data from the server
const fetchScoreboard = async (boardSize) => {
  loading.value = true; // Set loading state to true
  try {
    const response = await axios.get(`/scoreboard/single/${boardSize}`);
    scoreboards.value = response.data.scoreboards.map((score, index) => ({
      Rank: index + 1,
      Player: score.nickname, // Assuming 'nickname' is the player's name
      'Best Time': `${score.best_time}s`,
      'Min Turns': score.min_turns || 'N/A', // Handle cases where min_turns might be missing
    }));
  } catch (error) {
    console.error('Error fetching scoreboard:', error);
    scoreboards.value = [];
  } finally {
    loading.value = false; // Set loading state to false
  }
};

// Change the board size and fetch new scoreboard data
const handleBoardSizeChange = (size) => {
  boardSize.value = size;
  fetchScoreboard(size);
};

// Fetch the initial scoreboard data when the component is mounted
onMounted(() => {
  fetchScoreboard(boardSize.value);
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
        @click="handleBoardSizeChange(size)"
        :class="{'bg-blue-600 text-white': boardSize === size}"
        class="px-4 py-2 rounded-md border border-gray-300"
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
        <div v-if="!loading && scoreboards.length === 0" class="text-center text-gray-400 mt-4">
          No scores available
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
button {
  transition: background-color 0.3s;
}
button:hover {
  background-color: #3b82f6;
}
</style>
