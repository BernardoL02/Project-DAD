<script setup>
import { ref, onMounted, computed } from 'vue';
import { useGameStore } from '@/stores/game';
import PaginatedTable from '@/components/ui/table/StandardTablePaginated.vue';
import DropdownButton from '@/components/ui/DropdownButton.vue';
import DatePicker from 'vue-datepicker-next';

const tableColumns = ['Id', 'Difficulty', 'Board', 'Status', 'Began At', 'Total Time', 'Turns'];
const gameStore = useGameStore();

const isLoading = ref(true);
const showModal = ref(false);
const selectedReplay = ref({ board: [], actions: [] });

const statusOptions = ['All', 'Pending', 'In Progress', 'Ended', 'Interrupted'];
const boardOptions = ['All', '3x4', '4x4', '6x6'];
const difficultyOptions = ['All', 'Normal', 'Hard'];

const dropdownRefs = {
  statusDropdown: ref(null),
  boardDropdown: ref(null),
  difficultyDropdown: ref(null),
};

const handleResetFilters = () => {
  gameStore.beginDateFilter = [null, null];
  gameStore.statusFilter = 'All';
  gameStore.boardFilter = 'All';
  gameStore.difficultyFilter = 'All';

  if (dropdownRefs.statusDropdown.value) {
    dropdownRefs.statusDropdown.value.resetToDefault();
  }
  if (dropdownRefs.boardDropdown.value) {
    dropdownRefs.boardDropdown.value.resetToDefault();
  }
  if (dropdownRefs.difficultyDropdown.value) {
    dropdownRefs.difficultyDropdown.value.resetToDefault();
  }
};

const handleSelect = (selectedValue, filterType) => {
  if (filterType === 'status') {
    gameStore.statusFilter = selectedValue;
  } else if (filterType === 'board') {
    gameStore.boardFilter = selectedValue;
  } else if (filterType === 'difficulty') {
    gameStore.difficultyFilter = selectedValue;
  }
};

const filteredGamesForTable = computed(() => {
  return gameStore.filteredGames.map((game) => ({
    Id: game.id,
    Difficulty: game.difficulty,
    Board: game.board_id,
    Status: game.status,
    'Began At': game.began_at,
    'Total Time': game.total_time,
    Turns: game.total_turns_winner,
    replayAvailable: !!game.replay,
  }));
});

const handleReplay = (gameId) => {
  const game = gameStore.filteredGames.find((g) => g.id === gameId);
  if (game?.replay) {
    try {
      const replayData = game.replay;
      if (replayData.board && replayData.actions) {
        selectedReplay.value = {
          ...replayData,
          flippedCards: replayData.board.map((row) => row.map(() => false)), // Inicializa flippedCards
        };
        console.log('Replay Data:', selectedReplay.value); // Log para verificar o conteúdo
        showModal.value = true;
        simulateReplay(); // Inicia o replay
      } else {
        console.error('Replay data is missing required properties.');
      }
    } catch (error) {
      console.error('Error parsing replay data:', error);
    }
  } else {
    console.error('No replay data found for this game.');
  }
};

const simulateReplay = async () => {
  // Inicializa o estado das cartas viradas para baixo
  if (!selectedReplay.value.flippedCards || selectedReplay.value.flippedCards.length === 0) {
    selectedReplay.value.flippedCards = selectedReplay.value.board.map((row) =>
      row.map(() => false) // Todas começam viradas para baixo
    );
  }

  let lastTime = 0; // Para calcular os atrasos entre tempos
  let openedCards = []; // Armazena as cartas abertas temporariamente

  // Agrupa ações por tempo
  const groupedActions = selectedReplay.value.actions.reduce((acc, action) => {
    const { time } = action;
    if (!acc[time]) acc[time] = [];
    acc[time].push(action);
    return acc;
  }, {});

  const sortedTimes = Object.keys(groupedActions).map(Number).sort((a, b) => a - b);

  for (const currentTime of sortedTimes) {
    const actions = groupedActions[currentTime];

    // Adiciona um atraso para sincronizar com o tempo
    const delay = Math.max((currentTime - lastTime) * 1000, 0);
    await new Promise((resolve) => setTimeout(resolve, delay));
    lastTime = currentTime;

    for (const action of actions) {
      const [row, col] = action.position;

      // Vira a carta para cima
      selectedReplay.value.flippedCards[row][col] = true;

      // Adiciona a carta aberta à lista de controle
      openedCards.push({ row, col });

      // Atualiza visualmente o tabuleiro
      selectedReplay.value.board = JSON.parse(JSON.stringify(selectedReplay.value.board));

      // Se duas cartas estiverem abertas, verifica a igualdade
      if (openedCards.length === 2) {
        const [first, second] = openedCards;
        const firstCard = selectedReplay.value.board[first.row][first.col];
        const secondCard = selectedReplay.value.board[second.row][second.col];

        // Delay para a verificação
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (firstCard !== secondCard) {
          // Se as cartas não forem iguais, vira para baixo
          selectedReplay.value.flippedCards[first.row][first.col] = false;
          selectedReplay.value.flippedCards[second.row][second.col] = false;
        }

        // Limpa as cartas abertas
        openedCards = [];

        // Atualiza visualmente o tabuleiro
        selectedReplay.value.board = JSON.parse(JSON.stringify(selectedReplay.value.board));
      }
    }
  }
};





const closeModal = () => {
  showModal.value = false;
  selectedReplay.value = null;
};

onMounted(async () => {
  await gameStore.getSinglePlayerGames();
  isLoading.value = false;

  gameStore.beginDateFilter = [null, null];
  gameStore.statusFilter = 'All';
  gameStore.boardFilter = 'All';
  gameStore.difficultyFilter = 'All';
});
</script>


<template>
  <div class="max-w-4xl mx-auto mt-10">
    <div v-if="isLoading" class="text-center text-lg">Loading games...</div>

    <div v-else class="space-y-6">
      <h1 class="text-3xl font-bold text-center">Single-Player History</h1>

      <!-- Filtros -->
      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <div class="flex flex-row sm:flex-row sm:justify-between gap-5">
          <!-- Data -->
          <div class="w-full sm:w-auto">
            <label for="began_at" class="block text-sm font-medium text-gray-700">Began At</label>
            <DatePicker v-model="gameStore.beginDateFilter" range format="YYYY-MM-DD" value-format="YYYY-MM-DD"
              class="max-w-[225px] focus:ring-sky-500 focus:border-sky-500 pt-[12px] text-sm font-light text-gray-700 focus:outline-none focus:ring-2"
              :placeholder="formattedDateRange" @change="handleDateChange" />
          </div>
          <!-- Dificuldade -->
          <div class="w-full sm:w-auto">
            <label for="difficulty" class="block text-sm font-medium text-gray-700 pb-2">Difficulty</label>
            <DropdownButton ref="dropdownRefs.difficultyDropdown" :options="difficultyOptions"
              v-model="gameStore.difficultyFilter" @select="(value) => handleSelect(value, 'difficulty')" />
          </div>
          <!-- Tabuleiro -->
          <div class="w-full sm:w-auto">
            <label for="board" class="block text-sm font-medium text-gray-700 pb-2">Board</label>
            <DropdownButton ref="dropdownRefs.boardDropdown" :options="boardOptions" v-model="gameStore.boardFilter"
              @select="(value) => handleSelect(value, 'board')" />
          </div>
          <!-- Status -->
          <div class="w-full sm:w-auto">
            <label for="status" class="block text-sm font-medium text-gray-700 pb-2">Status</label>
            <DropdownButton ref="dropdownRefs.statusDropdown" :options="statusOptions" v-model="gameStore.statusFilter"
              @select="(value) => handleSelect(value, 'status')" />
          </div>
        </div>

        <div class="flex justify-end text-xs pt-5 mb-[-15px]">
          <button @click="handleResetFilters" class="text-gray-500 hover:text-black hover:border-gray-700">
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Tabela -->
      <PaginatedTable :columns="tableColumns" :data="filteredGamesForTable" :pagination="true">
        <template #actions="{ row }">
          <button v-if="row.replayAvailable" @click="handleReplay(row.Id)" class="text-gray-600 hover:text-gray-800"
            aria-label="Replay">
            <img src="/replay.png" alt="Replay" class="w-6 h-6" />
          </button>
        </template>
      </PaginatedTable>



    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-5 rounded-lg shadow-lg max-w-xl w-full">
        <h2 class="text-lg font-bold mb-4">Replay Game</h2>
        <div v-if="selectedReplay?.board?.length">
          <div class="grid gap-4 p-4 bg-gray-200 rounded-lg"
            :style="{ gridTemplateColumns: `repeat(${selectedReplay.board[0]?.length || 0}, 1fr)` }">
            <div v-for="(row, rowIndex) in selectedReplay.board" :key="'row-' + rowIndex"
              class="grid grid-cols-1 gap-4">
              <div v-for="(cell, colIndex) in row" :key="'cell-' + rowIndex + '-' + colIndex"
                class="relative w-16 h-20 border border-gray-300 rounded-lg perspective">
                <div class="card" :class="{ flipped: selectedReplay.flippedCards?.[rowIndex]?.[colIndex] }">
                  <!-- Frente da carta -->
                  <div class="card-front">
                    <img :src="`/Cards/${cell}`" alt="" class="w-full h-full object-contain" />
                  </div>
                  <!-- Verso da carta -->
                  <div class="card-back">
                    <img src="/Cards/semFace.png" alt="Card Back" class="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p class="text-gray-500 text-center">
            Replay data is unavailable or corrupted.
          </p>
        </div>

        <div v-else>
          <p class="text-gray-500 text-center">Replay data is unavailable or corrupted.</p>
        </div>
        <div class="flex justify-end mt-4">
          <button @click="closeModal" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Close
          </button>
        </div>
      </div>
    </div>

  </div>
</template>


<style scoped>
.perspective {
  perspective: 1000px;
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 0.5rem;
}

.card-front {
  transform: rotateY(0deg);
}

.card-back {
  transform: rotateY(180deg);
  background-color: #1e293b;
}
</style>
