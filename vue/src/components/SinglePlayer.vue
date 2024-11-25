<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '@/stores/profile';
import { useGameStore } from '@/stores/game'
import { useBoardStore } from '@/stores/board'

import PaginatedTable from '@/components/StandardTablePaginated.vue'

const router = useRouter();
const profileStore = useProfileStore();
const gameStore = useGameStore()
const boardStore = useBoardStore()

const selectedBoard = ref("3x4");
const tableColumns = ['Id', 'Board', 'Status', 'Began At', 'Total Time']

onMounted(async () => {
    await gameStore.getSinglePlayerGames();
    await boardStore.getBoards();
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
            if(0 < cost){
                await profileStore.createTransactionsGames(gameId, cost);
            }
        } catch (error) {
            console.error('Error starting the game:', error.message || error.response?.data);
            return;
        }
    }
    router.push({ name: 'SinglePlayerGameBoard', params: { size, gameId } });
};

const onBoardClick = (size) => {
    selectedBoard.value = size;
    gameStore.handleBoardSizeChange(size);
};

</script>

<template>
    <div class="max-w-3xl mx-auto py-8 space-y-6">

        <h1 class="text-3xl font-bold text-center mb-8">Single-Player Mode</h1>

        <div class="bg-sky-100 p-4 rounded shadow-md flex justify-between items-center">
            <div>
                <p class="text-lg font-semibold">Welcome, {{ profileStore.nickname }}</p>

                <div class="flex items-left justify-left pt-2">
                    <img src="/coin.png" alt="Coin Icon" class="w-6 h-6 object-contain mr-2" />
                    <span class="mr-2 text-semibold">{{ profileStore.coins }}</span>
                </div>
            </div>

            <RouterLink to="/singlePlayer/history"
                class="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition duration-300">
                History
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

                <div class="text-center mb-6">
                    <p class="text-lg text-gray-700 font-semibold">Your Top 10 Single-Player Games
                    </p>
                    <p class="text-sm text-gray-500 mt-2">This table shows your best performance across different board
                        sizes.</p>
                </div>

                <div class="flex justify-center pt-2">
                    <div class="flex flex-row gap-8">
                        <button v-for="board in boardStore.boards" :key="board.id"
                            @click="onBoardClick(board.board_cols + 'x' + board.board_rows)" :class="{
                                'bg-sky-600 text-white': board.board_cols + 'x' + board.board_rows == selectedBoard,
                                'bg-sky-500 hover:bg-sky-600 text-white': board.board_cols + 'x' + board.board_rows != selectedBoard
                            }" class="px-4 py-1 rounded-md border transition-all duration-300">
                            {{ board.board_cols + 'x' + board.board_rows }}
                        </button>
                    </div>
                </div>
            </div>

            <PaginatedTable :columns="tableColumns" :data="gameStore.bestResults" :pagination="false" />
        </div>
    </div>

</template>
