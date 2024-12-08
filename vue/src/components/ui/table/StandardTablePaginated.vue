<script setup>
import { ref, computed, watch } from 'vue'

const { data, columns, pagination, showActions } = defineProps({
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
  },
  showActions: {
    type: Boolean,
    required: false,
    default: true // Exibe as ações por padrão
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
          <!-- Cabeçalhos das colunas -->
          <th v-for="(column, index) in columns" :key="'header-' + index"
            class="border border-gray-300 px-4 py-2 text-left equal-width">
            {{ column }}
          </th>
          <th v-if="showActions" class="border border-gray-300 px-4 py-2 text-left equal-width">Actions</th>
        </tr>
      </thead>

      <tbody>
        <!-- Percorre as linhas da tabela -->
        <tr v-for="(row, rowIndex) in paginatedData" :key="'row-' + rowIndex" class="odd:bg-white even:bg-gray-100">
          <!-- Renderiza os valores das colunas especificadas -->
          <td v-for="(column, colIndex) in columns" :key="'cell-' + rowIndex + '-' + colIndex"
            class="border border-gray-300 px-4 py-2 equal-width">
            {{ row[column] }}
          </td>
          <!-- Coluna de Ações -->
          <td v-if="$slots.actions" class="border border-gray-300 px-4 py-2 equal-width action-cell">
            <!-- Slot para ações -->
            <slot name="actions" :row="row" />
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

<style scoped>
/* Garante que todas as colunas tenham a mesma largura */
.equal-width {
  width: calc(100% / var(--column-count));
}

/* Define a altura mínima para todas as células */
td,
th {
  min-height: 50px;
  /* Ajuste conforme necessário */
  vertical-align: middle;
  /* Centraliza o conteúdo verticalmente */
}

/* Caso precise de uma altura fixa */
.action-cell {
  height: 50px;
  /* Altere para fixar a altura, se necessário */
}

/* Define uma variável CSS para contar o número de colunas */
:root {
  --column-count: 8;
}
</style>
