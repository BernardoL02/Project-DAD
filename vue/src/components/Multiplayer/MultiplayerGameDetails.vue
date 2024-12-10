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

});
</script>


<template>
    <div class="max-w-6xl mx-auto py-8 flex flex-col justify-center items-center">
        <h1 class="text-3xl font-bold text-center mb-8">Game Details</h1>

        <!-- Game Details Section -->
        <div class="bg-white p-8 rounded-lg shadow-md max-w-2xl flex justify-center items-center">
            <div class="flex flex-col">
                <div class="flex flex-row justify-center items-center pb-12 space-x-20">
                    <!-- Created By -->
                    <div class="flex flex-col justify-center items-center">
                        <p class="text-sm text-gray-500 font-medium ">Creator</p>
                        <img :src="gameStore.game.created_user_photo" alt="User Profile Picture"
                            class="w-28 h-28 rounded-full mx-auto border-4 border-white shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl" />
                        <p class="text-lg text-gray-700 font-semibold pt-3">{{ gameStore.game.created_user }}</p>
                    </div>
                    <!-- Winner -->
                    <div class="flex flex-col justify-center items-center">
                        <p class="text-sm text-gray-500 font-medium ">Winner</p>
                        <img :src="gameStore.game.winner_user_photo" alt="User Profile Picture"
                            class="w-28 h-28 rounded-full mx-auto border-4 border-white shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl" />
                        <p class="text-lg text-gray-700 font-semibold pt-3">{{ gameStore.game.winner_user }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-2">
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
                </div>
            </div>
        </div>
    </div>

    <div class="max-w-7xl mx-auto py-8">
        <!-- Participants Section -->
        <p class="text-3xl font-bold text-center mb-8">
            Participants
        </p>
        <div class="bg-white p-8 rounded-lg shadow-md">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="participant in gameStore.game.participants" :key="participant.player_name"
                    class="bg-gray-100 p-6 rounded-lg border border-gray-200 flex flex-col items-center space-y-4">
                    <img v-if="participant.photo_filename"
                        :src="`${baseUrl}/storage/photos/${participant.photo_filename}`" alt="Participant's photo"
                        class="w-24 h-24 rounded-full object-cover border-2 border-gray-300">
                    <p class="text-lg text-gray-700 font-bold mt-4">
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
    </div>



</template>
