<script setup>
import { onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import PaginatedTable from '@/components/StandardTablePaginated.vue'

const tableColumns = ['Id', 'Status', 'Began At', 'Ended At', 'Total Time']
const gameStore = useGameStore()

const isLoading = ref(true)

// Função de filtro por status e data
const statusOptions = ['Pending', 'In Progress', 'Ended', 'Interrupted']

onMounted(async () => {
  await gameStore.getSinglePlayerGames()
  isLoading.value = false
})
</script>

<template>
  <div class="max-w-4xl mx-auto mt-10">
    <!-- Mensagem de carregamento -->
    <div v-if="isLoading" class="text-center text-lg">Loading games...</div>

    <!-- Filtro de status e data -->
    <div v-else class="space-y-6">

      <h1 class=" text-3xl font-bold text-center">Single-Player History</h1>

      <div class="bg-white p-6 rounded-lg shadow-md mb-6">

        <!-- Filtros -->
        <div class="flex flex-col sm:flex-row sm:justify-between gap-4">
          <!-- Filtro de Status -->
          <div class="w-full sm:w-auto">
            <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
            <select id="status" v-model="gameStore.statusFilter"
              class="mt-2 w-full sm:w-48 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Status</option>
              <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
            </select>
          </div>

          <!-- Filtro de Data de Início -->
          <div class="w-full sm:w-auto">
            <label for="began_at" class="block text-sm font-medium text-gray-700">Began At</label>
            <input id="began_at" v-model="gameStore.beginDateFilter" type="text" placeholder="Search by Began At"
              class="mt-2 w-full sm:w-48 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
      </div>


      <!-- Tabela com paginação -->
      <PaginatedTable :columns="tableColumns" :data="gameStore.filteredGames" />
    </div>
  </div>
</template>
