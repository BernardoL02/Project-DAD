<script setup>
import ListGamesLobby from './ListGamesLobby.vue'
import { useLobbyStore } from '@/stores/lobby'
import { useBoardStore } from '@/stores/board'
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const storeLobby = useLobbyStore()
const storeBoard = useBoardStore()
const authStore = useAuthStore()

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
    <div class="bg-sky-100 p-6 rounded-xl shadow-lg flex justify-between items-center">
        <div>
            <p class="text-lg font-semibold">Welcome, {{ authStore.nickname }}</p>

            <div class="flex items-center pt-2 space-x-2">
                <img src="/coin.png" alt="Coin Icon" class="w-6 h-6 object-contain" />
                <span class="font-bold text-gray-700">{{ authStore.coins }}</span>
            </div>
        </div>

        <div class="flex items-center space-x-4">
            <div class="relative">
                <select v-model="selectedBoard"
                    class="border p-2 rounded-lg bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300">
                    <option v-for="board in storeBoard.boards" :key="board.id" :value="board">
                        {{ board.name }} ({{ board.board_cols }}x{{ board.board_rows }})
                    </option>
                </select>
            </div>

            <button @click="createGameWithBoard"
                class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105 shadow-md">
                New Game
            </button>
            <!-- Botão para mostrar/esconder o Chat -->
            <button @click="storeLobby.toggleChat(!storeLobby.isChatOpen)"
                class="w-32 text-base bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-transform transform hover:scale-105 shadow-md text-center">
                {{ storeLobby.isChatOpen ? 'Hide Chats' : 'Chats' }}
            </button>

        </div>
    </div>

    <div class="py-4">
        <div class="mt-8">
            <ListGamesLobby />
        </div>
    </div>
</template>
