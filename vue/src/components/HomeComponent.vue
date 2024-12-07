<script setup>
</script>

<template>
    <div class="relative bg-gradient-to-b from-blue-100 to-blue-50 min-h-screen flex flex-col items-center text-center">
        <!-- Banner -->
        <div class="w-full relative">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-80"></div>
            <img src="/estg_h-01.png" alt="Memory Game Banner" class="w-full h-64 object-cover" />
            <div class="absolute inset-0 flex flex-col justify-center items-center text-white space-y-4">
                <h1 class="text-4xl sm:text-5xl font-bold">Welcome to Memory Game</h1>
                <p class="text-lg sm:text-xl max-w-xl">
                    Challenge your memory, compete with others, and reach the top of the leaderboard!
                </p>
            </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-5xl px-4 py-12 space-y-12">
            <!-- About the Game -->
            <section class="space-y-6">
                <h2 class="text-3xl font-bold text-gray-800">What is Memory Game?</h2>
                <p class="text-lg text-gray-600 max-w-prose mx-auto">
                    Memory Game is a fun and challenging game designed to test your memory and skills. Play solo or with
                    friends and
                    see who can remember more!
                </p>
            </section>

            <!-- Highlights -->
            <section class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                <div class="bg-white shadow-lg p-6 rounded-lg space-y-4">
                    <h3 class="text-xl font-bold text-blue-600">Single-Player Mode</h3>
                    <p class="text-gray-600">
                        Play on your own and improve your memory while climbing the rankings.
                    </p>
                </div>
                <div class="bg-white shadow-lg p-6 rounded-lg space-y-4">
                    <h3 class="text-xl font-bold text-blue-600">Multi-Player Mode</h3>
                    <p class="text-gray-600">
                        Challenge your friends or compete online for the ultimate victory.
                    </p>
                </div>
                <div class="bg-white shadow-lg p-6 rounded-lg space-y-4">
                    <h3 class="text-xl font-bold text-blue-600">Scoreboard</h3>
                    <p class="text-gray-600">
                        Check out the leaderboard and see who has the best memory!
                    </p>
                </div>
            </section>

            <!-- Call to Action -->
            <section class="space-y-4 text-center">
                <p class="text-lg text-gray-700">Ready to start the challenge?</p>
                <div class="flex justify-center space-x-4">
                    <button
                        class="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                        Start Game
                    </button>
                    <button
                        class="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg shadow-md hover:bg-gray-400 transition duration-300">
                        View Leaderboard
                    </button>
                </div>
            </section>
        </div>

        <!-- Footer -->
        <footer class="bg-blue-700 w-full py-4 text-white text-sm">
            <div class="max-w-5xl mx-auto text-center">
            </div>
        </footer>
    </div>
</template>
