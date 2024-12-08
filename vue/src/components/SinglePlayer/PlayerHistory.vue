<script setup>
import { ref, onMounted } from 'vue';
import { useGameStore } from '@/stores/game';
import { useReplayStore } from '@/stores/replay';
import PaginatedTable from '@/components/ui/table/StandardActionsTable.vue';

const gameStore = useGameStore();
const replayStore = useReplayStore();
const isLoading = ref(true);
const tableColumns = ['Id', 'Difficulty', 'Board', 'Status', 'Began At', 'Total Time', 'Turns'];

const closeModal = () => {
  replayStore.showModal = false;
};

onMounted(async () => {
  await gameStore.getSinglePlayerGames();
  isLoading.value = false;
});
</script>

<template>
  <div class="max-w-4xl mx-auto mt-10">
    <div v-if="isLoading" class="text-center text-lg">Loading games...</div>

    <div v-else class="space-y-0">
      <h1 class="text-3xl font-bold text-center">Single-Player History</h1>

      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <PaginatedTable :data="gameStore.filteredGames" :columns="tableColumns" :hiddenColumns="['replay']"
          :pagination="true">
          <template #actions="{ row }">
            <div class="flex justify-center items-center h-full">
              <button v-if="row.replay" @click="replayStore.handleReplay(row.replay, row.difficulty)"
                class="text-blue-500 hover:underline">
                <img src="/replay.png" alt="Replay" class="w-6 h-6" />
              </button>
            </div>
          </template>
        </PaginatedTable>
      </div>

      <!-- Modal -->
      <div v-if="replayStore.showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h2 class="text-2xl font-bold mb-4">Replay</h2>

          <div class="grid gap-2 mb-4"
            :style="{ gridTemplateRows: `repeat(${replayStore.selectedReplay.board.length}, 1fr)` }">
            <div v-for="(row, rowIndex) in replayStore.selectedReplay.board" :key="rowIndex" class="grid"
              :style="{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }">
              <div v-for="(cell, colIndex) in row" :key="colIndex" class="relative w-20 h-28 m-1">
                <div class="card w-full h-full relative"
                  :class="{ flipped: replayStore.showFlipped[rowIndex][colIndex] === true || replayStore.showFlipped[rowIndex][colIndex] === 'matched' }">
                  <div class="card-back bg-gray-800 rounded-lg">
                    <img src="/Cards/semFace.png" class="w-full object-cover" />
                  </div>
                  <div class="card-front rounded-lg"
                    :class="{ 'opacity-50': replayStore.showFlipped[rowIndex][colIndex] === 'matched' }">
                    <img :src="`/Cards/${cell}`" class="w-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center mb-4 gap-2">
            <button @click="replayStore.togglePlayPause" class="text-2xl">
              <span v-if="replayStore.isReplayFinished">🔄</span>
              <span v-else-if="!replayStore.isPaused">⏸️</span>
              <span v-else>▶️</span>
            </button>
            <input type="range" min="0" :max="replayStore.maxTime" step="100" v-model="replayStore.currentTime"
              @mousedown="replayStore.pauseReplay" @mouseup="replayStore.updateProgress" class="w-full" />
            <span class="ml-2">{{ (replayStore.currentTime / 1000).toFixed(1) }}s</span>
          </div>

          <div class="flex justify-end">
            <button @click="closeModal" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  transform-style: preserve-3d;
  transition: transform 0.5s;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.card-front {
  transform: rotateY(180deg);
}
</style>
