<script setup>
import ListGamesLobby from './ListGamesLobby.vue'
import { useLobbyStore } from '@/stores/lobby'
import { useBoardStore } from '@/stores/board'
import { ref, onMounted, watch } from 'vue'

const storeLobby = useLobbyStore()
const storeBoard = useBoardStore()

const selectedBoard = ref(null) // Armazena o board selecionado

// Função para criar o jogo com o board selecionado
const createGameWithBoard = async () => {
    if (!selectedBoard.value) {
        alert('Please select a board before creating a game.')
        return
    }
    await storeLobby.CreateLobby(selectedBoard.value)
}

onMounted(() => {
    storeLobby.fetchGames()
    storeBoard.getBoards()
})

// Define o primeiro board como padrão assim que os boards forem carregados
watch(() => storeBoard.boards, (newBoards) => {
    if (newBoards.length > 0 && !selectedBoard.value) {
        selectedBoard.value = newBoards[0]
    }
})
</script>

<template>
    <div class="py-4">
        <select v-model="selectedBoard" class="border p-2 rounded">
            <option v-for="board in storeBoard.boards" :key="board.id" :value="board">
                {{ board.name }} ({{ board.board_cols }}x{{ board.board_rows }})
            </option>
        </select>

        <button @click="createGameWithBoard"
            class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105 ml-4">
            New Game
        </button>

        <div class="mt-8">
            <ListGamesLobby />
        </div>
    </div>
</template>
