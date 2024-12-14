<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'
import { useBoardStore } from '@/stores/board'
import { useTransactionStore } from '@/stores/transaction'
import { useLobbyStore } from '@/stores/lobby'

import PaginatedTable from '@/components/ui/table/StandardTablePaginated.vue'

const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()
const boardStore = useBoardStore()
const LobbyStore = useLobbyStore();

const transactionStore = useTransactionStore()

const tableColumns = [
  'Id',
  'Board',
  'Creator',
  'Winner',
  'Players',
  'Status',
  'Began At',
  'Total Time',
  'Pairs Discovered'
]


const lobbyId = ref('');

const joinLobby = () => {
  if (lobbyId.value) {
    LobbyStore.joinLobbyById(lobbyId.value);
  }
};

onMounted(async () => {
  await gameStore.getMultiPlayerGames()
  await boardStore.getBoards()
  await authStore.fetchProfile()

  if (gameStore.boardFilter === 'All') {
    gameStore.boardFilter = '3x4'
  }
})

const onBoardClick = (size) => {
  gameStore.handleBoardSizeChange(size)
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-8 space-y-6">
    <h1 class="text-3xl font-bold text-center mb-8">Multi-Player Mode</h1>

    <div class="bg-sky-100 p-6 rounded-xl shadow-lg flex justify-between items-center">
      <div>
        <p class="text-lg font-semibold">Welcome, {{ authStore.nickname }}</p>

        <div class="flex items-center pt-2 space-x-2">
          <img src="/coin.png" alt="Coin Icon" class="w-6 h-6 object-contain" />
          <span class="text-semibold font-bold">{{ authStore.coins }}</span>
        </div>
      </div>

      <RouterLink :to="{ name: 'multiPlayerHistory' }"
        class="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition duration-300">
        My Games
      </RouterLink>
    </div>

    <div class="bg-white p-4 rounded-xl shadow-lg">
      <div class="relative text-center mb-6 mr-4">
        <h2 class="text-2xl font-semibold text-center pl-5">View Lobbys</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          class="p-6 border rounded-lg flex flex-col items-center justify-center bg-gray-50 shadow-md hover:shadow-lg">
          <p class="text-lg font-bold">Choose Your Lobby</p>
          <p class="text-sm text-gray-500 mt-2">Browse and join a lobby now!</p>
          <p class="text-sm text-gray-500 mt-2">Required Coins - 5 coins</p>
          <div class="flex justify-center items-center mt-4 w-full">
            <RouterLink :to="{ name: 'lobbys' }" v-if="authStore.coins >= 5"
              class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-transform transform hover:scale-105"
              :class="{ 'opacity-50 cursor-not-allowed': authStore.coins < 5 }" :disabled="authStore.coins < 5">
              View Lobbies
            </RouterLink>
            <RouterLink v-else :to="{ name: 'store' }"
              class="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500 transition mt-8">
              Buy Coins
            </RouterLink>
          </div>
        </div>

        <div
          class="p-6 border rounded-lg flex flex-col items-center justify-center bg-gray-50 shadow-md hover:shadow-lg">
          <p class="text-lg font-bold">Join a Lobby</p>
          <p class="text-sm text-gray-500 mt-2">Enter a lobby code to join.</p>
          <p class="text-sm text-gray-500 mt-2">Required Coins - 5 coins</p>
          <input v-model="lobbyId" type="text" placeholder="Enter lobby code"
            class="w-full px-4 py-2 mt-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          <div class="flex justify-center items-center mt-4 w-full">
            <button @click="joinLobby" v-if="authStore.coins >= 5"
              class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-transform transform hover:scale-105"
              :class="{ 'opacity-50 cursor-not-allowed': authStore.coins < 5 }" :disabled="authStore.coins < 5">
              Join Lobby
            </button>
            <RouterLink v-else :to="{ name: 'store' }"
              class="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500 transition mt-8">
              Buy Coins
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <div class="pt-8">
      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <div class="relative text-center mb-6 mr-4">
          <p class="text-lg text-gray-700 font-semibold">Your Top 10 Multi-Player Games</p>

          <p class="text-sm text-gray-500 mt-2">
            This table shows your best performance across different board sizes.
          </p>

          <span class="absolute right-0 top-0 transform translate-x-4 translate-y-1">
            <span class="relative inline-block group">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition duration-200">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="8"></line>
                </svg>
              </span>

              <span
                class="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible flex flex-col right-[-335px] top-[-85px] mt-14 w-[300px] z-10 transition-all duration-300 ease-in-out">
                <div class="bg-white p-4 rounded-lg shadow-md mb-12 text-left">
                  <h2 class="text-lg font-bold text-gray-700">Multiplayer Stats</h2>
                  <p class="text-sm text-gray-500">Track your multiplayer performance.</p>

                  <div class="mt-3 grid grid-cols-1">
                    <div>
                      <p class="text-sm text-gray-700">
                        Total Victories -
                        <span class="text-sm text-green-500">{{
                          gameStore.totalMultiplayerVictorys
                        }}</span>
                      </p>
                      <p class="text-sm text-gray-700">
                        Total Losses -
                        <span class="text-sm text-red-500">{{
                          gameStore.totalMultiplayerLosses
                        }}</span>
                      </p>

                      <p class="text-sm text-gray-700">
                        Win/Loss Ratio -
                        <span class="text-sm text-gray-500">
                          {{
                            (
                              gameStore.totalMultiplayerVictorys / gameStore.totalMultiplayerLosses
                            ).toFixed(2) || 0
                          }}
                        </span>
                      </p>
                      <p class="text-sm text-gray-700">
                        Total Game Time Played -
                        <span class="text-sm text-gray-500">
                          {{ gameStore.totalTimePlayedMultiPlayer }} minutes
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </span>
            </span>
          </span>
        </div>

        <div class="flex justify-center pt-2">
          <div class="flex flex-row gap-8">
            <button v-for="board in boardStore.boards" :key="board.id"
              @click="onBoardClick(board.board_cols + 'x' + board.board_rows)" :class="{
                'bg-sky-500 text-white':
                  board.board_cols + 'x' + board.board_rows == gameStore.boardFilter,
                'bg-gray-200 hover:bg-gray-300 text-gray-700':
                  board.board_cols + 'x' + board.board_rows != gameStore.boardFilter
              }" class="px-4 py-1 rounded-md border transition-all duration-300">
              {{ board.board_cols + 'x' + board.board_rows }}
            </button>
          </div>
        </div>
      </div>

      <PaginatedTable :columns="tableColumns" :data="gameStore.bestResultsMultiplayer" :pagination="false" />

      <div class="bg-white p-6 rounded-lg shadow-md mt-6">
        <p class="text-sm text-gray-700 font-semibold mb-1">Sorting Criteria</p>
        <p class="text-xs text-gray-500">
          1. <strong>Best Time</strong> - The fastest time you achieved for completing games.
          <br />2. <strong>Pairs Discovered</strong> - The total number of pairs you discovered
          during the game. <br />3. <strong>Number of Players</strong> - The total number of
          participants in the game.
        </p>
      </div>
    </div>
  </div>
</template>
