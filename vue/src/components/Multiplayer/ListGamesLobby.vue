<script setup>
import { useLobbyStore } from '@/stores/lobby'
import { useAuthStore } from '@/stores/auth'
import { computed, ref, nextTick, onMounted, watch } from 'vue'
import ChatPanel from '@/components/Chat/ChatPanel.vue'
import { useErrorStore } from '@/stores/error'

const storeLobby = useLobbyStore()
const storeAuth = useAuthStore()
const storeError = useErrorStore()

const myLobbies = computed(() =>
    storeLobby.games.filter(
        (game) =>
            (game.player1.id === storeAuth.user.id || game.players.some(player => player.id === storeAuth.user.id)) &&
            (game.status === 'waiting' || game.status === 'started')
    )
)

const otherLobbies = computed(() =>
    storeLobby.games.filter(
        (game) =>
            !(game.player1.id === storeAuth.user.id || game.players.some(player => player.id === storeAuth.user.id)) &&
            (game.status === 'waiting' || game.status === 'started')
    )
)

const chatPanel = ref(null);

const handleSendMessage = ({ user, message }) => {
    storeLobby.sendPrivateMessage(user, message);
};

const handleCloseChat = (index) => {
    storeLobby.closeChat(index);
};

const handleSwitchChat = (index) => {
    storeLobby.switchChatPanel(index);
};

onMounted(() => {
    storeLobby.loadChatsFromSession();
    storeLobby.isChatOpen = false
});

</script>


<template>
    <div class="px-8 space-y-8">
        <!-- Coluna de Lobbies -->
        <div class="grid grid-cols-1 gap-6"
            :class="{ 'md:grid-cols-1': !storeLobby.isChatOpen, 'md:grid-cols-2': storeLobby.isChatOpen }">
            <div class="space-y-8">
                <!-- Lobbys Criados pelo Usuário -->
                <div v-if="myLobbies.length > 0">
                    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Your Lobbies</h2>
                    <div class="grid grid-cols-1 gap-6"
                        :class="{ 'md:grid-cols-1': storeLobby.isChatOpen, 'md:grid-cols-2': !storeLobby.isChatOpen }">
                        <div v-for="game in myLobbies" :key="game.id"
                            class="max-w-4xl p-4 border rounded-lg bg-white shadow-md mb-6 relative">

                            <div class="flex items-center space-x-4">
                                <div @click="storeLobby.openChatPanel(game.player1)"
                                    class="w-24 h-36 bg-gray-200 rounded-lg flex flex-col items-center justify-center p-2 shadow-md relative">

                                    <div class="relative mt-4"> <!-- Adiciona uma margem superior -->
                                        <img :src="storeAuth.getPhotoUrl(game.player1.photo_filename)"
                                            alt="Player Avatar" class="w-16 h-16 rounded-full mb-2" />

                                        <!-- Botão de Chat Posicionado no Avatar -->
                                        <button v-if="game.player1.id !== storeAuth.user.id"
                                            @click="storeLobby.openChatPanel(player)"
                                            class="absolute bottom-0 left-0 bg-blue-500 text-white rounded-full p-0.5 hover:bg-blue-600 shadow-md">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                                viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.314 0-2.55-.263-3.662-.732C7.114 20.55 4 21 4 21l1.441-3.602A8.96 8.96 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </button>
                                    </div>

                                    <!-- Ícone de Coroa -->
                                    <img src="/king.png" alt="Crown"
                                        class="absolute top-0 right-0 w-6 h-6 transform translate-x-2 -translate-y-2" />

                                    <!-- Nome do Jogador -->
                                    <p class="text-gray-900 font-bold text-center text-sm">
                                        {{ storeAuth.getFirstLastName(game.player1.name) }}
                                    </p>
                                </div>


                                <div v-for="player in game.players.slice(1)" :key="player.id"
                                    class="w-24 h-36 bg-gray-200 rounded-lg flex flex-col items-center justify-center p-2 shadow relative group"
                                    @click.stop="storeLobby.openChatPanel(player)">

                                    <!-- Avatar do Jogador com Margem -->
                                    <div class="relative mt-4"> <!-- Adiciona uma margem superior -->
                                        <img :src="storeAuth.getPhotoUrl(player.photo_filename)" alt="Player Avatar"
                                            class="w-16 h-16 rounded-full mb-2" />

                                        <!-- Botão de Chat Posicionado no Avatar -->
                                        <button v-if="player.id !== storeAuth.user.id"
                                            @click.stop="storeLobby.openChatPanel(player)"
                                            class="absolute bottom-0 left-0 bg-blue-500 text-white rounded-full p-0.5 hover:bg-blue-600 shadow-md">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                                viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.314 0-2.55-.263-3.662-.732C7.114 20.55 4 21 4 21l1.441-3.602A8.96 8.96 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </button>
                                    </div>

                                    <!-- Nome do Jogador -->
                                    <p class="text-gray-900 font-bold text-center text-sm mb-1">
                                        {{ storeAuth.getFirstLastName(player.name) }}
                                    </p>

                                    <!-- Status Ready/UnReady -->
                                    <span class="text-sm font-bold mb-2"
                                        :class="player.ready ? 'text-green-500' : 'text-red-500'">
                                        {{ player.ready ? 'Ready' : 'UnReady' }}
                                    </span>

                                    <!-- Botão de Remoção (X) -->
                                    <button v-if="game.player1.id === storeAuth.user.id"
                                        @click.stop="storeLobby.removePlayer(game.id, player.id)"
                                        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 shadow-md">
                                        &times;
                                    </button>
                                </div>


                                <!-- Espaços disponíveis com botão "+" ou área escura sem "+" -->
                                <div v-for="i in game.maxPlayers - game.players.length" :key="i"
                                    class="w-24 h-36 rounded-lg flex items-center justify-center" :class="{
                                        'bg-gray-300 cursor-pointer hover:bg-green-500': game.status !== 'started' && game.player1.id !== storeAuth.user.id,
                                        'bg-gray-400': game.status === 'started' || game.player1.id === storeAuth.user.id
                                    }"
                                    @click="game.status !== 'started' && game.player1.id !== storeAuth.user.id ? storeLobby.joinGame(game.id) : null">
                                    <span v-if="game.status !== 'started' && game.player1.id !== storeAuth.user.id"
                                        class="text-gray-600 text-4xl hover:text-white">+</span>
                                </div>


                                <!-- Espaços extras para manter o layout alinhado como se fossem sempre 5 jogadores -->
                                <div v-for="i in 5 - game.maxPlayers" :key="'extra-' + i"
                                    class="w-24 h-36 bg-transparent rounded-lg flex items-center justify-center">
                                </div>
                            </div>

                            <div class="mt-4 flex justify-between items-center">
                                <div class="mt-4 flex flex-col space-y-2">
                                    <p class="text-gray-500 text-sm">
                                        <strong>Board:</strong> ({{ game.cols }}x{{ game.rows }}) |
                                        <strong>Players:</strong> {{ game.players.length }}/{{ game.maxPlayers }} |
                                        <strong>Lobby ID:</strong> {{ game.id }}
                                        <span v-if="game.status === 'started'"
                                            class="text-blue-500 font-bold ml-4">Playing...</span>
                                    </p>
                                    <p v-if="game.status !== 'started'" class=" text-gray-500 text-sm">
                                        <strong>Expires in:</strong> {{ storeLobby.timeRemaining(game.expires_at) }}
                                    </p>
                                </div>

                                <!-- Botões Ready e Leave para jogadores que não são donos -->
                                <div v-if="game.players.some(player => player.id === storeAuth.user.id && player.id !== game.player1.id) && game.status !== 'started'"
                                    class="flex space-x-4">
                                    <button @click="storeLobby.setReady(game.id, storeAuth.user.id)"
                                        class="w-24 px-4 py-1 rounded text-white text-center"
                                        :class="game.players.find(player => player.id === storeAuth.user.id)?.ready ? 'bg-red-500' : 'bg-green-500'">
                                        {{ game.players.find(player => player.id === storeAuth.user.id)?.ready ?
                                            'UnReady' : 'Ready' }}
                                    </button>

                                    <button @click="storeLobby.leaveLobby(game.id)"
                                        class="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600">
                                        Leave
                                    </button>
                                </div>


                                <!-- Botão Start Game e Leave para o dono -->
                                <div v-else-if="game.status !== 'started'" class="flex space-x-4">
                                    <button
                                        :disabled="game.player1.id !== storeAuth.user.id || game.players.length <= 1 || !game.players.slice(1).every(player => player.ready)"
                                        @click="storeLobby.startGame(game.id)"
                                        class="px-6 py-2 font-bold rounded shadow transition-colors" :class="{
                                            'bg-blue-500 text-white hover:bg-blue-600': game.player1.id === storeAuth.user.id && game.players.length > 1 && game.players.slice(1).every(player => player.ready),
                                            'bg-gray-400 text-gray-200 cursor-not-allowed': game.player1.id !== storeAuth.user.id || game.players.length <= 1 || !game.players.slice(1).every(player => player.ready)
                                        }">
                                        Start Game
                                    </button>

                                    <button @click="storeLobby.leaveLobby(game.id)"
                                        class="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600">
                                        Leave
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Coluna do Chat -->
            <div>
                <div v-if="storeLobby.isChatOpen">
                    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Your Chats</h2>
                    <ChatPanel :openChats="storeLobby.openChats" :activeChatIndex="storeLobby.activeChatIndex"
                        @send="handleSendMessage" @closeChat="handleCloseChat" @switchChat="handleSwitchChat" />
                </div>
            </div>
        </div>

        <!-- Outros Lobbys Disponíveis -->
        <div v-if="otherLobbies.length > 0">
            <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Available Lobbies</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div v-for="game in otherLobbies" :key="game.id"
                    class="max-w-4xl p-4 border rounded-lg bg-white shadow-md mb-6">
                    <div class="flex items-center space-x-2 justify-center">
                        <!-- Retângulos dos jogadores existentes -->
                        <div class="w-24 h-36 bg-gray-200 rounded-lg flex flex-col items-center justify-center p-2 relative"
                            @click="storeLobby.openChatPanel(player)" v-for="player in game.players" :key="player.id">
                            <!-- Foto do Jogador -->
                            <div class="relative mt-4"> <!-- Adiciona uma margem superior -->
                                <img :src="storeAuth.getPhotoUrl(player.photo_filename)" alt="Player Avatar"
                                    class="w-16 h-16 rounded-full mb-2" />

                                <!-- Botão de Chat Posicionado no Avatar -->
                                <button v-if="player.id !== storeAuth.user.id"
                                    @click.stop="storeLobby.openChatPanel(player)"
                                    class="absolute bottom-0 left-0 bg-blue-500 text-white rounded-full p-0.5 hover:bg-blue-600 shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.314 0-2.55-.263-3.662-.732C7.114 20.55 4 21 4 21l1.441-3.602A8.96 8.96 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </button>
                            </div>
                            <!-- Ícone de Coroa para o Dono do Lobby -->
                            <img v-if="player.id === game.player1.id" src="/king.png" alt="Crown"
                                class="absolute top-0 right-0 w-6 h-6 transform translate-x-2 -translate-y-2" />
                            <!-- Nome do Jogador -->
                            <p class="text-gray-900 font-bold text-center text-sm">
                                {{ storeAuth.getFirstLastName(player.name) }}
                            </p>

                            <!-- Texto Ready/UnReady abaixo da foto -->
                            <span v-if="player.id !== game.player1.id" class="text-sm font-bold mt-1"
                                :class="player.ready ? 'text-green-500' : 'text-red-500'">
                                {{ player.ready ? 'Ready' : 'UnReady' }}
                            </span>
                        </div>


                        <!-- Espaços disponíveis com botão "+" -->
                        <div v-for="i in game.maxPlayers - game.players.length" :key="i"
                            class="w-24 h-36 rounded-lg flex items-center justify-center" :class="{
                                'bg-gray-300 cursor-pointer hover:bg-green-500': game.status !== 'started',
                                'bg-gray-400': game.status === 'started'
                            }" @click="game.status !== 'started' ? storeLobby.joinlobby(game.id) : null">
                            <span v-if="game.status !== 'started'"
                                class="text-gray-600 text-4xl hover:text-white">+</span>
                        </div>


                        <!-- Espaços extras para manter o layout alinhado como se fossem sempre 5 jogadores -->
                        <div v-for="i in 5 - game.maxPlayers" :key="'extra-' + i"
                            class="w-24 h-36 bg-transparent rounded-lg flex items-center justify-center">
                        </div>
                    </div>

                    <!-- Informações adicionais do lobby com botão Ready/UnReady alinhado à direita -->
                    <div class="mt-4 flex justify-between items-center">
                        <div class="mt-4 flex flex-col space-y-2">
                            <p class="text-gray-500 text-sm">
                                <strong>Board:</strong> ({{ game.cols }}x{{ game.rows }}) |
                                <strong>Players:</strong> {{ game.players.length }}/{{ game.maxPlayers }} |
                                <strong>Lobby ID:</strong> {{ game.id }}
                                <span v-if="game.status === 'started'"
                                    class="text-blue-500 font-bold ml-4">Playing...</span>
                            </p>
                            <p v-if="game.status !== 'started'" class="text-gray-500 text-sm">
                                <strong>Expires in:</strong> {{ storeLobby.timeRemaining(game.expires_at) }}
                            </p>
                        </div>
                        <!-- Div que contém os botões Ready e Leave -->
                        <div v-if="game.players.some(player => player.id === storeAuth.user.id) && game.status !== 'started'"
                            class="flex space-x-4 h-10">
                            <!-- Botão Ready/UnReady -->
                            <button @click="storeLobby.setReady(game.id, storeAuth.user.id)"
                                class="w-24 px-4 py-1 rounded text-white text-center"
                                :class="game.players.find(player => player.id === storeAuth.user.id)?.ready ? 'bg-red-500' : 'bg-green-500'">
                                {{ game.players.find(player => player.id === storeAuth.user.id)?.ready ? 'UnReady' :
                                    'Ready' }}
                            </button>

                            <!-- Botão Leave Lobby -->
                            <button @click="storeLobby.leaveLobby(game.id)"
                                class="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 transition-transform transform hover:scale-105">
                                Leave
                            </button>
                        </div>


                        <!-- Placeholder para manter o espaço fixo caso os botões não estejam presentes -->
                        <div v-else class="h-10"></div>
                    </div>
                </div>
            </div>
        </div>


        <!-- Mensagem Caso Não Haja Lobbys -->
        <div v-if="myLobbies.length === 0 && otherLobbies.length === 0" class="text-center text-gray-500">
            No lobbies available. Create a new one!
        </div>
    </div>
</template>

<style scoped>
.grid {
    gap: 1rem;
}

button {
    transition: background-color 0.3s, transform 0.2s;
}

button:hover {
    transform: scale(1.05);
}
</style>