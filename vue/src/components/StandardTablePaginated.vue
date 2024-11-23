<script setup>
import { ref, computed } from 'vue'

// Recebe as propriedades com `defineProps`
const { columns, data } = defineProps({
    columns: {
        type: Array,
        required: true,
    },
    data: {
        type: Array,
        required: true,
    },
});

const currentPage = ref(1); // Página atual
const itemsPerPage = 10; // Itens por página

// Calcular o número total de páginas, considerando o caso quando data.length é 0
const totalPages = computed(() => data.length === 0 ? 0 : Math.ceil(data.length / itemsPerPage));

// Dados paginados da página atual
const paginatedData = computed(() => {
    if (data.length === 0) return []; // Retorna um array vazio se não houver dados
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end); // Usa `data` desestruturado
});

// Ir para a próxima página
const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

// Voltar para a página anterior
const previousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

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

            <tbody>
                <tr v-for="(row, rowIndex) in paginatedData" :key="'row-' + rowIndex"
                    class="odd:bg-white even:bg-gray-100">
                    <td v-for="(column, colIndex) in columns" :key="'cell-' + rowIndex + '-' + colIndex"
                        class="border border-gray-300 px-4 py-2">
                        <!-- Acesso dos dados com base no nome da coluna -->
                        {{ row[column.toLowerCase().replace(/\s+/g, '_')] || row[column] }}
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Controles de Paginação -->
        <div class="flex items-center justify-between m-4">
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
                <!-- Exibe "Page 0 of 0" quando não há dados -->
                Page {{ totalPages === 0 ? 0 : currentPage }} of {{ totalPages }}
            </span>
        </div>
    </div>
</template>
