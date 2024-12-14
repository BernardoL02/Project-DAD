<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import PaginatedTable from '@/components/ui/table/StandardActionsTable.vue'
import DropdownButton from '@/components/ui/DropdownButton.vue'
import DatePicker from 'vue-datepicker-next'

const router = useRouter()

const tableColumns = [
  'Board',
  'Creator',
  'Winner',
  'Players',
  'Status',
  'Began At',
  'Total Time',
  'Pairs Discovered'
]
const gameStore = useGameStore()

const isLoading = ref(true)

const statusOptions = ['All', 'Pending', 'In Progress', 'Ended', 'Interrupted']
const boardOptions = ['All', '3x4', '4x4', '6x6']

function redirectToGame(gameId) {
  router.push({ name: 'MultiplayerGameDetails', params: { gameId } })
}

const dropdownRefs = ref({
  statusDropdown: null,
  boardDropdown: null
})

const handleResetFilters = () => {
  gameStore.beginDateFilter = [null, null]
  gameStore.statusFilter = 'All'
  gameStore.boardFilter = 'All'

  if (dropdownRefs.value.statusDropdown) {
    dropdownRefs.value.statusDropdown.resetToDefault()
  }
  if (dropdownRefs.value.boardDropdown) {
    dropdownRefs.value.boardDropdown.resetToDefault()
  }
}

const handleSelect = (selectedValue, filterType) => {
  if (filterType === 'status') {
    gameStore.statusFilter = selectedValue
  } else if (filterType === 'board') {
    gameStore.boardFilter = selectedValue
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(date).toLocaleDateString('en-US', options)
}

const formattedDateRange = computed(() => {
  const [start, end] = gameStore.beginDateFilter
  if (start && end) {
    return `${formatDate(start)} - ${formatDate(end)}`
  }
  return 'Select Date Range'
})

const handleDateChange = (newRange) => {
  gameStore.beginDateFilter = newRange.map((date) =>
    date ? new Date(date).toISOString().split('T')[0] : null
  )
}

onMounted(async () => {
  await gameStore.getMultiPlayerGames()
  isLoading.value = false

  gameStore.beginDateFilter = [null, null]
  gameStore.statusFilter = 'All'
  gameStore.boardFilter = 'All'
})
</script>

<template>
  <div class="max-w-6xl mx-auto mt-10">
    <!-- Mensagem de carregamento -->
    <div v-if="isLoading" class="text-center text-lg">Loading games...</div>

    <div v-else class="space-y-6">
      <h1 class="text-3xl font-bold text-center">Multi-Player History</h1>

      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <div class="flex flex-row sm:flex-row sm:justify-between gap-4">
          <!-- Filtro por data -->
          <div class="w-full sm:w-auto">
            <label for="began_at" class="block text-sm font-medium text-gray-700">Began At</label>
            <DatePicker
              v-model="gameStore.beginDateFilter"
              range
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="max-w-[300px] focus:ring-sky-500 focus:border-sky-500 pt-[12px] text-sm font-medium text-gray-700 focus:outline-none focus:ring-2"
              :placeholder="formattedDateRange"
              @change="handleDateChange"
            />
          </div>

          <!-- Filtro por status -->
          <div class="w-full sm:w-auto">
            <label for="status" class="block text-sm font-medium text-gray-700 pb-2">Status</label>
            <DropdownButton
              ref="dropdownRefs.statusDropdown"
              :options="statusOptions"
              v-model="gameStore.statusFilter"
              @select="(value) => handleSelect(value, 'status')"
            />
          </div>

          <!-- Filtro por board -->
          <div class="w-full sm:w-auto">
            <label for="board" class="block text-sm font-medium text-gray-700 pb-2">Board</label>
            <DropdownButton
              ref="dropdownRefs.boardDropdown"
              :options="boardOptions"
              v-model="gameStore.boardFilter"
              @select="(value) => handleSelect(value, 'board')"
            />
          </div>
        </div>

        <div class="flex justify-end text-xs pt-5 mr-1 mb-[-15px]">
          <button
            @click="handleResetFilters"
            class="text-gray-500 hover:text-black hover:border-gray-700"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <PaginatedTable
        :data="gameStore.filteredGames"
        :columns="tableColumns"
        :hiddenColumns="[]"
        :pagination="true"
      >
        <template #actions="{ row }">
          <div class="flex space-x-2 items-center justify-center">
            <button @click="redirectToGame(row.id)">
              <svg
                class="w-6 h-6 stroke-gray-500 stroke-2 hover:stroke-blue-500 transition-colors"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </button>
          </div>
        </template>
      </PaginatedTable>
    </div>
  </div>
</template>
