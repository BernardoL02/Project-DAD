<script setup>
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import PaginatedTable from '@/components/ui/table/StandardTablePaginated.vue'
import DatePicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'

const adminStore = useAdminStore()

const handleResetFilters = () => {
  adminStore.resetFilters()
}

onMounted(() => {
  adminStore.getTransactions()
})
</script>

<template>
  <h1 class="text-3xl font-bold text-center">Transaction History</h1>
  <div class="max-w-7xl mx-auto mt-10">
    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <div class="flex flex-row sm:flex-row sm:justify-between gap-5">
        <div class="w-full sm:w-auto">
          <label for="began_at" class="block text-sm font-medium text-gray-700">Began At</label>
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
          <label for="difficulty" class="block text-sm font-medium text-gray-700 pb-2"
            >Difficulty</label
          >
          <DropdownButton
            ref="dropdownRefs.difficultyDropdown"
            :options="difficultyOptions"
            v-model="adminStore.difficultyFilter"
            @select="(value) => handleSelect(value, 'difficulty')"
          />
        </div>
        <div class="w-full sm:w-auto">
          <label for="board" class="block text-sm font-medium text-gray-700 pb-2">Board</label>
          <DropdownButton
            ref="dropdownRefs.boardDropdown"
            :options="boardOptions"
            v-model="adminStore.boardFilter"
            @select="(value) => handleSelect(value, 'board')"
          />
        </div>
        <div class="w-full sm:w-auto">
          <label for="status" class="block text-sm font-medium text-gray-700 pb-2">Status</label>
          <DropdownButton
            ref="dropdownRefs.statusDropdown"
            :options="statusOptions"
            v-model="adminStore.statusFilter"
            @select="(value) => handleSelect(value, 'status')"
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
    <div class="space-y-6">
      <PaginatedTable
        :columns="['Id', 'Name', 'Date', 'Type', 'Value', 'Payment Method', 'Reference', 'Coins']"
        :data="adminStore.transactions"
      />
    </div>
  </div>
</template>
