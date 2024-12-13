<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import PaginatedTable from '@/components/ui/table/StandardTablePaginated.vue'
import DatePicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'
import DropdownButton from '@/components/ui/DropdownButton.vue'

const adminStore = useAdminStore()

const tableColumns = ['Id', 'Board', 'Created User', 'Winner User', 'Type of Game', 'Status', 'Date', 'Time']

const statusOptions = ['All', 'Pending', 'In Progress', 'Ended', 'Interrupted']
const gameTypeOptions = ['All', 'Single-Player', 'Multi-Player']
const boardSizeOptions = ['All', '3x4', '4x4', '6x6']

const gameStatusFilter = ref('All')
const gameTypeFilter = ref('All')
const boardSizeFilter = ref('All')
const dateRange = ref([null, null])
const currentPage = ref(1)

const handleResetFilters = () => {
  gameStatusFilter.value = 'All'
  gameTypeFilter.value = 'All'
  boardSizeFilter.value = 'All'
  dateRange.value = [null, null]
}

const formatDate = (date) => {
  if (!date) return ''
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(date).toLocaleDateString('en-US', options)
}

const formattedDateRange = computed(() => {
  const [start, end] = dateRange.value
  if (start && end) {
    return `${formatDate(start)} - ${formatDate(end)}`
  }
  return 'Select Date Range'
})

const handleDateChange = (newRange) => {
  dateRange.value = newRange.map((date) => (date ? new Date(date).toISOString().split('T')[0] : null))
}

watch([gameStatusFilter, gameTypeFilter, boardSizeFilter, dateRange], async () => {
  changePage(1)
})

onMounted(async () => {
  await adminStore.getAllGames(currentPage.value)
})

const changePage = async (newPage) => {
  if (newPage >= 1 && newPage <= adminStore.totalPages) {
    currentPage.value = newPage
    await adminStore.getAllGames(newPage, {
      gameStatus: gameStatusFilter.value,
      gameType: gameTypeFilter.value,
      boardSize: boardSizeFilter.value,
      dateRange: dateRange.value
    })
  }
}

</script>

<template>
  <div class="max-w-5xl mx-auto py-8 space-y-6">
    <h1 class="text-3xl font-bold text-center mb-8">All Games</h1>
    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <div class="flex flex-col sm:flex-row sm:justify-between gap-5">
        <div class="w-full sm:w-auto">
          <label for="began_at" class="block text-sm font-medium text-gray-700 pb-2">Date Range</label>
          <DatePicker v-model="dateRange" range format="YYYY-MM-DD" value-format="YYYY-MM-DD"
            class="w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            :placeholder="formattedDateRange" @change="handleDateChange" />
        </div>
        <div class="w-full sm:w-auto">
          <label for="gameStatus" class="block text-sm font-medium text-gray-700 pb-2">
            Game Status
          </label>
          <DropdownButton :options="statusOptions" v-model="gameStatusFilter" />
        </div>
        <div class="w-full sm:w-auto">
          <label for="gameType" class="block text-sm font-medium text-gray-700 pb-2">
            Game Type
          </label>
          <DropdownButton :options="gameTypeOptions" v-model="gameTypeFilter" />
        </div>
        <div class="w-full sm:w-auto">
          <label for="gameStatus" class="block text-sm font-medium text-gray-700 pb-2">
            Board Size
          </label>
          <DropdownButton :options="boardSizeOptions" v-model="boardSizeFilter" />
        </div>
      </div>

      <div class="flex justify-end text-xs pt-5 mb-[-15px]">
        <button @click="handleResetFilters" class="text-gray-500 hover:text-black hover:border-gray-700">
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Paginated Table Component -->
    <div class="overflow-x-auto shadow-md rounded-lg">
      <PaginatedTable :columns="tableColumns" :data="adminStore.games" :pagination="false" />

      <div v-if="adminStore.totalPages != 0" class="flex items-center justify-between m-4 ">
        <div>
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
            class="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400">
            Previous
          </button>

          <button @click="changePage(currentPage + 1)" :disabled="currentPage === adminStore.totalPages"
            class="ml-2 px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400">
            Next
          </button>
        </div>

        <span class="text-gray-600 mr-2">
          Page {{ currentPage }} of {{ adminStore.totalPages }}
        </span>
      </div>
    </div>
  </div>
</template>
