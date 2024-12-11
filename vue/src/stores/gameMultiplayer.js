// stores/gameMultiplayer.js
import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export const useGameMultiplayerStore = defineStore('gameMultiplayer', () => {
  const activeGames = ref([])
  const timer = ref(0)
  const timerInterval = ref(null)
  const currentPlayerId = ref(null)
  const socket = inject('socket')
  const storeAuth = useAuthStore()
  const router = useRouter()

  // Adiciona um novo jogo ativo à lista
  const addActiveGame = (game) => {
    if (!activeGames.value.find((g) => g.id === game.id)) {
      if (!game.matchedPairs) game.matchedPairs = [] // Inicializa matchedPairs se não existir
      activeGames.value.push(game)
    }
  }

  // Obtém um jogo ativo pelo ID
  const getActiveGameById = (gameId) => {
    return activeGames.value.find((game) => game.id === gameId)
  }

  // Inicia o jogo
  const startGame = (gameId, callback) => {
    socket.emit('startGame', Number(gameId), (game) => {
      if (game) {
        addActiveGame(game)

        if (game.players && game.players.length > 0 && game.currentPlayerIndex !== undefined) {
          currentPlayerId.value = game.players[game.currentPlayerIndex].id
        } else {
          console.error('Players or currentPlayerIndex is undefined:', game)
        }

        startTimer()
        if (callback) callback(game)
      } else {
        console.error('Failed to start the game.')
      }
    })
  }

  // Recebe evento de início do jogo e redireciona todos os jogadores
  socket.on('gameStarted', (game) => {
    console.log('Received gameStarted event:', game) // Debugging

    addActiveGame(game)
    if (game.players && Array.isArray(game.players) && game.players[game.currentPlayerIndex]) {
      currentPlayerId.value = game.players[game.currentPlayerIndex].id
    } else {
      console.error('Invalid players or currentPlayerIndex:', game)
    }

    router.push({ path: '/multiplayer/game', query: { gameId: game.id } })
    startTimer()
  })

  // Recebe atualizações do jogo
  socket.on('gameUpdated', (updatedGame) => {
    const game = getActiveGameById(updatedGame.id)
    if (game) {
      Object.assign(game, updatedGame)
      currentPlayerId.value = updatedGame.players[updatedGame.currentPlayerIndex].id
    }
  })

  // Verifica se é o turno do jogador atual
  const isCurrentPlayerTurn = computed(() => {
    return currentPlayerId.value === storeAuth.user.id
  })

  // Inicia o timer
  const startTimer = () => {
    timer.value = 0
    if (timerInterval.value) clearInterval(timerInterval.value)
    timerInterval.value = setInterval(() => {
      timer.value++
    }, 1000)
  }

  // Para o timer
  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  // Vira a carta e envia para o servidor
  const flipCard = (gameId, index) => {
    socket.emit('flipCard', { gameId: Number(gameId), index }, (response) => {
      if (response.errorCode) {
        console.error(response.errorMessage)
      }
    })
  }

  return {
    activeGames,
    addActiveGame,
    getActiveGameById,
    startGame,
    flipCard,
    timer,
    startTimer,
    stopTimer,
    isCurrentPlayerTurn
  }
})
