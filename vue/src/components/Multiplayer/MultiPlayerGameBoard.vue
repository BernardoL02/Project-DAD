<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useGameMultiplayerStore } from '@/stores/gameMultiplayer'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const storeGameMultiplayer = useGameMultiplayerStore()
const storeAuth = useAuthStore()

// Obtém o gameId dos query params
const gameId = route.query.gameId

// Busca o jogo ativo com base no ID
const gameData = computed(() => storeGameMultiplayer.getActiveGameById(Number(gameId)))

// Estados do jogo
const timer = computed(() => storeGameMultiplayer.timer)

// Função para iniciar o jogo
const startGame = () => {
    storeGameMultiplayer.startGame(gameId, (game) => {
        console.log('Game started:', game)
    })
}

// Função para virar a carta
const flipCard = (index) => {
    storeGameMultiplayer.flipCard(gameId, index)
}

onMounted(() => {
    startGame()
})

onUnmounted(() => {
    storeGameMultiplayer.stopTimer()
})

watch(gameData, (newValue) => {
    console.log("Game data received in client:", newValue)
})
</script>

<template>
    <div v-if="gameData" class="flex gap-10">
        <!-- Lista de Jogadores -->
        <div class="players-info p-4 bg-gray-50 w-64 rounded-lg">
            <h2 class="text-lg font-bold mb-4">Players</h2>
            <ul>
                <li v-for="(player, index) in gameData.players" :key="player.id"
                    class="flex items-center gap-4 mb-4 p-2 rounded-lg transition-transform duration-300" :class="{
                        'border-2 border-blue-500 scale-105': index === gameData.currentPlayerIndex,
                        'border border-gray-300': index !== gameData.currentPlayerIndex
                    }">
                    <img :src="storeAuth.getPhotoUrl(player.photo_filename)" alt="Player Photo"
                        class="w-12 h-12 rounded-full object-cover">
                    <div>
                        <p class="text-gray-700 font-medium">{{ player.nickname }}</p>
                        <p class="text-sm text-gray-500">Pares Encontrados: {{ player.pairsFound || 0 }}</p>
                    </div>
                </li>
            </ul>
        </div>

        <!-- Tabuleiro -->
        <div class="game-board grid gap-2 bg-gray-100 p-4 rounded-lg" :style="{
            gridTemplateRows: `repeat(${gameData.cols}, 1fr)`,
            gridTemplateColumns: `repeat(${gameData.rows}, 1fr)`
        }">
            <div v-for="(card, index) in gameData.board" :key="index" class="card relative w-24 h-36"
                @click="flipCard(index)">
                <div class="flip-card-inner w-full h-full transition-transform duration-500" :class="{
                    'rotate-y-180': !(gameData.matchedPairs.includes(index) || gameData.selectedCards.includes(index))
                }">
                    <!-- Frente da Carta -->
                    <div class="flip-card-front absolute w-full h-full backface-hidden">
                        <img :src="`/Cards/${card.id}.png`" alt="Card" class="w-full h-full object-cover rounded-lg">
                    </div>

                    <!-- Verso da Carta -->
                    <div class="flip-card-back absolute w-full h-full backface-hidden transform rotate-y-180">
                        <img src="/Cards/semFace.png" alt="Card Back" class="w-full h-full object-cover rounded-lg">
                    </div>
                </div>
            </div>
        </div>

        <!-- Timer e Total de Jogadas -->
        <div class="timer-info p-4 bg-gray-50 w-64 rounded-lg">
            <h2 class="text-lg font-bold mb-4">Game Info</h2>
            <p class="text-gray-700">Tempo: {{ timer }} seg</p>
            <p class="text-gray-700">Total de Jogadas: {{ gameData.totalMoves || 0 }}</p>
        </div>
    </div>
</template>

<style scoped>
.game-board {
    display: grid;
}

/* Efeito de virar a carta */
.card {
    perspective: 1000px;
}

.flip-card-inner {
    transform-style: preserve-3d;
    position: relative;
}

.flip-card-front,
.flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
}

.rotate-y-180 {
    transform: rotateY(180deg);
}

.card:hover .flip-card-inner {
    cursor: pointer;
}
</style>
