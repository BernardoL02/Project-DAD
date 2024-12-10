<script setup>
import { onMounted } from 'vue';
import { useGameStore } from '@/stores/game';
import { defineProps } from 'vue';

const props = defineProps({
    gameId: {
        type: Number,
        required: true,
    }
});

const gameStore = useGameStore();

onMounted(async () => {

    await gameStore.getMultiPlayerGame(props.gameId);

    console.log('games:', gameStore.game.participants);


});
</script>


<template>
    <div class="max-w-6xl mx-auto py-8 flex flex-col justify-center items-center">
        <h1 class="text-3xl font-bold text-center mb-8">Game Details</h1>

        <!-- Game Details Section -->
        <div class="bg-white p-8 rounded-lg shadow-md max-w-2xl flex justify-center items-center">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-6">
                <!-- Status -->
                <div>
                    <p class="text-base text-gray-500 font-medium ">Status</p>
                    <p class="text-base text-gray-700 font-semibold">{{ gameStore.game.status }}</p>
                </div>
                <!-- Board Size -->
                <div>
                    <p class="text-base text-gray-500 font-medium ">Board Size</p>
                    <p class="text-base text-gray-700 font-semibold">{{ gameStore.game.board_id }}</p>
                </div>
                <!-- Participants Count -->
                <div>
                    <p class="text-base text-gray-500 font-medium ">Began At</p>
                    <p class="text-base text-gray-700 font-semibold">{{ gameStore.game.began_at }}</p>
                </div>
                <!-- Total Time -->
                <div>
                    <p class="text-base text-gray-500 font-medium ">Total Time</p>
                    <p class="text-base text-gray-700 font-semibold">{{ gameStore.game.total_time }}</p>
                </div>
                <!-- Participants Count -->
                <div>
                    <p class="text-base text-gray-500 font-medium ">Nº Participants</p>
                    <p class="text-base text-gray-700 font-semibold">{{ gameStore.game.participants_count }}</p>
                </div>
                <!-- Participants Count -->
                <div>
                    <p class="text-base text-gray-500 font-medium ">Ended At</p>
                    <p class="text-base text-gray-700 font-semibold">{{ gameStore.game.ended_at }}</p>
                </div>
                <div class="flex flex-row justify-center items-center pt-10">
                    <!-- Created By -->
                    <div>
                        <p class="text-sm text-gray-500 font-medium ">Created By</p>
                        <p class="text-lg text-gray-700 font-semibold">{{ gameStore.game.created_user }}</p>
                    </div>
                    <!-- Winner -->
                    <div>
                        <p class="text-sm text-gray-500 font-medium ">Winner</p>

                        <p class="text-lg text-gray-700 font-semibold">{{ gameStore.game.winner_user }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <!-- Participants Section -->
    <p class="text-3xl font-bold text-center mb-8">
        Participants
    </p>
    <div class="bg-white p-8 rounded-lg shadow-md">
        <div class="grid grid-cols-1 sm:grid-cols-1 gap-6">
            <div v-for="participant in gameStore.game.participants" :key="participant.player_name"
                class="bg-gray-100 p-6 rounded-lg border border-gray-200">
                <p class="text-lg text-gray-700 font-bold">
                    {{ participant.player_name }}
                </p>
                <p class="text-gray-600">
                    <span class="font-semibold">Pairs Discovered:</span> {{ participant.pairs_discovered }}
                </p>
                <p class="text-gray-600">
                    <span class="font-semibold">Won:</span> {{ participant.player_won }}
                </p>
            </div>
        </div>
    </div>

</template>
