<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import PaginatedTable from '@/components/ui/table/StandardTablePaginated.vue'
import DatePicker from 'vue-datepicker-next'
import DropdownButton from '@/components/ui/DropdownButton.vue'
import 'vue-datepicker-next/index.css'

const adminStore = useAdminStore()

const typeOptions = ['All', 'Game', 'Purchase', 'Bonus']
const paymentMethodOptions = ['All', 'MB', 'PAYPAL', 'MBWAY', 'IBAN', 'VISA']

const loading = computed(() => adminStore.loading)
const selectedType = ref('All')
const selectedPaymentMethod = ref('All')

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
  adminStore.getTransactions()
})
</script>

<template>
  <h1 class="text-3xl font-bold text-center">All Transactions</h1>
  <div class="max-w-6xl mx-auto mt-10">
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

    <div v-if="loading == true" class="text-center text-gray-400">Loading...</div>
    <div v-else class="space-y-6">
      <PaginatedTable :columns="['Id', 'Name', 'Date', 'Type', 'Value', 'Payment Method', 'Reference', 'Coins']"
        :data="adminStore.filteredTransactions" />
    </div>
  </div>
</template>
