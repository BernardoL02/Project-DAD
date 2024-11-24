<script setup>
import { computed, onMounted } from 'vue';
import { usescoreBoardStore } from '@/stores/scoreBoard';
import PaginatedTable from '@/components/StandardTablePaginated.vue'


const columns = ['Rank', 'Player', 'Victories', 'Losses'];
const scoreBoardStore = usescoreBoardStore();


const scoreboards = computed(() => scoreBoardStore.scoreboards);
const loading = computed(() => scoreBoardStore.loading);

onMounted(() => {
  scoreBoardStore.fetchMultiPlayerScoreboard();
});
</script>

<template>
  <div class="max-w-2xl mx-auto py-8 space-y-6">
    <h1 class="text-3xl font-bold text-center">Multi-Player Score Board</h1>

    <div>
      <h2 class="text-xl font-semibold mb-4">Top 10 Multi Players with Most Victories and Losses</h2>
      <div v-if="loading" class="text-center text-gray-400">Loading...</div>
      <div v-else>
        <PaginatedTable :columns="columns" :data="scoreboards" :pagination="false"/>
        <!-- Show a message if there are no scores -->
        <div v-if="!loading && scoreboards.length === 0" class="text-center text-gray-400 mt-4">
          No scores available
        </div>
      </div>
    </div>
  </div>
</template>
