<script setup>
import { onMounted, ref, computed } from 'vue';
import { useTransactionStore } from '@/stores/transaction';
import PaginatedTable from '@/components/ui/table/StandardTablePaginated.vue';
import DatePicker from 'vue-datepicker-next';
import 'vue-datepicker-next/index.css';

const tableColumns = ['Id', 'Date', 'Type', 'Value', 'Payment Method', 'Reference', 'Coins'];

const transactionStore = useTransactionStore();

const isLoading = ref(true);
const dateRange = ref([null, null]);

const formatDate = (date) => {
  if (!date) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

const formattedDateRange = computed(() => {
  const [start, end] = dateRange.value;
  if (start && end) {
    return `${formatDate(start)} - ${formatDate(end)}`;
  }
  return 'Select Date Range';
});

const filteredTransactions = computed(() => {
  if (!dateRange.value[0] && !dateRange.value[1]) {
    console.log('No date range selected, returning all transactions.');
    return transactionStore.transactions;
  }

  const [start, end] = dateRange.value.map((date) =>
    date ? new Date(date).setHours(0, 0, 0, 0) : null
  );

  const filtered = transactionStore.transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date).setHours(0, 0, 0, 0);
    return (
      (!start || transactionDate >= start) &&
      (!end || transactionDate <= end)
    );
  });

  return filtered;
});


const handleDateChange = (newRange) => {
  console.log('Date range changed to:', newRange);

  dateRange.value = newRange.map((date) =>
    date ? new Date(date).toISOString().split('T')[0] : null
  );

  console.log('Updated date range:', dateRange.value);
};

onMounted(async () => {
  try {
    await transactionStore.getTransactions();

    const transactions = transactionStore.transactions;

    if (transactions.length > 0) {
      const dates = transactions.map((t) => new Date(t.date).setHours(0, 0, 0, 0)); // Zerar horas para datas
      const startDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
      const endDate = new Date(Math.max(...dates)).toISOString().split('T')[0];

      dateRange.value = [startDate, endDate];
    }
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto mt-10">
    <div v-if="isLoading" class="text-center text-lg">Loading transactions...</div>

    <div v-else class="space-y-6">
      <h1 class="text-3xl font-bold text-center">Transaction History</h1>

      <div class="flex justify-center items-center mb-6">
        <div class="w-80 mx-auto">
          <DatePicker v-model="dateRange" range format="YYYY-MM-DD" value-format="YYYY-MM-DD"
            class="w-full border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            :placeholder="formattedDateRange" @change="handleDateChange" />
        </div>
      </div>

      <PaginatedTable :columns="tableColumns" :data="filteredTransactions" />
    </div>
  </div>
</template>