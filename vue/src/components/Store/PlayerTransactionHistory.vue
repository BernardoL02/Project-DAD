<script setup>
import { onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import PaginatedTable from '@/components/ui/table/StandardTablePaginated.vue'
import DatePicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'

const transactionStore = useTransactionStore()

const handleResetFilters = () => {
  transactionStore.resetFilters()
}

onMounted(() => {
  transactionStore.getTransactions()
})
</script>

<template>
  <div class="max-w-4xl mx-auto mt-10">
    <div v-if="transactionStore.loading" class="text-center text-lg">Loading transactions...</div>

    <div v-else class="space-y-6">
      <h1 class="text-3xl font-bold text-center">Transaction History</h1>

      <div class="flex justify-center items-center mb-6">
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

        <div class="flex justify-end text-xs pt-5 mb-[-15px]">
          <button
            @click="handleResetFilters"
            class="text-gray-500 hover:text-black hover:border-gray-700"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <PaginatedTable
        :columns="['Id', 'Date', 'Type', 'Value', 'Payment Method', 'Reference', 'Coins']"
        :data="transactionStore.filteredTransactions"
      />
    </div>
  </div>
</template>
