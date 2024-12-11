// stores/gameMultiplayer.js
import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { useErrorStore } from '@/stores/error'

export const useGameMultiplayerStore = defineStore('gameMultiplayer', () => {
  const activeGames = ref([])
  const timer = ref(0)
  const timerInterval = ref(null)
  const currentPlayerId = ref(null)
  const socket = inject('socket')
  const storeAuth = useAuthStore()
  const router = useRouter()
  const notificationStore = useNotificationStore()
  const storeError = useErrorStore()

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
    gameOver.value = false // Reinicia o estado do jogo
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

  const gameOver = ref(false)
  // Recebe evento de encerramento do jogo
  socket.on('gameEnded', ({ message, totalMoves, pairsFoundByPlayers }) => {
    gameOver.value = true // Define que o jogo acabou
    const currentPlayer = pairsFoundByPlayers.find(
      (player) => player.nickname === storeAuth.user.nickname
    )

    if (currentPlayer) {
      notificationStore.setSuccessMessage(
        `You completed the game in ${totalMoves} moves! You found ${currentPlayer.pairsFound} pairs.`,
        'Congratulations!'
      )
    } else {
      notificationStore.setSuccessMessage(
        `You completed the game in ${totalMoves} moves!`,
        'Game Over'
      )
    }

    stopTimer()
    router.push('/multiplayer/lobbys')
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

  socket.on('gameCancelled', ({ message, gameId }) => {
    console.log(`Game ${gameId} was cancelled: ${message}`)
    storeError.setErrorMessages(message, 'Jogo Cancelado')
    router.push('/multiplayer/lobbys')
  })

  socket.on('playerLeft', ({ message, gameId }) => {
    console.log(`Player left event: ${message}`)
    storeError.setErrorMessages(message, 'Jogador Saiu')
  })

  const leaveAllLobbies = () => {
    socket.emit('leaveAllLobbies', storeAuth.user.id, (response) => {
      if (response.errorCode) {
        console.error('Erro ao sair de todos os lobbies:', response.errorMessage)
      } else {
        console.log('Saiu de todos os lobbies com sucesso')
      }
    })
  }

  const leaveGameLobby = (gameId) => {
    socket.emit('leaveLobby', gameId, (response) => {
      if (response.errorCode) {
        console.error('Erro ao sair do lobby:', response.errorMessage)
      } else {
        console.log('Saiu do lobby do jogo com sucesso')
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
    isCurrentPlayerTurn,
    gameOver,
    leaveAllLobbies,
    leaveGameLobby
  }
})
