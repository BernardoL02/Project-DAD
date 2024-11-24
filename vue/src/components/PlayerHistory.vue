<script setup>
import { onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import PaginatedTable from '@/components/StandardTablePaginated.vue'
import DropdownButton from '@/components/ui/DropdownButton.vue'

const tableColumns = ['Id', 'Board', 'Status', 'Began At', 'Total Time']
const gameStore = useGameStore()

const isLoading = ref(true)

// Opções de filtro
const statusOptions = ['All', 'Pending', 'In Progress', 'Ended', 'Interrupted']
const boardOptions = ['All', '3x4', '4x4', '6x6']

// Função de filtro que trata tanto o status quanto o tabuleiro
const handleSelect = (selectedValue, filterType) => {
  if (filterType === 'status') {
    gameStore.statusFilter = selectedValue
  } else if (filterType === 'board') {
    gameStore.boardFilter = selectedValue
  }
}

onMounted(async () => {
  await gameStore.getSinglePlayerGames()
  isLoading.value = false
})
</script>

<template>
  <div class="max-w-4xl mx-auto mt-10">
    <!-- Mensagem de carregamento -->
    <div v-if="isLoading" class="text-center text-lg">Loading games...</div>

    <div v-else class="space-y-6">
      <h1 class="text-3xl font-bold text-center">Single-Player History</h1>

      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <!-- Filtros -->
        <div class="flex flex-row sm:flex-row sm:justify-between gap-4">

          <!-- Filtro de Data de Início -->
          <div class="w-full sm:w-auto">
            <label for="began_at" class="block text-sm font-medium text-gray-700">Began At</label>
            <input id="began_at" v-model="gameStore.beginDateFilter" type="text" placeholder="Date" class="inline-flex justify-between w-full sm:w-48 rounded-md border border-gray-300 bg-white py-2 px-4
            text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 mt-2" />
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
