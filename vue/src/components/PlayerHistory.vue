<script setup>
import { useGameStore } from '@/stores/games'

import DynamicTable from '@/components/StandardTable.vue';

const tableColumns = ['Name', 'Age', 'Email']; // Columns for the table

const gameStore = useGameStore()

gameStore.getSingleGames()

</script>

<template>
  <div class="max-w-4xl mx-auto mt-10">
    <DynamicTable :columns="tableColumns" :data="gameStore.games" />
  </div>
</template>