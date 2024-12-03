<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

const props = defineProps({
  size: {
    type: String,
    required: true
  },
  gameId: {
    type: Number,
    required: true
  }
})

const router = useRouter()
const gameStore = useGameStore()

const gameStartedAnimation = ref(false)
const showModal = ref(false)
const isLeaving = computed(() => gameStore.isLeaving)
let unregisterGuard = null
let pendingRoute = null

const confirmExit = async () => {
  gameStore.setIsLeaving(true)
  await gameStore.sendPostOnExit(props.gameId)
  showModal.value = false

  if (pendingRoute) {
    router.push(pendingRoute)
    pendingRoute = null
  } else {
    router.push('/')
  }
}

const cancelExit = () => {
  showModal.value = false
  gameStore.setIsLeaving(false)
  pendingRoute = null
}

const handleBeforeUnload = (event) => {
  event.preventDefault()
  gameStore.sendPostOnExit(props.gameId)
  event.returnValue = ''
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  gameStore.startGame(props.size, props.gameId)
  setTimeout(() => {
    gameStartedAnimation.value = true
  }, 100)
  gameStore.resetIsLeaving()

  unregisterGuard = router.beforeEach((to, from, next) => {
    if (from.path.startsWith('/game') && !isLeaving.value) {
      pendingRoute = to.path
      showModal.value = true
      next(false)
    } else {
      next()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  if (gameStore.timerInterval) clearInterval(gameStore.timerInterval)

  if (unregisterGuard) unregisterGuard()
})
</script>


<template>
  <div>
    <transition name="fade-in-scale" appear>
      <div v-if="gameStartedAnimation" class="game-container flex justify-center gap-10">
        <!-- Tabuleiro -->
        <div class="game-board grid gap-2 bg-gray-100 p-4 rounded-lg shadow-md" :style="{
          gridTemplateRows: `repeat(${props.size.split('x')[0] || 4}, 1fr)`,
          gridTemplateColumns: `repeat(${props.size.split('x')[1] || 4}, 1fr)`
        }">
          <div v-for="(card, index) in gameStore.shuffledCards" :key="index"
            class="relative cursor-pointer transition-opacity duration-300"
            :class="{ 'opacity-50 pointer-events-none': gameStore.matchedPairs.includes(index) }"
            @click="gameStore.flipCard(index)">
            <!-- Carta -->
            <div class="w-24 h-36 transform-style-preserve-3d transition-transform duration-500 rotate-y-180" :class="{
              'rotate-y-0': gameStore.matchedPairs.includes(index) || gameStore.selectedCards.includes(index)
            }">
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
          <p class="text-lg font-medium">Tempo: {{ gameStore.elapsedTime }} seg</p>
          <p class="text-lg font-medium">Jogadas: {{ gameStore.moves }}</p>
        </div>
      </div>
    </transition>

    <!-- Modal de Confirmação -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded shadow-md w-96">
        <h2 class="text-xl font-bold mb-4">Confirmação</h2>
        <p class="mb-4">
          Tem certeza de que deseja sair do jogo? <br />
          O progresso será perdido.
        </p>
        <div class="flex justify-end space-x-4">
          <button class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" @click="cancelExit">
            Cancelar
          </button>
          <button class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" @click="confirmExit">
            Sair
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-in-scale-enter-active,
.fade-in-scale-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.fade-in-scale-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.fade-in-scale-enter-to {
  opacity: 1;
  transform: scale(1);
}

.fade-in-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}

.fade-in-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Outras classes do tabuleiro */
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
