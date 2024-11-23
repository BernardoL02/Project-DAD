<script setup>
// Simulated user data for demonstration
const user = {
    username: "José Delgado",
    brainCoins: 10,
};

const boardSizes = [
    { size: "3x4", coinsRequired: 0 },
    { size: "4x4", coinsRequired: 1 },
    { size: "6x6", coinsRequired: 1 },
];

// Function to start the game
const startGame = (size, cost) => {
    if (user.brainCoins < cost) {
        alert("You don't have enough brain coins to play on this board!");
    } else {
        alert(`Game started on the ${size} board`);
        // Logic to start the game
    }
};
</script>

<template>
    <div class="max-w-2xl mx-auto py-8 space-y-6">

        <h1 class="text-3xl font-bold text-center">Single-Player Mode</h1>

        <div class="bg-gray-100 p-4 rounded shadow-md flex justify-between items-center">
            <div>
                <p class="text-lg font-semibold">Welcome, {{ user.username }}</p>
                <p class="text-sm text-gray-600">Brain Coins: <span class="font-bold">{{ user.brainCoins }}</span>
                </p>
            </div>
            <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                @click="alert('View game history')">
                History
            </button>
        </div>

        <div class="bg-white p-4 rounded shadow-md">
            <h2 class="text-xl font-semibold mb-4">Select Board</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="board in boardSizes" :key="board.size"
                    class="p-4 border rounded flex flex-col items-center justify-between space-y-4">
                    <p class="text-lg font-bold">{{ board.size }}</p>
                    <p class="text-sm text-gray-500">
                        Required Coins: <span class="font-semibold">{{ board.coinsRequired }}</span>
                    </p>
                    <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                        :class="{ 'opacity-50': user.brainCoins < board.coinsRequired }"
                        :disabled="user.brainCoins < board.coinsRequired"
                        @click="startGame(board.size, board.coinsRequired)">
                        Play
                    </button>
                </div>
            </div>
        </div>


        <div class="bg-gray-100 p-4 rounded shadow-md">
            <h2 class="text-xl font-semibold mb-4">Scoreboard</h2>
            <p class="text-sm text-gray-500">Global ranking and score history will appear here.</p>
            <div class="mt-4">
                <p class="text-center text-gray-400 italic">No games registered yet.</p>
            </div>
        </div>
    </div>
</template>
