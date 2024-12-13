<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useGameMultiplayerStore } from '@/stores/gameMultiplayer'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import ChatPanel from '@/components/Chat/ChatPanel.vue'
import { useLobbyStore } from '@/stores/lobby'

const route = useRoute()
const router = useRouter()
const storeGameMultiplayer = useGameMultiplayerStore()
const storeAuth = useAuthStore()
const storeLobby = useLobbyStore()

// Obtém o gameId dos query params
const gameId = route.query.gameId

// Busca o jogo ativo com base no ID
const gameData = computed(() => storeGameMultiplayer.getActiveGameById(Number(gameId)))

// Estados do jogo
const timer = computed(() => {
    return isNaN(storeGameMultiplayer.timer) ? 0 : storeGameMultiplayer.timer
})

const circleStyle = computed(() => {
    const radius = 18
    const circumference = 2 * Math.PI * radius
    const progress = storeGameMultiplayer.turnTimer / 20
    const offset = circumference * (1 - progress)

    return {
        strokeDasharray: `${circumference}`,
        strokeDashoffset: `${offset}`
    }
})

const lastTurnTimer = ref(storeGameMultiplayer.turnTimer);
const animateCountdown = ref(false);

// Observa mudanças no turnTimer para ativar a animação
watch(() => storeGameMultiplayer.turnTimer, (newVal) => {
    if (newVal <= 5 && newVal !== lastTurnTimer.value) {
        animateCountdown.value = true;
        lastTurnTimer.value = newVal;

        // Remove a classe de animação após 300ms (duração da animação)
        setTimeout(() => {
            animateCountdown.value = false;
        }, 300);
    }
});


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
    console.log('Confirmar saída chamado')
    storeGameMultiplayer.stopTimer()
    storeGameMultiplayer.stopTurnTimer()
    storeGameMultiplayer.leaveGameLobby(Number(gameId))
    showModal.value = false
    allowNavigation = true

    if (pendingRoute) {
        router.push(pendingRoute).catch(err => console.error('Erro ao redirecionar:', err))
        pendingRoute = null
    } else {
        router.push('/multiplayer/lobbys')
    }
}

const cancelExit = () => {
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
    nextTick(() => {
        if (chatPanel.value) {
            storeLobby.setChatPanel(chatPanel.value);
            console.log('Chat panel ref set successfully.');
        }
    });
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
    storeLobby.loadChatsFromSession();
    storeLobby.isChatOpen = true
});



const handleSendMessage = ({ user, message }) => {
    storeLobby.sendPrivateMessage(user, message);
};

const handleSwitchChat = (index) => {
    storeLobby.switchChatPanel(index);
};

const handleCloseChat = (index) => {
    storeLobby.closeChat(index);
};


onUnmounted(() => {
    if (unregisterGuard) unregisterGuard();
    window.removeEventListener('beforeunload', handleBeforeUnload)
    storeGameMultiplayer.stopTimer()
    storeGameMultiplayer.stopTurnTimer()
})

watch(gameData, (newValue) => {
    console.log("Game data received in client:", newValue)
})
</script>

<template>
    <div v-if="gameData" class="flex gap-10 items-start">
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

                    <!-- Foto e Timer -->
                    <div class="relative w-12 h-12">
                        <img :src="storeAuth.getPhotoUrl(player.photo_filename)" alt="Player Photo"
                            class="w-12 h-12 rounded-full object-cover transition-transform duration-300">

                        <!-- Timer Circle -->
                        <svg v-if="index === gameData.currentPlayerIndex" class="absolute inset-0 w-12 h-12 z-10"
                            viewBox="0 0 40 40">
                            <circle cx="20" cy="20" r="18" fill="none" stroke="#e0e0e0" stroke-width="4" />
                            <circle cx="20" cy="20" r="18" fill="none" stroke="#4caf50" stroke-width="4"
                                :style="circleStyle" stroke-linecap="round" />
                        </svg>

                        <!-- Contador dos últimos 5 segundos -->
                        <div v-if="index === gameData.currentPlayerIndex && storeGameMultiplayer.turnTimer <= 5"
                            class="absolute inset-0 flex items-center justify-center text-black font-bold text-xl z-30"
                            :class="{ 'zoom-animation': animateCountdown }">
                            {{ storeGameMultiplayer.turnTimer }}
                        </div>

                        <!-- Botão de Chat -->
                        <button v-if="player.id !== storeAuth.user.id" @click.stop="storeLobby.openChatPanel(player)"
                            class="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 shadow-md z-20">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 20 20"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.314 0-2.55-.263-3.662-.732C7.114 20.55 4 21 4 21l1.441-3.602A8.96 8.96 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </button>
                    </div>



                    <!-- Informações do Jogador -->
                    <div>
                        <p class="text-gray-700 font-medium">{{ player.nickname }}</p>
                        <p class="text-sm text-gray-500">Pairs Found: {{ player.pairsFound || 0 }}</p>
                    </div>

                    <!-- Indicador de Jogador Inativo -->
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

        <!-- Timer, Game Info, and Chat Panel Section -->
        <div class="info-chat-container w-full max-w-lg">
            <!-- Timer and Total Moves -->
            <div class="timer-info p-4 bg-gray-50 rounded-lg bg-gray-100 mb-4">
                <h2 class="text-lg font-bold mb-4">Game Info</h2>
                <p class="text-gray-700">Total Game Time: {{ timer }} sec</p>
                <p class="text-gray-700">Total Moves: {{ gameData.totalMoves || 0 }}</p>
            </div>

            <!-- Chat Panel -->
            <div>
                <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Your Chats</h2>
                <ChatPanel :openChats="storeLobby.openChats" :activeChatIndex="storeLobby.activeChatIndex"
                    @send="handleSendMessage" @closeChat="handleCloseChat" @switchChat="handleSwitchChat" />
            </div>
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

.zoom-animation {
    animation: zoomEffect 0.3s ease;
}

.info-chat-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 300px;
    /* Ajuste conforme necessário */
}

.chat-panel-container {
    height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.info-chat-container {
    width: 300px;
    /* Largura fixa */
    max-width: 300px;
    /* Certifique-se de que não expanda */
}

.relative {
    position: relative;
}

button {
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
}

button:hover {
    transform: scale(1.1);
}

.zoom-animation {
    animation: zoomEffect 0.3s ease;
}

@keyframes zoomEffect {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(2);
    }

    100% {
        transform: scale(1);
    }
}
</style>
