<script setup>
import { useLobbyStore } from '@/stores/lobby'
import { useAuthStore } from '@/stores/auth'
import { computed, ref, nextTick, onMounted, watch } from 'vue'
import ChatPanel from '@/components/Chat/ChatPanel.vue'
import { useErrorStore } from '@/stores/error'

const storeLobby = useLobbyStore()
const storeAuth = useAuthStore()
const storeError = useErrorStore()

const chatPanel = ref(null)
const openChats = storeLobby.openChats
const activeChatIndex = storeLobby.activeChatIndex

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




const handleSendMessage = ({ user, message }) => {
    console.log('handleSendMessage called with:', user, message)
    storeLobby.sendPrivateMessage(user, message)
}

watch(
    () => openChats[activeChatIndex.value]?.messages,
    (newMessages) => {
        if (chatPanel.value && openChats[activeChatIndex.value]) {
            chatPanel.value.openPanel(openChats[activeChatIndex.value].user, newMessages);
        }
    },
    { deep: true }
);


onMounted(() => {
    nextTick(() => {
        watch(
            () => chatPanel.value,
            (newVal) => {
                if (newVal) {
                    storeLobby.setChatPanel(newVal);
                    console.log('Chat panel ref set successfully.');
                }
            }
        );
    });
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
                                    <img :src="storeAuth.getPhotoUrl(game.player1.photo_filename)" alt="Player Avatar"
                                        class="w-16 h-16 rounded-full mb-2" />
                                    <img src="/king.png" alt="Crown"
                                        class="absolute top-0 right-0 w-6 h-6 transform translate-x-2 -translate-y-2" />
                                    <p class="text-gray-900 font-bold text-center text-sm">{{
                                        storeAuth.getFirstLastName(game.player1.name) }}</p>
                                </div>

                                <div v-for="player in game.players.slice(1)" :key="player.id"
                                    @click="storeLobby.openChatPanel(player)"
                                    class="w-24 h-36 bg-gray-200 rounded-lg flex flex-col items-center justify-center p-2 shadow">
                                    <img :src="storeAuth.getPhotoUrl(player.photo_filename)" alt="Player Avatar"
                                        class="w-16 h-16 rounded-full mb-2" />
                                    <p class="text-gray-900 font-bold text-center text-sm">{{
                                        storeAuth.getFirstLastName(player.name) }}</p>
                                    <span class="text-sm font-bold"
                                        :class="player.ready ? 'text-green-500' : 'text-red-500'">
                                        {{ player.ready ? 'Ready' : 'UnReady' }}
                                    </span>
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
                                <p class="text-gray-500 text-sm">
                                    <strong>Board:</strong> ({{ game.cols }}x{{ game.rows }}) |
                                    <strong>Players:</strong> {{ game.players.length }}/{{ game.maxPlayers }} |
                                    <strong>Lobby ID:</strong> {{ game.id }}
                                    <span v-if="game.status === 'started'"
                                        class="text-blue-500 font-bold ml-4">Playing...</span>
                                </p>

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
                <h2 v-show="storeLobby.isChatOpen" class="text-2xl font-bold mb-6 text-center text-gray-800">Your
                    Chats
                </h2>
                <div v-show="storeLobby.isChatOpen"
                    class="max-w-4xl p-4 border rounded-lg bg-white shadow-md mb-12 flex flex-col min-h-[300px]">
                    <!-- Abas de Chats -->
                    <div class="flex border-b">
                        <div v-for="(chat, index) in openChats" :key="chat.user.id"
                            @click="storeLobby.switchChatPanel(index)" class="p-2 cursor-pointer"
                            :class="['border-b-2', { 'border-blue-500 font-bold': index === storeLobby.activeChatIndex }]">
                            {{ chat.user.nickname }}
                            <button @click.stop="storeLobby.closeChat(index)" class="ml-2 text-red-500">x</button>
                        </div>
                    </div>

                    <!-- Painel de Chat Ativo ou Mensagem de Placeholder -->
                    <div class="flex-1 flex items-center justify-center">
                        <ChatPanel v-if="openChats.length > 0 && openChats[activeChatIndex]" ref="chatPanel"
                            :user="openChats[activeChatIndex]?.user" :messages="openChats[activeChatIndex]?.messages"
                            @send="handleSendMessage" />
                        <div v-else class="text-gray-400 italic">No chats open. Select a user to start chatting.
                        </div>
                    </div>
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
                            <img :src="storeAuth.getPhotoUrl(player.photo_filename)" alt="Player Avatar"
                                class="w-16 h-16 rounded-full mb-2" />
                            <img v-if="player.id === game.player1.id" src="/king.png" alt="Crown"
                                class="absolute top-0 right-0 w-6 h-6 transform translate-x-2 -translate-y-2" />
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
                        <p class="text-gray-500 text-sm">
                            <strong>Board:</strong> ({{ game.cols }}x{{ game.rows }}) |
                            <strong>Players:</strong> {{ game.players.length }}/{{ game.maxPlayers }} |
                            <strong>Lobby ID:</strong> {{ game.id }}
                            <span v-if="game.status === 'started'"
                                class="text-blue-500 font-bold ml-4">Playing...</span>
                        </p>
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