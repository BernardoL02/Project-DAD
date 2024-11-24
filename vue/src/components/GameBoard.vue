<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const size = ref(route.params.size || '3x4');


const shuffledCards = ref([]);
const selectedCards = ref([]);
const matchedPairs = ref([]);
const gameStarted = ref(false);
const startTime = ref(null);
const endTime = ref(null);
const moves = ref(0);
const timerInterval = ref(null); 

const totalCards = computed(() => {
  if (!size.value || !size.value.includes('x')) return 16;
  const [rows, cols] = size.value.split('x').map(Number);
  return rows * cols;
});


const generateCards = () => {
  const pairsCount = totalCards.value / 2;
  const cards = [];
  for (let i = 1; i <= pairsCount; i++) {
    cards.push({ id: i, image: `c${i}.png` }, { id: i, image: `c${i}.png` });
  }
  shuffledCards.value = [...cards].sort(() => Math.random() - 0.5);
};


const elapsedTime = computed(() => {
  if (startTime.value && endTime.value) {
    return Math.floor((endTime.value - startTime.value) / 1000);
  }
  return startTime.value ? Math.floor((new Date() - startTime.value) / 1000) : 0;
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
  generateCards();

  timerInterval.value = setInterval(() => {
    if (startTime.value) elapsedTime.value;
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
    <div class="game-info text-center mb-6">
      <p class="text-lg font-medium">Tempo: {{ elapsedTime }} segundos</p>
      <p class="text-lg font-medium">Jogadas: {{ moves }}</p>
    </div>

    <div
      v-if="gameStarted"
      :class="`board grid grid-cols-${size.split('x')[1] || 4} gap-4 p-6 bg-gray-100 rounded-lg shadow-md`"
    >
      <div
        v-for="(card, index) in shuffledCards"
        :key="index"
        class="card relative w-32 h-48 cursor-pointer"
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
  </div>
</template>

<style scoped>
.game-container {
  min-height: 100vh;
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.board {
  display: grid;
  justify-content: center;
  align-items: center;
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
</style>
