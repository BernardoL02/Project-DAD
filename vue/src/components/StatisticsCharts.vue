<template>
  <div class="statistics-charts">
    <h2>Game Statistics Charts</h2>

    <!-- Chart: Board Sizes -->
    <div>
      <h3>Board Sizes</h3>
      <BarChart
        v-if="boardSizeData.labels.length"
        :chart-id="'board-sizes'"
        :labels="boardSizeData.labels"
        :data="boardSizeData.values"
        :background-color="['#FF6384', '#36A2EB', '#FFCE56']"
      />
      <p v-else>No data available for board sizes.</p>
    </div>

    <!-- Chart: Game Statuses -->
    <div>
      <h3>Game Statuses</h3>
      <PieChart
        v-if="statusData.labels.length"
        :chart-id="'game-statuses'"
        :labels="statusData.labels"
        :data="statusData.values"
        :background-color="['#4BC0C0', '#FF9F40', '#9966FF', '#FF6384']"
      />
      <p v-else>No data available for game statuses.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStatisticsStore } from '@/stores/statistics'

const statisticsStore = useStatisticsStore()

// Board Size Data
const boardSizeData = computed(() => {
  const boardCounts = {}
  statisticsStore.filteredGames.forEach((game) => {
    boardCounts[game.board_id] = (boardCounts[game.board_id] || 0) + 1
  })

  return {
    labels: Object.keys(boardCounts),
    values: Object.values(boardCounts)
  }
})

// Game Status Data
const statusData = computed(() => {
  const statusCounts = {}
  statisticsStore.filteredGames.forEach((game) => {
    statusCounts[game.status] = (statusCounts[game.status] || 0) + 1
  })

  return {
    labels: Object.keys(statusCounts),
    values: Object.values(statusCounts)
  }
})
</script>

<style>
.statistics-charts {
  margin: 20px 0;
}
</style>
