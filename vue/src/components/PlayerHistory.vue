<script setup>
import { onMounted, ref, computed } from 'vue'
import { useGameStore } from '@/stores/game'
import PaginatedTable from '@/components/StandardTablePaginated.vue'
import DropdownButton from '@/components/ui/DropdownButton.vue'
import DatePicker from 'vue-datepicker-next';

const tableColumns = ['Id', 'Board', 'Status', 'Began At', 'Total Time', 'Turns']
const gameStore = useGameStore()

const isLoading = ref(true)

const statusOptions = ['All', 'Pending', 'In Progress', 'Ended', 'Interrupted']
const boardOptions = ['All', '3x4', '4x4', '6x6']


const handleSelect = (selectedValue, filterType) => {
  if (filterType === 'status') {
    gameStore.statusFilter = selectedValue
  } else if (filterType === 'board') {
    gameStore.boardFilter = selectedValue
  }
}

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
  await gameStore.getSinglePlayerGames()
  isLoading.value = false

  gameStore.beginDateFilter = [null, null]
  gameStore.statusFilter = "All"
  gameStore.boardFilter = "All"
})

</script>

<template>
  <div class="max-w-4xl mx-auto mt-10">
    <!-- Mensagem de carregamento -->
    <div v-if="isLoading" class="text-center text-lg">Loading games...</div>

    <div v-else class="space-y-6">
      <h1 class="text-3xl font-bold text-center">Single-Player History</h1>

      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <div class="flex flex-row sm:flex-row sm:justify-between gap-4">

          <div class="w-full sm:w-auto">
            <label for="began_at" class="block text-sm font-medium text-gray-700">Began At</label>
            <DatePicker v-model="gameStore.beginDateFilter" range format="YYYY-MM-DD" value-format="YYYY-MM-DD"
              class=" max-w-72 focus:ring-sky-500 focus:border-sky-500 pt-[12px] text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 "
              :placeholder="formattedDateRange" @change="handleDateChange" />
          </div>

          <!-- Filtro de Tabuleiro -->
          <div class=" w-full sm:w-auto">
            <label for="board" class="block text-sm font-medium text-gray-700 pb-2">Board</label>
            <DropdownButton :options="boardOptions" @select="(value) => handleSelect(value, 'board')" />
          </div>

          <!-- Filtro de Status -->
          <div class=" w-full sm:w-auto">
            <label for="status" class="block text-sm font-medium text-gray-700 pb-2">Status</label>
            <DropdownButton :options="statusOptions" @select="(value) => handleSelect(value, 'status')" />
          </div>
        </div>
      </div>

      <!-- Tabela com paginação -->
      <PaginatedTable :columns="tableColumns" :data="gameStore.filteredGames" />
    </div>
  </div>
</template>
