<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '@/stores/profile';
import { useGameStore } from '@/stores/game'
import { useBoardStore } from '@/stores/board'
import { useTransactionStore } from '@/stores/transaction';

import PaginatedTable from '@/components/StandardTablePaginated.vue'

const router = useRouter();
const profileStore = useProfileStore();
const gameStore = useGameStore()
const boardStore = useBoardStore()

const transactionStore = useTransactionStore();

const tableColumns = ['Id', 'Board', 'Creator', 'Winner', 'Players', 'Status', 'Began At', 'Total Time', 'Pairs Discovered']

onMounted(async () => {
    await gameStore.getMultiPlayerGames();
    await boardStore.getBoards();

    if (gameStore.boardFilter === "All") {
        gameStore.boardFilter = "3x4"
    }
});

const startGame = async (size, cost, board_id) => {
    var gameId = 0;
    if (profileStore.userProfile) {
        if (profileStore.coins < cost) {
            alert("You don't have enough brain coins to play on this board!");
            return;
        }

        try {
            gameId = await gameStore.createSinglePlayer(board_id);
            if (0 < cost) {
                await transactionStore.createTransactionsGames(gameId, cost);
            }
        } catch (error) {
            console.error('Error starting the game:', error.message || error.response?.data);
            return;
        }
    }
    router.push({ name: 'SinglePlayerGameBoard', params: { size, gameId } });
};

const onBoardClick = (size) => {
    gameStore.handleBoardSizeChange(size);
};

</script>

<template>
    <div class="max-w-3xl mx-auto py-8 space-y-6">

        <h1 class="text-3xl font-bold text-center mb-8">Multi-Player Mode</h1>

        <div class="bg-sky-100 p-6 rounded shadow-md flex justify-between items-center">
            <div>
                <p class="text-lg font-semibold">Welcome, {{ profileStore.nickname }}</p>

                <div class="flex items-center pt-2 space-x-2">
                    <img src="/coin.png" alt="Coin Icon" class="w-6 h-6 object-contain" />
                    <span class="text-semibold font-bold">{{ profileStore.coins }}</span>
                </div>
            </div>


            <RouterLink :to="{ name: 'multiPlayerHistory' }"
                class="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition duration-300">
                My Games
            </RouterLink>
        </div>

        <div class="bg-white p-4 rounded shadow-md">
            <h2 class="text-2xl font-semibold mb-4 text-center">Select Board</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div v-for="board in boardStore.boards" :key="board.id"
                    class="p-6 border rounded-lg flex flex-col items-center justify-between bg-gray-100 shadow-sm">
                    <p class="text-lg font-bold">{{ board.board_cols + "x" + board.board_rows }}</p>
                    <p class="text-sm text-gray-500 mt-2">
                        Required Coins - <span class="font-semibold">{{ board.coinsRequired }}</span>
                    </p>
                    <button class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition mt-8"
                        :class="{ 'opacity-50': profileStore.coins < board.coinsRequired }"
                        :disabled="profileStore.coins < board.coinsRequired"
                        @click="startGame(`${board.board_cols}x${board.board_rows}`, board.coinsRequired, board.id)">
                        Play
                    </button>
                </div>
            </div>
        </div>

        <div class="pt-8">
            <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                <div class="relative text-center mb-6 mr-4">
                    <p class="text-lg text-gray-700 font-semibold">Your Top 10 Multi-Player Games</p>

                    <p class="text-sm text-gray-500 mt-2">This table shows your best performance across different board
                        sizes.</p>

                    <span class="absolute right-0 top-0 transform translate-x-4 translate-y-1">
                        <span class="relative inline-block group">
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round"
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
                                            <p class="text-sm text-gray-700">Total Victories -
                                                <span class="text-sm text-green-500">{{
                                                    gameStore.totalMultiplayerVictorys }}</span>
                                            </p>
                                            <p class="text-sm text-gray-700">Total Losses -
                                                <span class="text-sm text-red-500">{{ gameStore.totalMultiplayerLosses
                                                    }}</span>
                                            </p>

                                            <p class="text-sm text-gray-700">
                                                Win/Loss Ratio -
                                                <span class="text-sm text-gray-500">
                                                    {{ ((gameStore.totalMultiplayerVictorys /
                                                        gameStore.totalMultiplayerLosses).toFixed(2)) || 0 }}
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
                                'bg-sky-600 text-white': board.board_cols + 'x' + board.board_rows == gameStore.boardFilter,
                                'bg-sky-500 hover:bg-sky-600 text-white': board.board_cols + 'x' + board.board_rows != gameStore.boardFilter
                            }" class="px-4 py-1 rounded-md border transition-all duration-300">
                            {{ board.board_cols + 'x' + board.board_rows }}
                        </button>
                    </div>
                </div>
            </div>

            <PaginatedTable :columns="tableColumns" :data="gameStore.bestResultsMultiplayer" :pagination="false" />

            <div class="bg-white p-6 rounded-lg shadow-md mt-6">
                <p class="text-sm text-gray-700 font-semibold mb-1">
                    Sorting Criteria
                </p>
                <p class="text-xs text-gray-500">
                    1. <strong>Best Time</strong> - The fastest time you achieved for completing games.
                    <br>2. <strong>Pairs Discovered</strong> - The total number of pairs you discovered during the game.
                    <br>3. <strong>Number of Players</strong> - The total number of participants in the game.
                </p>
            </div>
        </div>
    </div>

</template>
