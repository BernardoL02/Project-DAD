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

  socket.on('gameStarted', async (game) => {
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
    } else {
      console.error(
        'Nenhum board correspondente encontrado para as linhas e colunas especificadas.'
      )
    }

    router.push({ path: '/multiplayer/game', query: { gameId: game.id } })

    startTimer()
  })

  socket.on('gameUpdated', (updatedGame) => {
    const game = getActiveGameById(updatedGame.id)
    if (game) {
      Object.assign(game, updatedGame)
      currentPlayerId.value = updatedGame.players[updatedGame.currentPlayerIndex].id

      game.players = updatedGame.players

      if (updatedGame.remainingTime) {
        startTurnTimer(updatedGame.remainingTime)
      }

      if (updatedGame.startTime && !startTime.value) {
        startTimer(updatedGame.startTime)
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

  socket.on('gameEnded', ({ totalMoves, winner, updatedGame, pairsFoundByPlayers }) => {
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
    router.push('/multiplayer/lobbys')
  })

  const isCurrentPlayerTurn = computed(() => {
    return currentPlayerId.value === storeAuth.user.id
  })

  const flipCard = (gameId, index) => {
    socket.emit('flipCard', { gameId: Number(gameId), index }, (response) => {
      if (response.errorCode) {
        console.error(response.errorMessage)
      }
    })
  }

  socket.on('gameCancelled', ({ message, updatedGame, winner }) => {
    gameOver.value = true

    if (updatedGame && updatedGame.player1.id === storeAuth.user.id) {
      storeGame.sendPostOnForfeitMuiltiplayer(updatedGame, winner)
      storeGame.sendPostOnGameEndMuiltiplayerPlayers(updatedGame, winner)
    }

    storeError.setErrorMessages(message, 'Game Cancelled')
    router.push('/multiplayer/lobbys')
  })

  socket.on('playerLeft', ({ message, updatedGame }) => {
    storeError.setErrorMessages(message, 'Jogador Saiu')

    const gameIndex = activeGames.value.findIndex((game) => game.id === updatedGame.id)
    if (gameIndex !== -1) {
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
    storeGame.sendPostUpdateOwner(response.updatedGame.id, response.updatedGame.player1.id)
  })

  return {
    activeGames,
    gameOver,
    addActiveGame,
    getActiveGameById,
    flipCard,
    timer,
    startTimer,
    stopTimer,
    isCurrentPlayerTurn,
    leaveAllLobbies,
    leaveGameLobby,
    turnTimer,
    stopTurnTimer
  }
})
