<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useNotificationStore } from '@/stores/notification';

const props = defineProps({
  size: {
    type: String,
    required: true,
  },
  gameId: {
    type: Number,
    required: true,
  },
});

const router = useRouter();

const availableCards = [
  'c1.png', 'c2.png', 'c3.png', 'c4.png', 'c5.png', 'c6.png', 'c7.png', 'c11.png', 'c12.png', 'c13.png',
  'e1.png', 'e2.png', 'e3.png', 'e4.png', 'e5.png', 'e6.png', 'e7.png', 'e11.png', 'e12.png', 'e13.png',
  'o1.png', 'o2.png', 'o3.png', 'o4.png', 'o5.png', 'o6.png', 'o7.png', 'o11.png', 'o12.png', 'o13.png',
  'p1.png', 'p2.png', 'p3.png', 'p4.png', 'p5.png', 'p6.png', 'p7.png', 'p11.png', 'p12.png', 'p13.png',
];

const shuffledCards = ref([]);
const selectedCards = ref([]);
const matchedPairs = ref([]);
const gameStarted = ref(false);
const startTime = ref(null);
const endTime = ref(null);
const moves = ref(0);
const timer = ref(0);
const timerInterval = ref(null);
const showModal = ref(false);
const isLeaving = ref(false);
const notificationStore = useNotificationStore();

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const totalCards = computed(() => {
  if (!props.size || !props.size.includes('x')) return 16;
  const [rows, cols] = props.size.split('x').map(Number);
  return Math.min(rows * cols, availableCards.length * 2);
});

const generateCards = () => {
  const pairsCount = totalCards.value / 2;
  const shuffledAvailableCards = shuffleArray([...availableCards]);

  const cards = [];
  for (let i = 0; i < pairsCount; i++) {
    const cardImage = shuffledAvailableCards[i % shuffledAvailableCards.length];
    cards.push({ id: i + 1, image: cardImage }, { id: i + 1, image: cardImage });
  }

  shuffledCards.value = shuffleArray(cards);
};

const elapsedTime = computed(() => {
  if (startTime.value && endTime.value) {
    return Math.floor((endTime.value - startTime.value) / 1000);
  }
  return timer.value;
});

const flipCard = (index) => {
  if (!gameStarted.value) {
    gameStarted.value = true;
    startTime.value = new Date();
    timerInterval.value = setInterval(() => {
      if (startTime.value) {
        timer.value++;
      }
    }, 1000);
  }

  if (selectedCards.value.length < 2 && !selectedCards.value.includes(index)) {
    selectedCards.value.push(index);

    if (selectedCards.value.length === 2) {
      moves.value++;
      checkMatch();
    }
  }
};

const checkMatch = async () => {
  const [firstIndex, secondIndex] = selectedCards.value;
  if (shuffledCards.value[firstIndex].id === shuffledCards.value[secondIndex].id) {
    matchedPairs.value.push(firstIndex, secondIndex);
  }

  setTimeout(async () => {
    selectedCards.value = [];
    if (matchedPairs.value.length === shuffledCards.value.length) {
      endTime.value = new Date();
      clearInterval(timerInterval.value);

      // Calcula o tempo total
      const totalTime = Math.floor((endTime.value - startTime.value) / 1000);

      // Atualiza o status para 'ended'
      await sendPostOnGameEnd(totalTime);

      // Permite sair sem exibir o modal
      isLeaving.value = true;

      // Exibe a notificação de sucesso
      notificationStore.setSuccessMessage(`Você completou o jogo em ${totalTime} segundos!`, 'Parabéns!');

      // Redireciona para a página de single player
      router.push('/singlePlayer');
    }
  }, 1000);
};



const startGame = () => {
  generateCards();
};

const sendPostOnExit = async () => {
  try {
    if (!props.gameId) {
      console.error('Game ID não está definido.');
      return;
    }

    await axios.patch(`/games/${props.gameId}`, {
      status: 'I',
    });
    console.log('Game status atualizado para "interrupted".');
  } catch (error) {
    console.error('Erro ao atualizar status do jogo:', error.response?.data || error.message);
  }
};

const sendPostOnGameEnd = async (totalTime) => {
  try {
    if (!props.gameId) {
      console.error('Game ID não está definido.');
      return;
    }

    await axios.patch(`/games/${props.gameId}`, {
      status: 'E',
      total_time: totalTime,
    });

    console.log(`Game atualizado com status "ended" e tempo total de ${totalTime} segundos.`);
  } catch (error) {
    console.error('Erro ao atualizar status do jogo:', error.response?.data || error.message);
  }
};



const confirmExit = async () => {
  await sendPostOnExit();
  isLeaving.value = true;
  showModal.value = false;
  router.push('/');
};

const cancelExit = () => {
  showModal.value = false;
  isLeaving.value = false;
};


const handleBeforeUnload = (event) => {
  event.preventDefault();
  sendPostOnExit();
  event.returnValue = ''; 
};


window.addEventListener('beforeunload', handleBeforeUnload);

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
  if (timerInterval.value) clearInterval(timerInterval.value);
});

onMounted(() => {
  startGame();
});

router.beforeEach((to, from, next) => {
  if (!isLeaving.value) {
    showModal.value = true;
    next(false);
  } else {
    next();
  }
});
</script>

<template>
  <div>
    <div class="game-container flex justify-center gap-10">
      <!-- Tabuleiro -->
      <div class="game-board grid gap-2 bg-gray-100 p-4 rounded-lg shadow-md"
           :style="{
             gridTemplateRows: `repeat(${props.size.split('x')[0] || 4}, 1fr)`,
             gridTemplateColumns: `repeat(${props.size.split('x')[1] || 4}, 1fr)`
           }"
      >
        <div
          v-for="(card, index) in shuffledCards"
          :key="index"
          class="relative cursor-pointer"
          :class="{ 'pointer-events-none': matchedPairs.includes(index) }"
          @click="flipCard(index)"
        >
          <!-- Carta -->
          <div
            class="w-24 h-36 transform-style-preserve-3d transition-transform duration-500 rotate-y-180"
            :class="{ 'rotate-y-0': matchedPairs.includes(index) || selectedCards.includes(index) }"
          >
            <div class="absolute w-full h-full backface-hidden bg-white rounded-lg">
              <img :src="`/Cards/${card.image}`" alt="Card" class="w-full h-full rounded-lg" />
            </div>

            <div class="absolute w-full h-full backface-hidden transform rotate-y-180 bg-red-500 rounded-lg">
              <img src="/Cards/semFace.png" alt="Card Back" class="w-full h-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <!-- Informações do Jogo -->
      <div class="game-info p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-md sticky top-4 w-64">
        <p class="text-lg font-medium">Tempo: {{ elapsedTime }} seg</p>
        <p class="text-lg font-medium">Jogadas: {{ moves }}</p>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white p-6 rounded shadow-md w-96">
        <h2 class="text-xl font-bold mb-4">Confirmação</h2>
        <p class="mb-4">Tem certeza de que deseja sair do jogo? <br> O progresso será perdido.</p>
        <div class="flex justify-end space-x-4">
          <button
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            @click="cancelExit"
          >
            Cancelar
          </button>
          <button
            class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            @click="confirmExit"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  perspective: 1000px;
}

.transform-style-preserve-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

.rotate-y-0 {
  transform: rotateY(0);
}

.game-info {
  max-height: fit-content;
}
</style>
