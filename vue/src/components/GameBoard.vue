<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

// Captura o tamanho do tabuleiro a partir da rota
const route = useRoute();
const size = ref(route.params.size || '3x4');

// Lista de cartas existentes
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
  if (selectedCards.value.length < 2 && !selectedCards.value.includes(index)) {
    selectedCards.value.push(index);
    moves.value++;
    if (selectedCards.value.length === 2) {
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
  gameStarted.value = true;
  startTime.value = new Date();
  timer.value = 0;
  generateCards();

  timerInterval.value = setInterval(() => {
    if (startTime.value) {
      timer.value++;
    }
  }, 1000);
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
    <div class="game-container">
      <div class="game-wrapper">
        <!-- Tabuleiro -->
        <div
          class="board bg-gray-100 rounded-lg shadow-md p-4"
          :style="{
            gridTemplateRows: `repeat(${size.split('x')[0] || 4}, auto)`,
            gridTemplateColumns: `repeat(${size.split('x')[1] || 4}, auto)`,
          }"
        >
          <div
            v-for="(card, index) in shuffledCards"
            :key="index"
            class="card relative w-24 h-36 cursor-pointer"
            @click="!matchedPairs.includes(index) && flipCard(index)"
          >
            <div
              class="card-inner transition-transform duration-500"
              :class="{ flipped: matchedPairs.includes(index) || selectedCards.includes(index) }"
            >
              <div class="card-front absolute w-full h-full rounded-lg bg-white flex items-center justify-center">
                <img :src="`/Cards/${card.image}`" alt="Card" class="w-full h-full rounded-lg" />
              </div>
  
              <div class="card-back absolute w-full h-full rounded-lg bg-red-500 flex items-center justify-center">
                <img src="/Cards/semFace.png" alt="Card Back" class="w-full h-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
  
        <!-- Informações do Jogo -->
        <div class="game-info">
          <p class="text-lg font-medium">Tempo: {{ elapsedTime }} seg</p>
          <p class="text-lg font-medium">Jogadas: {{ moves }}</p>
        </div>
      </div>
    </div>
</template>
  

<style scoped>
  .game-container {
    padding: 1rem;
    display: flex;
    justify-content: center;
  }
  
  .game-wrapper {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    position: relative;
  }
  
  .board {
    display: grid;
    justify-content: center;
    align-content: center;
    gap: 10px;
  }
  
  .card {
    perspective: 1000px;
  }
  
  .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.8s;
    transform: rotateY(180deg);
  }
  
  .card-inner.flipped {
    transform: rotateY(0);
  }
  
  .card-front,
  .card-back {
    position: absolute;
    backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .card-back {
    transform: rotateY(180deg);
  }
  
  .game-info {
    position: sticky;
    top: 1rem;
    padding: 1rem;
    background-color: #f9f9f9;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 200px;
  }
</style>
  