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
        <PaginatedTable :columns="columns" :data="scoreboards" :pagination="false"/>
        <!-- Show a message if there are no scores -->
        <div v-if="!loading && scoreboards.length === 0" class="text-center text-gray-400 mt-4">
          No scores available
        </div>
      </div>
    </div>

</template>
