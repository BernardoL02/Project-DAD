<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const size = ref(route.params.size || '3x4');

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

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const totalCards = computed(() => {
  if (!size.value || !size.value.includes('x')) return 16;
  const [rows, cols] = size.value.split('x').map(Number);
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
  // Verifica se o jogo já começou
  if (!gameStarted.value) {
    gameStarted.value = true;
    startTime.value = new Date(); // Inicia o tempo quando a primeira carta for virada
    timerInterval.value = setInterval(() => {
      if (startTime.value) {
        timer.value++;
      }
    }, 1000);
  }

  // Permitir virar apenas se menos de 2 cartas estiverem selecionadas e a carta ainda não estiver virada
  if (selectedCards.value.length < 2 && !selectedCards.value.includes(index)) {
    selectedCards.value.push(index);

    // Verificar se duas cartas foram viradas
    if (selectedCards.value.length === 2) {
      moves.value++; // Incrementa o contador de jogadas somente ao virar duas cartas
      checkMatch();
    }
  }
};

const checkMatch = () => {
  const [firstIndex, secondIndex] = selectedCards.value;
  if (shuffledCards.value[firstIndex].id === shuffledCards.value[secondIndex].id) {
    matchedPairs.value.push(firstIndex, secondIndex);
  }

  setTimeout(() => {
    selectedCards.value = [];
    if (matchedPairs.value.length === shuffledCards.value.length) {
      endTime.value = new Date();
      clearInterval(timerInterval.value);
      alert(`Você completou o jogo em ${elapsedTime.value} segundos com ${moves.value} jogadas!`);
    }
  }, 1000);
};

const startGame = () => {
  generateCards();
};

onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value);
});

onMounted(() => {
  if (!size.value || !size.value.includes('x')) size.value = '3x4';
  startGame();
});
</script>



<template>
    <div class="game-container flex justify-center gap-10">
      <!-- Tabuleiro -->
      <div class="game-board grid gap-2 bg-gray-100 p-4 rounded-lg shadow-md"
           :style="{
             gridTemplateRows: `repeat(${size.split('x')[0] || 4}, 1fr)`,
             gridTemplateColumns: `repeat(${size.split('x')[1] || 4}, 1fr)`
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
            <!-- Frente da carta -->
            <div class="absolute w-full h-full backface-hidden bg-white rounded-lg">
              <img :src="`/Cards/${card.image}`" alt="Card" class="w-full h-full rounded-lg" />
            </div>
  
            <!-- Verso da carta -->
            <div
              class="absolute w-full h-full backface-hidden transform rotate-y-180 bg-red-500 rounded-lg"
            >
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


