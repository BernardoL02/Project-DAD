<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useGameStore } from '@/stores/game';
import { useBoardStore } from '@/stores/board';
import { useTransactionStore } from '@/stores/transaction';

import PaginatedTable from '@/components/StandardTablePaginated.vue';

const router = useRouter();
const authStore = useAuthStore();
const gameStore = useGameStore();
const boardStore = useBoardStore();
const transactionStore = useTransactionStore();

const tableColumns = ['Id', 'Difficulty', 'Board', 'Status', 'Began At', 'Total Time', 'Turns'];

const difficulty = ref('normal');
const difficultyFilyer = ref('Normal');

const toggleDifficulty = () => {
    difficulty.value = difficulty.value === 'normal' ? 'hard' : 'normal';
    gameStore.setDifficulty(difficulty.value);
};

onMounted(async () => {
    await gameStore.getSinglePlayerGames();
    await boardStore.getBoards();

    if (gameStore.difficulty) {
        difficulty.value = gameStore.difficulty;
    }

    if (gameStore.boardFilter === "All") {
        gameStore.boardFilter = "3x4";
    }
});

const startGame = async (size, cost, board_id) => {
    var gameId = 0;
    if (authStore.user) {
        if (authStore.coins < cost) {
            alert("You don't have enough brain coins to play on this board!");
            return;
        }

        try {
            gameId = await gameStore.createSinglePlayer(board_id, difficulty.value === 'hard' ? 'hard' : null);

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

const onDifficultyClick = () => {
    difficultyFilyer.value = difficultyFilyer.value === 'Normal' ? 'Hard' : 'Normal';
    gameStore.handleDifficultyChange(difficultyFilyer.value);
};


</script>

<template>
    <div class="max-w-3xl mx-auto py-8 space-y-6">

        <h1 class="text-3xl font-bold text-center mb-8">Single-Player Mode</h1>

        <div class="bg-sky-100 p-6 rounded-xl shadow-lg flex justify-between items-center">
            <div>
                <p class="text-lg font-semibold">Welcome, {{ authStore.nickname }}</p>

                <div class="flex items-center pt-2 space-x-2">
                    <img src="/coin.png" alt="Coin Icon" class="w-6 h-6 object-contain" />
                    <span class="text-semibold font-bold">{{ authStore.coins }}</span>
                </div>
            </div>

            <RouterLink :to="{ name: 'singlePlayerHistory' }"
                class="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition duration-300">
                My Games
            </RouterLink>
        </div>

        <!-- Selecionar Tabuleiro -->
        <div class="bg-white p-4 rounded-xl shadow-lg">

            <div class="relative text-center mb-6 mr-4">
                <h2 class="text-2xl font-semibold text-center pl-5">Select Board</h2>

                <div
                    class="group ml-0 cursor-pointer absolute right-0 top-0 transform translate-x-4 translate-y-1 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition duration-200">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12" y2="8"></line>
                    </svg>

                    <div
                        class="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible flex flex-col right-[-335px] top-[-75px] mt-14 w-[300px] z-10 transition-all duration-300 ease-in-out">
                        <div class="bg-white p-4 rounded-lg shadow-md mb-12 text-left max-w-72">
                            <h2 class="text-lg font-bold text-gray-700">Difficulties</h2>
                            <div class="mt-3 grid grid-cols-1">
                                <div>
                                    <p class="text-sm font-semibold text-gray-700">Normal -
                                        <span class="text-sm font-normal text-gray-500">
                                            Find pairs of cards.
                                        </span>
                                    </p>
                                    <p class="text-sm font-semibold text-gray-700">Hard -
                                        <span class="text-sm font-normal text-gray-500">
                                            Find three matching cards.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex items-center space-x-2 flex-row justify-center mb-5 mt-2">
                <div class="relative w-32 h-8 bg-gray-200 rounded-full flex items-center cursor-pointer p-1 shadow-inner transition-all duration-300"
                    @click="toggleDifficulty">
                    <div class="absolute h-full text-sm w-1/2 px-8 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold flex items-center justify-center rounded-full transition-all duration-300 ease-in-out"
                        :style="{ left: difficulty === 'normal' ? '0%' : '50%' }">
                        {{ difficulty === 'normal' ? 'Normal' : 'Hard' }}
                    </div>
                    <div class="flex w-full text-xs font-semibold text-gray-700 justify-between px-2">
                        <span :class="{ 'invisible': difficulty === 'normal' }">Normal</span>
                        <span :class="{ 'invisible': difficulty === 'hard' }">Hard</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div v-for="board in boardStore.boards" :key="board.id"
                    class="p-6 border rounded-lg flex flex-col items-center justify-between bg-gray-50 shadow-md hover:shadow-lg">
                    <p class="text-lg font-bold">
                        {{ board.board_cols + "x" + board.board_rows }}
                    </p>
                    <p class="text-sm text-gray-500 mt-2">
                        Required Coins - <span class="font-semibold">{{ board.coinsRequired }}</span>
                    </p>

                    <div class="mt-8">
                        <button v-if="authStore.coins >= board.coinsRequired"
                            class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition mt-8"
                            @click="startGame(`${board.board_cols}x${board.board_rows}`, board.coinsRequired, board.id)">
                            Play
                        </button>

                        <RouterLink v-else :to="{ name: 'store' }"
                            class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition mt-8">
                            Buy Coins
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabela de Jogos -->
        <div class="pt-8">
            <div>
                <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                    <div class="text-center mb-6">
                        <p class="text-lg text-gray-700 font-semibold">Your Top 10 Single-Player Games</p>
                        <p class="text-sm text-gray-500 mt-2">
                            This table shows your best performance across different board sizes.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 place-items-center items-center justify-center pt-2 space-y-2">
                        <div class="flex items-center space-x-2 flex-row justify-center mb-5 mt-2">
                            <div class="relative w-32 h-8 bg-gray-200 rounded-full flex items-center cursor-pointer p-1 shadow-inner transition-all duration-300"
                                @click="onDifficultyClick">
                                <div class="absolute h-full text-sm w-1/2 px-8 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold flex items-center justify-center rounded-full transition-all duration-300 ease-in-out"
                                    :style="{ left: difficultyFilyer === 'Normal' ? '0%' : '50%' }">
                                    {{ difficultyFilyer === 'Normal' ? 'Normal' : 'Hard' }}
                                </div>
                                <div class="flex w-full text-xs font-semibold text-gray-700 justify-between px-2">
                                    <span :class="{ 'invisible': difficultyFilyer === 'Normal' }">Normal</span>
                                    <span :class="{ 'invisible': difficultyFilyer === 'Hard' }">Hard</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-row gap-8">
                            <button v-for="board in boardStore.boards" :key="board.id"
                                @click="onBoardClick(board.board_cols + 'x' + board.board_rows)" :class="{
                                    'bg-sky-500 text-white': board.board_cols + 'x' + board.board_rows == gameStore.boardFilter,
                                    'bg-gray-200 hover:bg-gray-300 text-gray-700': board.board_cols + 'x' + board.board_rows != gameStore.boardFilter
                                }" class="px-4 py-1 rounded-md border transition-all duration-300">
                                {{ board.board_cols + 'x' + board.board_rows }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <PaginatedTable :columns="tableColumns" :data="gameStore.bestResultsSinglePlayer" :pagination="false" />

            <div class="bg-white p-6 rounded-lg shadow-md mt-6">
                <p class="text-sm text-gray-700 font-semibold mb-1">
                    Sorting Criteria
                </p>
                <p class="text-xs text-gray-500">
                    1. <strong>Best Time</strong> - The fastest time you achieved for completing games on
                    each board size.
                    <br>2. <strong>Turns</strong> - The total number of moves you made to complete a game on each board
                    size.
                </p>
            </div>
        </div>
    </div>
</template>
