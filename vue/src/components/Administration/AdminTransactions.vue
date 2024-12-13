<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import PaginatedTable from '@/components/ui/table/StandardTablePaginated.vue'
import DatePicker from 'vue-datepicker-next'
import DropdownButton from '@/components/ui/DropdownButton.vue'
import 'vue-datepicker-next/index.css'

const adminStore = useAdminStore()

const tableColumns = ['Id', 'Name', 'Date', 'Type', 'Value', 'Payment Method', 'Reference', 'Coins']

const typeOptions = ['All', 'Game', 'Purchase', 'Bonus']
const paymentMethodOptions = ['All', 'MB', 'PAYPAL', 'MBWAY', 'IBAN', 'VISA']

const selectedType = ref('All')
const selectedPaymentMethod = ref('All')

const currentPage = ref(1)

const handleSelect = (value, filterType) => {
  if (filterType === 'type') {
    selectedType.value = value
    adminStore.filterByType(value)
  } else if (filterType === 'paymentMethod') {
    selectedPaymentMethod.value = value
    adminStore.filterByPaymentMethod(value)
  }
}

const handleResetFilters = () => {
  selectedType.value = 'All'
  selectedPaymentMethod.value = 'All'
  adminStore.resetFilters()
}

onMounted(() => {
  adminStore.getTransactions(currentPage.value)
})

const changePage = async (newPage) => {
  if (newPage >= 1 && newPage <= adminStore.totalPages) {
    currentPage.value = newPage
    await adminStore.getAllGames(newPage)
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto py-8 space-y-6">
    <h1 class="text-3xl font-bold text-center mb-8">All Transactions</h1>
    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <div class="flex flex-col sm:flex-row sm:justify-between gap-5">
        <div class="w-full sm:w-auto">
          <label for="began_at" class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <DatePicker v-model="adminStore.dateRange" range format="YYYY-MM-DD" value-format="YYYY-MM-DD"
            class="w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            :placeholder="adminStore.formattedDateRange" @change="adminStore.handleDateChange" />
        </div>

        <div class="w-full sm:w-auto">
          <label for="type" class="block text-sm font-medium text-gray-700 pb-2">Transaction Type</label>
          <DropdownButton :options="typeOptions" v-model="selectedType"
            @select="(value) => handleSelect(value, 'type')" />
        </div>
        <div class="w-full sm:w-auto">
          <label for="paymentMethod" class="block text-sm font-medium text-gray-700 pb-2">Payment Method</label>
          <DropdownButton :options="paymentMethodOptions" v-model="selectedPaymentMethod"
            @select="(value) => handleSelect(value, 'paymentMethod')" />
        </div>
      </div>

      <div class="flex justify-end text-xs pt-5 mb-[-15px]">
        <button @click="handleResetFilters" class="text-gray-500 hover:text-black hover:border-gray-700">
          Reset Filters
        </button>
      </div>
    </div>

    <div class="overflow-x-auto shadow-md rounded-lg">
      <PaginatedTable :columns="tableColumns" :data="adminStore.transactions" :pagination="false" />

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
