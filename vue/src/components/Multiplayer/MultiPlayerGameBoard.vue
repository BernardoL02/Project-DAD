<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useGameMultiplayerStore } from '@/stores/gameMultiplayer'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const storeGameMultiplayer = useGameMultiplayerStore()
const storeAuth = useAuthStore()

// Obtém o gameId dos query params
const gameId = route.query.gameId

// Busca o jogo ativo com base no ID
const gameData = computed(() => storeGameMultiplayer.getActiveGameById(Number(gameId)))

// Estados do jogo
const timer = computed(() => {
    return isNaN(storeGameMultiplayer.timer) ? 0 : storeGameMultiplayer.timer
})


// Função para iniciar o jogo
const startGame = () => {
    storeGameMultiplayer.startGame(gameId, (game) => {
        console.log('Game started:', game)
    })
}


const invalidAttemptPlayerId = ref(null);

const flipCard = (index) => {
    if (!storeGameMultiplayer.isCurrentPlayerTurn) {
        invalidAttemptPlayerId.value = gameData.value.players[gameData.value.currentPlayerIndex].id;
        setTimeout(() => {
            invalidAttemptPlayerId.value = null;
        }, 500); // Duração do efeito (500ms)
        return;
    }

    storeGameMultiplayer.flipCard(gameId, index);
};



const showModal = ref(false)
let pendingRoute = null
let allowNavigation = false;
let unregisterGuard = null

const confirmExit = () => {
    console.log('Confirmar saída chamado');
    storeGameMultiplayer.stopTimer();
    storeGameMultiplayer.leaveGameLobby(Number(gameId));
    showModal.value = false;
    allowNavigation = true;

    if (pendingRoute) {
        router.push(pendingRoute).catch(err => console.error('Erro ao redirecionar:', err));
        pendingRoute = null;
    } else {
        router.push('/multiplayer/lobbys');
    }
};

const cancelExit = () => {
    console.log('Cancelar saída chamado');
    showModal.value = false;
    pendingRoute = null;
};

const handleBeforeUnload = (event) => {
    event.preventDefault();
    // Apenas sai dos lobbies ao fechar ou recarregar a página
    storeGameMultiplayer.leaveAllLobbies();
    event.returnValue = '';
};


onMounted(() => {
    unregisterGuard = router.beforeEach((to, from, next) => {
        console.log('beforeEach chamado:', from.path, to.fullPath);

        if (storeGameMultiplayer.gameOver) {
            allowNavigation = true;
        }

        if (allowNavigation) {
            allowNavigation = false;
            next();
        } else if (from.path.startsWith('/multiplayer/game') && !showModal.value) {
            showModal.value = true;
            pendingRoute = to.fullPath;
            next(false);
        } else {
            next();
        }
    });
    window.addEventListener('beforeunload', handleBeforeUnload);
    startGame();
});



onUnmounted(() => {
    if (unregisterGuard) unregisterGuard();
    window.removeEventListener('beforeunload', handleBeforeUnload)
    storeGameMultiplayer.stopTimer()
})

watch(gameData, (newValue) => {
    console.log("Game data received in client:", newValue)
})
</script>

<template>
    <div v-if="gameData" class="flex gap-10">
        <!-- Players List -->
        <div class="players-info p-4 bg-gray-50 w-64 rounded-lg">
            <h2 class="text-lg font-bold mb-4">Players</h2>
            <ul>
                <li v-for="(player, index) in gameData.players" :key="player.id"
                    class="flex items-center gap-4 mb-4 p-2 rounded-lg transition-transform duration-300 relative"
                    :class="{
                        'border-2 border-blue-500': index === gameData.currentPlayerIndex && !player.inactive,
                        'border border-gray-300 opacity-50': player.inactive,
                        'border border-gray-300': index !== gameData.currentPlayerIndex || player.inactive,
                        'scale-110': invalidAttemptPlayerId === player.id
                    }">

                    <img :src="storeAuth.getPhotoUrl(player.photo_filename)" alt="Player Photo"
                        class="w-12 h-12 rounded-full object-cover transition-transform duration-300">

                    <div>
                        <p class="text-gray-700 font-medium">{{ player.nickname }}</p>
                        <p class="text-sm text-gray-500">Pairs Found: {{ player.pairsFound || 0 }}</p>
                    </div>

                    <div v-if="player.inactive"
                        class="absolute inset-0 flex items-center justify-center text-red-500 font-bold">
                        Leave
                    </div>
                </li>
            </ul>
        </div>

        <!-- Game Board -->
        <div class="game-board grid gap-2 bg-gray-100 p-4 rounded-lg" :style="{
            gridTemplateRows: `repeat(${gameData.cols}, 1fr)`,
            gridTemplateColumns: `repeat(${gameData.rows}, 1fr)`
        }">
            <div v-for="(card, index) in gameData.board" :key="index" class="card relative w-24 h-36"
                @click="flipCard(index)">
                <div class="flip-card-inner w-full h-full transition-transform duration-500" :class="{
                    'rotate-y-180': !(gameData.matchedPairs.includes(index) || gameData.selectedCards.includes(index))
                }">
                    <!-- Card Front -->
                    <div class="flip-card-front absolute w-full h-full backface-hidden">
                        <img :src="`/Cards/${card.id}.png`" alt="Card" class="w-full h-full object-cover rounded-lg">
                    </div>

                    <!-- Card Back -->
                    <div class="flip-card-back absolute w-full h-full backface-hidden transform rotate-y-180">
                        <img src="/Cards/semFace.png" alt="Card Back" class="w-full h-full object-cover rounded-lg">
                    </div>
                </div>
            </div>
        </div>

        <!-- Timer and Total Moves -->
        <div class="timer-info p-4 bg-gray-50 w-64 rounded-lg">
            <h2 class="text-lg font-bold mb-4">Game Info</h2>
            <p class="text-gray-700">Time: {{ timer }} sec</p>
            <p class="text-gray-700">Total Moves: {{ gameData.totalMoves || 0 }}</p>
        </div>

        <!-- Confirmation Modal -->
        <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div class="bg-white p-6 rounded shadow-md w-96">
                <h2 class="text-xl font-bold mb-4">Confirmation</h2>
                <p class="mb-4">
                    Are you sure you want to leave the game? <br />
                    Your progress will be lost.
                </p>
                <div class="flex justify-end space-x-4">
                    <button class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" @click="cancelExit">
                        Cancel
                    </button>
                    <button class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" @click="confirmExit">
                        Leave
                    </button>
                </div>
            </div>
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
