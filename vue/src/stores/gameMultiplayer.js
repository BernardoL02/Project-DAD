import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { useErrorStore } from '@/stores/error'
import { useLobbyStore } from '@/stores/lobby'
import { useGameStore } from '@/stores/game'
import { useTransactionStore } from '@/stores/transaction'
import { useBoardStore } from '@/stores/board'

export const useGameMultiplayerStore = defineStore('gameMultiplayer', () => {
  const activeGames = ref([])
  const currentPlayerId = ref(null)
  const socket = inject('socket')
  const storeAuth = useAuthStore()
  const router = useRouter()
  const notificationStore = useNotificationStore()
  const storeError = useErrorStore()
  const storeLobby = useLobbyStore()
  const storeGame = useGameStore()
  const transactionStore = useTransactionStore()
  const boardStore = useBoardStore()

  const timer = ref(0)
  const startTime = ref(0)
  const timerInterval = ref(null)
  const turnTimer = ref(0)
  const turnTimerInterval = ref(null)

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

  const gameOver = ref(false)
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
  socket.on('gameStarted', async (game) => {
    await storeLobby.leaveOtherLobbies(game.id)

    router.push({ path: '/multiplayer/game', query: { gameId: game.id } })
    startTimer()
  })

  // Recebe atualizações do jogo
  socket.on('gameUpdated', (updatedGame) => {
    const game = getActiveGameById(updatedGame.id)
    console.log(game)
    if (game) {
      Object.assign(game, updatedGame)
      currentPlayerId.value = updatedGame.players[updatedGame.currentPlayerIndex].id

      game.players = updatedGame.players

      // Inicia o timer do turno com o tempo restante enviado pelo servidor
      if (updatedGame.remainingTime) {
        startTurnTimer(updatedGame.remainingTime)
      }

      // Inicia o timer total apenas quando startTime estiver definido
      if (updatedGame.startTime && !startTime.value) {
        startTimer(updatedGame.startTime)
      }
    }
  })

  // Inicia o timer do turno baseado no tempo restante recebido do servidor
  const startTurnTimer = (remainingTime) => {
    if (turnTimerInterval.value) clearInterval(turnTimerInterval.value)

    turnTimer.value = remainingTime

    turnTimerInterval.value = setInterval(() => {
      if (turnTimer.value > 0) {
        turnTimer.value -= 1
      } else {
        clearInterval(turnTimerInterval.value)
      }
    }, 1000)
  }

  // Para o timer do turno
  const stopTurnTimer = () => {
    if (turnTimerInterval.value) {
      clearInterval(turnTimerInterval.value)
      turnTimerInterval.value = null
    }
    turnTimer.value = 0
  }

  // Inicia o timer baseado no startTime do servidor
  const startTimer = (serverStartTime) => {
    if (timerInterval.value) clearInterval(timerInterval.value)

    startTime.value = serverStartTime
    timerInterval.value = setInterval(() => {
      timer.value = Math.floor((Date.now() - startTime.value) / 1000)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
    timer.value = 0
    startTime.value = null
  }

  // Recebe evento de encerramento do jogo
  socket.on('gameEnded', ({ message, totalMoves, winner, updatedGame, pairsFoundByPlayers }) => {
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

    if (updatedGame.player1.id === storeAuth.user.id) {
      storeGame.sendPostOnGameEndMuiltiplayer(updatedGame, winner)
      storeGame.sendPostOnGameEndMuiltiplayerPlayers(updatedGame, winner)
    }

    stopTimer()
    router.push('/multiplayer/lobbys')
  })

  // Verifica se é o turno do jogador atual
  const isCurrentPlayerTurn = computed(() => {
    return currentPlayerId.value === storeAuth.user.id
  })

  // Vira a carta e envia para o servidor
  const flipCard = (gameId, index) => {
    socket.emit('flipCard', { gameId: Number(gameId), index }, (response) => {
      if (response.errorCode) {
        console.error(response.errorMessage)
      }
    })
  }

  socket.on('gameCancelled', ({ message, gameId, updatedGame, winner }) => {
    gameOver.value = true
    console.log(`Game ${gameId} has been cancelled.`)

    // Verifica se o usuário atual é o dono do lobby
    if (updatedGame && updatedGame.player1.id === storeAuth.user.id) {
      storeGame.sendPostOnForfeitMuiltiplayer(updatedGame, winner)
      storeGame.sendPostOnGameEndMuiltiplayerPlayers(updatedGame, winner)
    }

    storeError.setErrorMessages(message, 'Game Cancelled')
    router.push('/multiplayer/lobbys')
  })

  socket.on('playerLeft', ({ message, updatedGame }) => {
    storeError.setErrorMessages(message, 'Jogador Saiu')

    // Atualiza o jogo no estado ativo
    const gameIndex = activeGames.value.findIndex((game) => game.id === updatedGame.id)
    if (gameIndex !== -1) {
      // Substitui o jogo antigo pelo jogo atualizado
      activeGames.value.splice(gameIndex, 1, updatedGame)
    }

    currentPlayerId.value = updatedGame.players[updatedGame.currentPlayerIndex]?.id || null
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
    socket.emit('leaveGame', gameId, (response) => {
      if (response.errorCode) {
        console.error('Erro ao sair do lobby:', response.errorMessage)
      } else {
        console.log('Saiu do lobby do jogo com sucesso')
      }
    })
  }

  socket.on('ownerChanged', (response) => {
    console.log('Owner changed:', response)

    storeGame.sendPostUpdateOwner(response.updatedGame.id, response.updatedGame.player1.id)
  })

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
    leaveGameLobby,
    turnTimer,
    stopTurnTimer
  }
})
