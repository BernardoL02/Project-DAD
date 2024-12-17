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

  const addActiveGame = (game) => {
    if (!activeGames.value.find((g) => g.id === game.id)) {
      if (!game.matchedPairs) game.matchedPairs = []
      activeGames.value.push(game)
    }
  }

  const getActiveGameById = (gameId) => {
    return activeGames.value.find((game) => game.id === gameId)
  }

  const gameOver = ref(false)
  const isTimerSynced = ref(false)

  socket.on('gameStarted', async (game) => {
    resetTimer()
    gameOver.value = false
    addActiveGame(game)

    await storeLobby.leaveOtherLobbies(game.id)

    await boardStore.getBoards()

    const matchingBoard = boardStore.boards.find(
      (board) => board.board_rows === game.rows && board.board_cols === game.cols
    )

    if (matchingBoard) {
      const boardId = matchingBoard.id

      await transactionStore.createTransactionsGames(game.id, 5, boardId, 'Multi-Player')
    }

    router.push({ path: '/multiplayer/game', query: { gameId: game.id } })
  })

  socket.on('gameUpdated', (updatedGame) => {
    const game = getActiveGameById(updatedGame.id)
    if (game) {
      Object.assign(game, updatedGame)
      currentPlayerId.value = updatedGame.players[updatedGame.currentPlayerIndex].id

      if (updatedGame.remainingTime) {
        startTurnTimer(updatedGame.remainingTime)
      }

      if (updatedGame.startTime && updatedGame.serverTime) {
        syncTimer(updatedGame.startTime, updatedGame.serverTime)
      }
    }
  })

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

  const stopTurnTimer = () => {
    if (turnTimerInterval.value) {
      clearInterval(turnTimerInterval.value)
      turnTimerInterval.value = null
    }
    turnTimer.value = 0
  }

  const syncTimer = (serverStartTime, serverTime) => {
    if (isTimerSynced.value) return

    const elapsedServerTime = (serverTime - serverStartTime) / 1000

    if (timer.value === 0) {
      timer.value = elapsedServerTime
    }

    startTime.value = serverTime

    if (!timerInterval.value) {
      timerInterval.value = setInterval(() => {
        timer.value += 0.1
      }, 100)
    }

    isTimerSynced.value = true
  }

  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
    timer.value = 0
    startTime.value = 0
    isTimerSynced.value = false
  }

  const resetTimer = () => {
    timer.value = 0
    startTime.value = 0
    isTimerSynced.value = false

    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  socket.on(
    'gameEnded',
    async ({ message, totalMoves, winner, updatedGame, pairsFoundByPlayers }) => {
      gameOver.value = true
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
      await storeAuth.fetchProfile()
      router.push('/multiplayer')
    }
  )

  const isCurrentPlayerTurn = computed(() => {
    return currentPlayerId.value === storeAuth.user.id
  })

  const flipCard = (gameId, index) => {
    socket.emit('flipCard', { gameId: Number(gameId), index }, (response) => {})
  }

  socket.on('gameCancelled', async ({ message, gameId, updatedGame, winner }) => {
    gameOver.value = true

    if (updatedGame && updatedGame.player1.id === storeAuth.user.id) {
      storeGame.sendPostOnForfeitMuiltiplayer(updatedGame, winner)
      await storeGame.sendPostOnGameEndMuiltiplayerPlayers(updatedGame, winner)
    }

    notificationStore.setSuccessMessage(message, 'Game Over')
    await storeAuth.fetchProfile()
    router.push('/multiplayer')
  })

  socket.on('playerLeft', ({ message, updatedGame }) => {
    storeError.setErrorMessages(message, [], 500, 'Player Left')

    const gameIndex = activeGames.value.findIndex((game) => game.id === updatedGame.id)
    if (gameIndex !== -1) {
      activeGames.value.splice(gameIndex, 1, updatedGame)
    }

    currentPlayerId.value = updatedGame.players[updatedGame.currentPlayerIndex]?.id || null
  })

  const leaveAllLobbies = () => {
    socket.emit('leaveAllLobbies', storeAuth.user.id, (response) => {})
  }

  const leaveGameLobby = (gameId) => {
    socket.emit('leaveGame', gameId, (response) => {
      if (response.errorCode) {
        storeError.setErrorMessages(
          response.errorMessage || 'An error occurred while leaving the game lobby.',
          [],
          response.errorCode,
          'Leave Game Error'
        )
      } else {
        storeError.setSuccessMessages('Successfully left the game lobby.', {}, 200, 'Leave Game')
      }
    })
  }

  socket.on('ownerChanged', (response) => {
    storeGame.sendPostUpdateOwner(response.updatedGame.id, response.updatedGame.player1.id)
  })

  const restoreGame = async (gameId) => {
    const gameIdInt = parseInt(gameId, 10)

    const game = getActiveGameById(gameIdInt)

    currentPlayerId.value = game.players[game.currentPlayerIndex]?.id || null

    if (game.startTime) {
      syncTimer(game.startTime, game.serverTime)
    }

    if (game.remainingTime) {
      startTurnTimer(game.remainingTime)
    }
  }

  const fetchGameById = async (gameId) => {
    return new Promise((resolve, reject) => {
      socket.emit('fetchGame', gameId, (game) => {
        if (game) {
          addActiveGame(game)
          resolve(game)
        }
      })
    })
  }

  return {
    activeGames,
    gameOver,
    addActiveGame,
    getActiveGameById,
    flipCard,
    timer,
    syncTimer,
    stopTimer,
    isCurrentPlayerTurn,
    leaveAllLobbies,
    leaveGameLobby,
    turnTimer,
    startTurnTimer,
    stopTurnTimer,
    restoreGame,
    fetchGameById
  }
})
