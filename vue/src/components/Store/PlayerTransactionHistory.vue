<script setup>
import { onMounted, computed, ref } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import PaginatedTable from '@/components/ui/table/StandardTablePaginated.vue'
import DatePicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'
import DropdownButton from '@/components/ui/DropdownButton.vue'

const transactionStore = useTransactionStore()

const typeOptions = ['All', 'Game', 'Purchase', 'Bonus']
const paymentMethodOptions = ['All', 'MB', 'PAYPAL', 'MBWAY', 'IBAN', 'VISA']
const loading = computed(() => transactionStore.loading)
const selectedType = ref('All')
const selectedPaymentMethod = ref('All')

const handleResetFilters = () => {
  selectedType.value = 'All'
  selectedPaymentMethod.value = 'All'
  transactionStore.resetFilters()
}

const handleSelect = (value, filterType) => {
  if (filterType === 'type') {
    selectedType.value = value
    transactionStore.filterByType(value)
  } else if (filterType === 'paymentMethod') {
    selectedPaymentMethod.value = value
    transactionStore.filterByPaymentMethod(value)
  }
}
onMounted(() => {
  transactionStore.getTransactions()
})
</script>

<template>
  <div class="max-w-5xl mx-auto py-8 space-y-6">
    <h1 class="text-3xl font-bold text-center mb-8">Transaction History</h1>
    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <div class="flex flex-col sm:flex-row sm:justify-between gap-5">
        <div class="w-full sm:w-auto">
          <label for="began_at" class="block text-sm font-medium text-gray-700 mb-2"
            >Date Range</label
          >
          <div class="w-80 mx-auto">
            <DatePicker
              v-model="transactionStore.dateRange"
              range
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
              :placeholder="transactionStore.formattedDateRange"
              @change="transactionStore.handleDateChange"
            />
          </div>
        </div>

        <div class="w-full sm:w-auto">
          <label for="type" class="block text-sm font-medium text-gray-700 pb-2"
            >Transaction Type</label
          >
          <DropdownButton
            :options="typeOptions"
            v-model="selectedType"
            @select="(value) => handleSelect(value, 'type')"
          />
        </div>
        <div class="w-full sm:w-auto">
          <label for="paymentMethod" class="block text-sm font-medium text-gray-700 pb-2"
            >Payment Method</label
          >
          <DropdownButton
            :options="paymentMethodOptions"
            v-model="selectedPaymentMethod"
            @select="(value) => handleSelect(value, 'paymentMethod')"
            :class="{
              disabled: selectedType !== 'All' && selectedType !== 'Purchase'
            }"
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
    <div v-if="loading == true" class="text-center text-lg">Loading transactions...</div>

    <div v-else class="space-y-6">
      <PaginatedTable
        :columns="['Date', 'Type', 'Value', 'Payment Method', 'Reference', 'Coins']"
        :data="transactionStore.filteredTransactions"
      />
    </div>
  </div>
</template>

<style scoped>
.cursor-not-allowed {
  cursor: not-allowed;
}

.disabled {
  opacity: 0.3;
  pointer-events: none;
  cursor: not-allowed;
}
</style>
