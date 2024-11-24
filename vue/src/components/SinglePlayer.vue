<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '@/stores/profile';

const router = useRouter();
const profileStore = useProfileStore();

const boardSizes = [
    { size: "3x4", coinsRequired: 0 },
    { size: "4x4", coinsRequired: 1 },
    { size: "6x6", coinsRequired: 1 },
];

onMounted(async () => {
    await profileStore.fetchProfile();
});

const startGame = (size, cost) => {
    if (profileStore.coins < cost) {
        alert("You don't have enough brain coins to play on this board!");
    } else {
        router.push({ name: 'gameBoard', params: { size } });
    }
};

</script>

<template>
    <div class="max-w-2xl mx-auto py-8 space-y-6">

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
                <div v-for="board in boardSizes" :key="board.size"
                    class="p-6 border rounded-lg flex flex-col items-center justify-between bg-gray-100 shadow-sm">
                    <p class="text-lg font-bold">{{ board.size }}</p>
                    <p class="text-sm text-gray-500 mt-2">
                        Required Coins - <span class="font-semibold">{{ board.coinsRequired }}</span>
                    </p>
                    <button class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition mt-8"
                        :class="{ 'opacity-50': profileStore.coins < board.coinsRequired }"
                        :disabled="profileStore.coins < board.coinsRequired"
                        @click="startGame(board.size, board.coinsRequired)">
                        Play
                    </button>
                </div>
            </div>
        </div>
    </div>

</template>
