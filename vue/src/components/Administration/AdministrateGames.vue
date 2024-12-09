<script setup>
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import PaginatedTable from '@/components/ui/table/StandardTablePaginated.vue'
import DatePicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'
import DropdownButton from '@/components/ui/DropdownButton.vue'

const adminStore = useAdminStore()

const statusOptions = ['All', 'Pending', 'In Progress', 'Ended', 'Interrupted']
const gameTypeOptions = ['All', 'Single-Player', 'Multi-Player']

const handleResetFilters = () => {
  adminStore.resetFilters()
}

onMounted(() => {
  adminStore.getTransactions()
  adminStore.getAllGames()
})
</script>

<template>
  <h1 class="text-3xl font-bold text-center">All Games</h1>
  <div class="max-w-7xl mx-auto mt-10">
    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <div class="flex flex-col sm:flex-row sm:justify-between gap-5">
        <div class="w-full sm:w-auto">
          <label for="began_at" class="block text-sm font-medium text-gray-700">Date Range</label>
          <DatePicker
            v-model="adminStore.dateRange"
            range
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            :placeholder="adminStore.formattedDateRange"
            @change="adminStore.handleDateChange"
          />
        </div>
        <div class="w-full sm:w-auto">
          <label for="gameStatus" class="block text-sm font-medium text-gray-700 pb-2">
            Game Status
          </label>
          <DropdownButton
            :options="statusOptions"
            v-model="adminStore.gameStatusFilter"
            @select="(value) => adminStore.filterByGameStatus(value)"
          />
        </div>
        <div class="w-full sm:w-auto">
          <label for="gameType" class="block text-sm font-medium text-gray-700 pb-2">
            Game Type
          </label>
          <DropdownButton
            :options="gameTypeOptions"
            v-model="adminStore.gameTypeFilter"
            @select="(value) => adminStore.filterByGameType(value)"
          />
        </div>
      </div>

      <div class="flex justify-end text-xs pt-5 mb-[-15px]">
        <button
          @click="handleResetFilters"
          class="text-gray-500 hover:text-black hover:border-gray-700"
        >
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Paginated Table Component -->
    <div class="space-y-6">
      <PaginatedTable
        :columns="[
          'Id',
          'Board',
          'Created User',
          'Winner User',
          'Type of Game',
          'Status',
          'Date',
          'Time'
        ]"
        :data="adminStore.filteredGames"
      />
    </div>
  </div>
</template>
