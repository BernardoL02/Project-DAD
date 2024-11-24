<script setup>
import { ref, computed, watch } from 'vue';

// Recebe as propriedades com `defineProps`
const { data, columns } = defineProps({
    data: {
        type: Array,
        required: true,
    },
    columns: {
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

// Reseta para a página 1 sempre que os dados mudarem
watch(() => data, () => {
    currentPage.value = 1;
});
</script>


<template>
    <div class="overflow-x-auto shadow-md rounded-lg">
        <!-- Tabela -->
        <table class="min-w-full text-sm text-left text-gray-600 border-collapse border border-gray-300">
            <thead class="bg-gray-200">
                <tr>
                    <!-- Cabeçalho da tabela: criando uma célula para cada nome de coluna vindo de `columns` -->
                    <th v-for="(column, index) in columns" :key="'header-' + index"
                        class="border border-gray-300 px-4 py-2 text-left">
                        {{ column }}
                    </th>
                </tr>
            </thead>

            <tbody>
                <!-- Percorre os dados paginados e exibe nas linhas -->
                <tr v-for="(row, rowIndex) in paginatedData" :key="'row-' + rowIndex"
                    class="odd:bg-white even:bg-gray-100">
                    <!-- Cada célula recebe o valor diretamente de cada dado na linha -->
                    <td v-for="(value, colIndex) in row" :key="'cell-' + rowIndex + '-' + colIndex"
                        class="border border-gray-300 px-4 py-2">
                        {{ value }}
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
                Page {{ totalPages === 0 ? 0 : currentPage }} of {{ totalPages }}
            </span>
        </div>
    </div>
</template>
