<script setup>
import { ref, computed, watch } from 'vue'

const { data, columns, pagination } = defineProps({
  data: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  pagination: {
    type: Boolean,
    required: false,
    default: true
  }
})

const currentPage = ref(1)
const itemsPerPage = 10
const isPaginated = ref(pagination)

const totalPages = computed(() => (data.length === 0 ? 0 : Math.ceil(data.length / itemsPerPage)))

const paginatedData = computed(() => {
  if (data.length === 0) return []
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return data.slice(start, end)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

watch(
  () => data,
  () => {
    currentPage.value = 1
  }
)
</script>

<template>
  <div class="overflow-x-auto shadow-md rounded-lg">
    <!-- Tabela -->
    <table class="min-w-full text-sm text-left text-gray-600 border-collapse border border-gray-300">
      <thead class="bg-gray-200">
        <tr>
          <th v-for="(column, index) in columns" :key="'header-' + index"
            class="border border-gray-300 px-4 py-2 text-left">
            {{ column }}
          </th>
        </tr>
      </thead>

      <tbody v-if="data.length != 0">
        <tr v-for="(row, rowIndex) in paginatedData" :key="'row-' + rowIndex" class="odd:bg-white even:bg-gray-100">
          <td v-for="(value, colIndex) in row" :key="'cell-' + rowIndex + '-' + colIndex"
            class="border border-gray-300 px-4 py-2 ">
            <div v-if="value === 'Ended' || value === 'Interrupted' || value === 'In Progress' || value === 'Pending'"
              class="relative flex items-center">
              <span class="absolute w-2.5 h-2.5 rounded-full pr-2" :class="{
                'bg-green-400': value === 'Ended', 'bg-red-400': value === 'Interrupted', 'bg-blue-400': value === 'In Progress', 'bg-yellow-400': value === 'Pending'
              }"></span>

              <span class="pl-4">{{ value }}</span>
            </div>
            <div class="flex flex-row space-x-2"
              v-else-if="value === 'MBWAY' || value === 'PAYPAL' || value === 'VISA' || value === 'MB' || value === 'IBAN'">
              <img :src="`/Store/${value}.png`" @click="hanglePayment(value)" alt="Payment Icon" :class="[
                'cursor-pointer',
                value === 'MBWAY' ? 'w-6 h-8' : '',
                value === 'PAYPAL' ? 'w-6 h-6' : '',
                value === 'VISA' ? 'w-6 h-6' : '',
                value === 'IBAN' ? 'w-6 h-6' : '',
                value === 'MB' ? 'w-6 h-6' : ''
              ]" />

              <div class="pt-1">
                {{ value }}
              </div>
            </div>
            <div v-else>
              {{ value }}
            </div>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="100%">
            <p style="color: gray; text-align: center; margin: 20px 0;">
              No data available
            </p>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Controles de Paginação -->
    <div v-if="isPaginated" class="flex items-center justify-between m-4">
      <div>
        <button @click="previousPage" :disabled="currentPage === 1 || totalPages === 0"
          class="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400">
          Previous
        </button>

        <button @click="nextPage" :disabled="currentPage === totalPages || totalPages === 0"
          class="ml-2 px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400">
          Next
        </button>
      </div>

      <span class="text-gray-600 mr-2">
        Page {{ totalPages === 0 ? 0 : currentPage }} of {{ totalPages }}
      </span>
    </div>
  </div>
</template>
