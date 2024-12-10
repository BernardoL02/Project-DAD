<script setup>
import { useLobbyStore } from '@/stores/lobby'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const storeLobby = useLobbyStore()
const storeAuth = useAuthStore()

const myLobbies = computed(() =>
    storeLobby.games.filter(
        (game) => game.player1.id === storeAuth.user.id || game.players.some(player => player.id === storeAuth.user.id)
    )
);

const otherLobbies = computed(() =>
    storeLobby.games.filter(
        (game) => game.player1.id !== storeAuth.user.id && !game.players.some(player => player.id === storeAuth.user.id)
    )
);


</script>

<template>
    <div class="space-y-8 px-8">
        <!-- Lobbys Criados pelo Usuário -->
        <div v-if="myLobbies.length > 0">
            <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Your Lobbies</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div v-for="game in myLobbies" :key="game.id"
                    class="max-w-4xl p-4 border rounded-lg bg-white shadow-md mb-6 relative">

                    <div class="flex items-center space-x-4">
                        <div
                            class="w-24 h-36 bg-gray-200 rounded-lg flex flex-col items-center justify-center p-2 shadow-md relative">
                            <img :src="storeAuth.getPhotoUrl(game.player1.photo_filename)" alt="Player Avatar"
                                class="w-16 h-16 rounded-full mb-2" />
                            <img src="/king.png" alt="Crown"
                                class="absolute top-0 right-0 w-6 h-6 transform translate-x-2 -translate-y-2" />
                            <p class="text-gray-900 font-bold text-center text-sm">{{
                                storeAuth.getFirstLastName(game.player1.name) }}</p>
                        </div>

                        <div v-for="player in game.players.slice(1)" :key="player.id"
                            class="w-24 h-36 bg-gray-200 rounded-lg flex flex-col items-center justify-center p-2 shadow">
                            <img :src="storeAuth.getPhotoUrl(player.photo_filename)" alt="Player Avatar"
                                class="w-16 h-16 rounded-full mb-2" />
                            <p class="text-gray-900 font-bold text-center text-sm">{{
                                storeAuth.getFirstLastName(player.name) }}</p>
                            <span class="text-sm font-bold" :class="player.ready ? 'text-green-500' : 'text-red-500'">
                                {{ player.ready ? 'Ready' : 'UnReady' }}
                            </span>
                        </div>


                        <!-- Espaços disponíveis com botão "+" ou área escura sem "+" -->
                        <div v-for="i in game.maxPlayers - game.players.length" :key="i"
                            class="w-24 h-36 rounded-lg flex items-center justify-center" :class="{
                                'bg-gray-300 cursor-pointer hover:bg-green-500': game.player1.id !== storeAuth.user.id,
                                'bg-gray-400': game.player1.id === storeAuth.user.id
                            }"
                            @click="game.player1.id !== storeAuth.user.id ? storeLobby.joinGame(game.id) : null">
                            <span v-if="game.player1.id !== storeAuth.user.id"
                                class="text-gray-600 text-4xl hover:text-white">+</span>
                        </div>


                        <!-- Espaços extras para manter o layout alinhado como se fossem sempre 5 jogadores -->
                        <div v-for="i in 5 - game.maxPlayers" :key="'extra-' + i"
                            class="w-24 h-36 bg-transparent rounded-lg flex items-center justify-center">
                        </div>
                    </div>

                    <div class="mt-4 flex justify-between items-center">
                        <p class="text-gray-500 text-sm">
                            <strong>Board:</strong> ({{ game.board.board_cols }}x{{ game.board.board_rows }}) |
                            <strong>Players:</strong> {{ game.players.length }}/{{ game.maxPlayers }} |
                            Lobby ID: {{ game.id }}
                        </p>

                        <!-- Botões Ready e Leave para jogadores que não são donos -->
                        <div v-if="game.players.some(player => player.id === storeAuth.user.id && player.id !== game.player1.id)"
                            class="flex space-x-4">
                            <button @click="storeLobby.setReady(game.id, storeAuth.user.id)"
                                class="w-24 px-4 py-1 rounded text-white text-center"
                                :class="game.players.find(player => player.id === storeAuth.user.id)?.ready ? 'bg-red-500' : 'bg-green-500'">
                                {{ game.players.find(player => player.id === storeAuth.user.id)?.ready ? 'UnReady' :
                                    'Ready' }}
                            </button>

                            <button @click="storeLobby.leaveLobby(game.id)"
                                class="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600">
                                Leave
                            </button>
                        </div>

                        <!-- Botão Start Game e Leave para o dono -->
                        <div v-else class="flex space-x-4">
                            <button
                                :disabled="!(game.player1.id === storeAuth.user.id && game.players.length > 1 && game.players.slice(1).every(player => player.ready))"
                                @click="storeLobby.startGame(game.id)"
                                class="px-6 py-2 font-bold rounded shadow transition-colors" :class="{
                                    'bg-blue-500 text-white hover:bg-blue-600': game.player1.id === storeAuth.user.id,
                                    'bg-gray-400 text-gray-200 cursor-not-allowed': game.player1.id !== storeAuth.user.id
                                }">
                                Start Game
                            </button>

                            <!-- Botão Leave para o dono -->
                            <button @click="storeLobby.leaveLobby(game.id)"
                                class="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600">
                                Leave
                            </button>
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
                            v-for="player in game.players" :key="player.id">
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
                            class="w-24 h-36 bg-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-green-500"
                            @click="storeLobby.joinlobby(game.id)">
                            <span class="text-gray-600 text-4xl hover:text-white">+</span>
                        </div>

                        <!-- Espaços extras para manter o layout alinhado como se fossem sempre 5 jogadores -->
                        <div v-for="i in 5 - game.maxPlayers" :key="'extra-' + i"
                            class="w-24 h-36 bg-transparent rounded-lg flex items-center justify-center">
                        </div>
                    </div>

                    <!-- Informações adicionais do lobby com botão Ready/UnReady alinhado à direita -->
                    <div class="mt-4 flex justify-between items-center">
                        <p class="text-gray-500 text-sm">
                            <strong>Board:</strong> ({{ game.board.board_cols }}x{{ game.board.board_rows }}) |
                            <strong>Players:</strong> {{ game.players.length }}/{{ game.maxPlayers }} |
                            Lobby ID: {{ game.id }}
                        </p>
                        <!-- Div que contém os botões Ready e Leave -->
                        <div v-if="game.players.some(player => player.id === storeAuth.user.id)"
                            class="flex space-x-4 h-10">
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
