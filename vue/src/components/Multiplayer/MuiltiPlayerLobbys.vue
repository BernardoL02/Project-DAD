<script setup>
import ListGamesLobby from './ListGamesLobby.vue'
import { useLobbyStore } from '@/stores/lobby'
import { onMounted } from 'vue'

const storeLobby = useLobbyStore()
console.log('Games in the store:', storeLobby.games);

onMounted(() => {
    storeLobby.fetchGames()
})
</script>

<template>
    <div class="py-2">
        <Button @click="storeLobby.addGame">
            New Game
        </Button>
    </div>
    <div v-if="storeLobby.totalGames > 0">
        <ListGamesLobby></ListGamesLobby>
    </div>
</template>