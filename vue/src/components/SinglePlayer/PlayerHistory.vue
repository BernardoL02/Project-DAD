<script setup>
import { ref, onMounted, computed } from 'vue';
import { useGameStore } from '@/stores/game';
import { useReplayStore } from '@/stores/replay';
import PaginatedTable from '@/components/ui/table/StandardActionsTable.vue';
import DropdownButton from '@/components/ui/DropdownButton.vue';
import DatePicker from 'vue-datepicker-next';

const gameStore = useGameStore();
const replayStore = useReplayStore();
const isLoading = ref(true);
const tableColumns = ['Id', 'Difficulty', 'Board', 'Status', 'Began At', 'Total Time', 'Turns'];

const statusOptions = ['All', 'Pending', 'In Progress', 'Ended', 'Interrupted'];
const boardOptions = ['All', '3x4', '4x4', '6x6'];
const difficultyOptions = ['All', 'Normal', 'Hard'];

const dropdownRefs = {
  statusDropdown: ref(null),
  boardDropdown: ref(null),
  difficultyDropdown: ref(null),
};

const handleResetFilters = () => {
  gameStore.beginDateFilter = [null, null];
  gameStore.statusFilter = 'All';
  gameStore.boardFilter = 'All';
  gameStore.difficultyFilter = 'All';

  if (dropdownRefs.statusDropdown.value) dropdownRefs.statusDropdown.value.resetToDefault();
  if (dropdownRefs.boardDropdown.value) dropdownRefs.boardDropdown.value.resetToDefault();
  if (dropdownRefs.difficultyDropdown.value) dropdownRefs.difficultyDropdown.value.resetToDefault();
};

const handleSelect = (selectedValue, filterType) => {
  if (filterType === 'status') gameStore.statusFilter = selectedValue;
  else if (filterType === 'board') gameStore.boardFilter = selectedValue;
  else if (filterType === 'difficulty') gameStore.difficultyFilter = selectedValue;
};

const formatDate = (date) => {
  if (!date) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

const formattedDateRange = computed(() => {
  const [start, end] = gameStore.beginDateFilter;
  if (start && end) {
    return `${formatDate(start)} - ${formatDate(end)}`;
  }
  return 'Select Date Range';
});

const handleDateChange = (newRange) => {
  gameStore.beginDateFilter = newRange.map((date) =>
    date ? new Date(date).toISOString().split('T')[0] : null
  );
};


const closeModal = () => {
  replayStore.showModal = false;
};

onMounted(async () => {
  await gameStore.getSinglePlayerGames();
  isLoading.value = false;

  gameStore.beginDateFilter = [null, null];
  gameStore.statusFilter = 'All';
  gameStore.boardFilter = 'All';
  gameStore.difficultyFilter = 'All';
});
</script>

<template>
  <div class="max-w-4xl mx-auto mt-10">
    <div v-if="isLoading" class="text-center text-lg">Loading games...</div>

    <div v-else class="space-y-6">
      <h1 class="text-3xl font-bold text-center">Single-Player History</h1>

      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <div class="flex flex-row sm:flex-row sm:justify-between gap-5">
          <div class="w-full sm:w-auto">
            <label for="began_at" class="block text-sm font-medium text-gray-700">Began At</label>
            <DatePicker v-model="gameStore.beginDateFilter" range format="YYYY-MM-DD" value-format="YYYY-MM-DD"
              class="max-w-[225px] focus:ring-sky-500 focus:border-sky-500 pt-[12px] text-sm font-medium text-gray-700 focus:outline-none focus:ring-2"
              :placeholder="formattedDateRange" @change="handleDateChange" />
          </div>
          <div class="w-full sm:w-auto">
            <label for="difficulty" class="block text-sm font-medium text-gray-700 pb-2">Difficulty</label>
            <DropdownButton ref="dropdownRefs.difficultyDropdown" :options="difficultyOptions"
              v-model="gameStore.difficultyFilter" @select="(value) => handleSelect(value, 'difficulty')" />
          </div>
          <div class="w-full sm:w-auto">
            <label for="board" class="block text-sm font-medium text-gray-700 pb-2">Board</label>
            <DropdownButton ref="dropdownRefs.boardDropdown" :options="boardOptions" v-model="gameStore.boardFilter"
              @select="(value) => handleSelect(value, 'board')" />
          </div>
          <div class="w-full sm:w-auto">
            <label for="status" class="block text-sm font-medium text-gray-700 pb-2">Status</label>
            <DropdownButton ref="dropdownRefs.statusDropdown" :options="statusOptions" v-model="gameStore.statusFilter"
              @select="(value) => handleSelect(value, 'status')" />
          </div>
        </div>

        <div class="flex justify-end text-xs pt-5 mb-[-15px]">
          <button @click="handleResetFilters" class="text-gray-500 hover:text-black hover:border-gray-700">
            Reset Filters
          </button>
        </div>
      </div>

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
