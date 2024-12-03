<script setup>
import { onMounted, ref, computed } from 'vue';
import { useGameStore } from '@/stores/game';
import PaginatedTable from '@/components/StandardTablePaginated.vue';
import DropdownButton from '@/components/ui/DropdownButton.vue';
import DatePicker from 'vue-datepicker-next';

const tableColumns = ['Id', 'Difficulty', 'Board', 'Status', 'Began At', 'Total Time', 'Turns'];
const gameStore = useGameStore();

const isLoading = ref(true);

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

  if (dropdownRefs.statusDropdown.value) {
    dropdownRefs.statusDropdown.value.resetToDefault();
  }
  if (dropdownRefs.boardDropdown.value) {
    dropdownRefs.boardDropdown.value.resetToDefault();
  }
  if (dropdownRefs.difficultyDropdown.value) {
    dropdownRefs.difficultyDropdown.value.resetToDefault();
  }
};

const handleSelect = (selectedValue, filterType) => {
  if (filterType === 'status') {
    gameStore.statusFilter = selectedValue;
  } else if (filterType === 'board') {
    gameStore.boardFilter = selectedValue;
  } else if (filterType === 'difficulty') {
    gameStore.difficultyFilter = selectedValue;
  }
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
    <!-- Mensagem de carregamento -->
    <div v-if="isLoading" class="text-center text-lg">Loading games...</div>

    <div v-else class="space-y-6">
      <h1 class="text-3xl font-bold text-center">Single-Player History</h1>

      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <div class="flex flex-row sm:flex-row sm:justify-between gap-5">
          <!-- Filtro por data -->
          <div class="w-full sm:w-auto">
            <label for="began_at" class="block text-sm font-medium text-gray-700">Began At</label>
            <DatePicker v-model="gameStore.beginDateFilter" range format="YYYY-MM-DD" value-format="YYYY-MM-DD"
              class="max-w-[225px] focus:ring-sky-500 focus:border-sky-500 pt-[12px] text-sm font-light text-gray-700 focus:outline-none focus:ring-2"
              :placeholder="formattedDateRange" @change="handleDateChange" />
          </div>

          <!-- Filtro por dificuldade -->
          <div class="w-full sm:w-auto">
            <label for="difficulty" class="block text-sm font-medium text-gray-700 pb-2">Difficulty</label>
            <DropdownButton ref="dropdownRefs.difficultyDropdown" :options="difficultyOptions"
              v-model="gameStore.difficultyFilter" @select="(value) => handleSelect(value, 'difficulty')" />
          </div>

          <!-- Filtro por tabuleiro -->
          <div class="w-full sm:w-auto">
            <label for="board" class="block text-sm font-medium text-gray-700 pb-2">Board</label>
            <DropdownButton ref="dropdownRefs.boardDropdown" :options="boardOptions" v-model="gameStore.boardFilter"
              @select="(value) => handleSelect(value, 'board')" />
          </div>

          <!-- Filtro por status -->
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

      <!-- Tabela com paginação -->
      <PaginatedTable :columns="tableColumns" :data="gameStore.filteredGames" />
    </div>
  </div>
</template>
