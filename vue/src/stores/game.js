import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'

export const useGameStore = defineStore('game', () => {
  const storeError = useErrorStore()
  const authStore = useAuthStore()
  const router = useRouter()
  const notificationStore = useNotificationStore()

  const games = ref([])
  const statusFilter = ref('')
  const beginDateFilter = ref([null, null])
  const boardFilter = ref('All')

  const difficultyFilter = ref('Normal')
  const difficulty = ref('normal')

  const shuffledCards = ref([])
  const selectedCards = ref([])
  const matchedPairs = ref([])
  const startTime = ref(null)
  const endTime = ref(null)
  const moves = ref(0)
  const timer = ref(0)
  const timerInterval = ref(null)
  const currentGameId = ref(null)
  const isLeaving = ref(false)
  const initialBoard = ref([])
  const replayActions = ref([])

  const availableCards = [
    'c1.png',
    'c2.png',
    'c3.png',
    'c4.png',
    'c5.png',
    'c6.png',
    'c7.png',
    'c11.png',
    'c12.png',
    'c13.png',
    'e1.png',
    'e2.png',
    'e3.png',
    'e4.png',
    'e5.png',
    'e6.png',
    'e7.png',
    'e11.png',
    'e12.png',
    'e13.png',
    'o1.png',
    'o2.png',
    'o3.png',
    'o4.png',
    'o5.png',
    'o6.png',
    'o7.png',
    'o11.png',
    'o12.png',
    'o13.png',
    'p1.png',
    'p2.png',
    'p3.png',
    'p4.png',
    'p5.png',
    'p6.png',
    'p7.png',
    'p11.png',
    'p12.png',
    'p13.png'
  ]

  const setDifficulty = (level) => {
    difficulty.value = level
  }

  const handleBoardSizeChange = (boardSize) => {
    boardFilter.value = boardSize
  }

  const handleDifficultyChange = (difficulty) => {
    difficultyFilter.value = difficulty
  }

  const getSinglePlayerGames = async () => {
    storeError.resetMessages()
    try {
      const response = await axios.get('games/single')

      const updatedGames = response.data.data.map((game) => {
        let replay = null
        let difficulty = 'Normal'

        // Processa o campo `custom` para extrair `replay` e `difficulty`
        if (game.custom) {
          try {
            const customData = JSON.parse(game.custom)
            if (customData.replay) {
              replay = customData.replay // Extrai os dados do replay
            }
            difficulty = customData.difficulty === 'hard' ? 'Hard' : 'Normal'
          } catch (error) {
            console.error(`Erro ao processar o campo custom do jogo ID ${game.id}:`, error)
          }
        }

        return {
          id: game.id,
          difficulty,
          board_id:
            game.board_id === 1
              ? '3x4'
              : game.board_id === 2
                ? '4x4'
                : game.board_id === 3
                  ? '6x6'
                  : 'N/A',
          status:
            game.status === 'PE'
              ? 'Pending'
              : game.status === 'PL'
                ? 'In Progress'
                : game.status === 'E'
                  ? 'Ended'
                  : game.status === 'I'
                    ? 'Interrupted'
                    : 'N/A',
          began_at: game.began_at || 'N/A',
          total_time: game.total_time ? game.total_time + 's' : 'N/A',
          total_turns_winner: game.total_turns_winner || 'N/A',
          replay
        }
      })

      games.value = updatedGames
    } catch (e) {
      storeError.setErrorMessages(
        e.response?.data?.message || 'An error occurred',
        e.response?.data?.errors || [],
        e.response?.status || 500,
        "Error fetching user's single games!"
      )
    }
  }

  const getMultiPlayerGames = async () => {
    storeError.resetMessages()
    try {
      const response = await axios.get('games/multi')

      const updatedGames = response.data.data.map((game) => ({
        id: game.id,
        board_id:
          game.board_id === 1
            ? '3x4'
            : game.board_id === 2
              ? '4x4'
              : game.board_id === 3
                ? '6x6'
                : 'N/A',
        created_user:
          game.created_user.nickname === authStore.nickname ? 'You' : game.created_user.nickname,
        winner_user:
          game.winner_user.nickname === authStore.nickname ? 'You' : game.winner_user.nickname,
        participants_count: game.participants_count,
        status:
          game.status === 'PE'
            ? 'Pending'
            : game.status === 'PL'
              ? 'In Progress'
              : game.status === 'E'
                ? 'Ended'
                : game.status === 'I'
                  ? 'Interrupted'
                  : 'N/A',
        began_at: game.began_at || 'N/A',
        total_time: game.total_time + 's' || 'N/A',
        pairs_discovered: game.pairs_discovered || 'N/A'
      }))
      games.value = updatedGames
    } catch (e) {
      storeError.setErrorMessages(
        e.response?.data?.message || 'An error occurred',
        e.response?.data?.errors || [],
        e.response?.status || 500,
        "Error fetching user's single games!"
      )
    }
  }
  const filteredGames = computed(() => {
    let filtered = games.value

    if (statusFilter.value && statusFilter.value !== 'All') {
      filtered = filtered.filter((game) => game.status === statusFilter.value)
    }

    if (beginDateFilter.value && beginDateFilter.value[0] && beginDateFilter.value[1]) {
      const [startDate, endDate] = beginDateFilter.value
      filtered = filtered.filter((game) => {
        const gameDate = new Date(game.began_at)
        const start = new Date(startDate)
        const end = new Date(endDate)

        end.setHours(23, 59, 59, 999)

        return gameDate >= start && gameDate <= end
      })
    }

    if (boardFilter.value && boardFilter.value !== 'All') {
      filtered = filtered.filter((game) => game.board_id === boardFilter.value)
    }

    if (difficultyFilter.value && difficultyFilter.value !== 'All') {
      filtered = filtered.filter((game) => {
        const gameDifficulty = game.difficulty || 'Normal'
        return gameDifficulty === difficultyFilter.value
      })
    }

    return filtered
  })

  const bestResultsSinglePlayer = computed(() => {
    const endedGames = games.value.filter((game) => {
      const isBoardMatch =
        !boardFilter.value || boardFilter.value === 'All' || game.board_id === boardFilter.value

      const isDifficultyMatch =
        !difficultyFilter.value ||
        difficultyFilter.value === 'All' ||
        game.difficulty === difficultyFilter.value

      return game.status === 'Ended' && isBoardMatch && isDifficultyMatch
    })

    const sorted = endedGames.sort((a, b) => {
      const timeA = parseFloat(a.total_time.replace('s', '')) || 0
      const timeB = parseFloat(b.total_time.replace('s', '')) || 0

      const turnsA =
        a.total_turns_winner === 'N/A'
          ? Number.MAX_SAFE_INTEGER
          : parseInt(a.total_turns_winner, 10) || 0
      const turnsB =
        b.total_turns_winner === 'N/A'
          ? Number.MAX_SAFE_INTEGER
          : parseInt(b.total_turns_winner, 10) || 0

      if (timeA !== timeB) {
        return timeA - timeB
      }
      return turnsA - turnsB
    })

    return sorted.slice(0, 10).map(({ replay, ...rest }) => rest)
  })

  const bestResultsMultiplayer = computed(() => {
    const endedGames = games.value.filter((game) => {
      const isWinnerYou = game.winner_user === 'You'
      const isBoardMatch =
        !boardFilter.value || boardFilter.value === 'All' || game.board_id === boardFilter.value

      return game.status === 'Ended' && isWinnerYou && isBoardMatch
    })

    const sorted = endedGames.sort((a, b) => {
      const timeA = parseFloat(a.total_time.replace('s', '')) || 0
      const timeB = parseFloat(b.total_time.replace('s', '')) || 0

      if (timeA === timeB) {
        const pairsA = a.pairs_discovered === 'N/A' ? 0 : a.pairs_discovered
        const pairsB = b.pairs_discovered === 'N/A' ? 0 : b.pairs_discovered

        if (pairsA === pairsB) {
          const playersA = a.participants_count || 0
          const playersB = b.participants_count || 0

          return playersB - playersA
        }

        return pairsB - pairsA
      }

      return timeA - timeB
    })

    return sorted
  })

  const totalMultiplayerVictorys = computed(() => {
    const endedGames = games.value.filter((game) => {
      const isWinnerYou = game.winner_user === 'You'
      return game.status === 'Ended' && isWinnerYou
    })

    return endedGames.length
  })

  const totalMultiplayerLosses = computed(() => {
    const endedGames = games.value.filter((game) => {
      const isWinnerYou = game.winner_user !== 'You'
      return game.status === 'Ended' && isWinnerYou
    })

    return endedGames.length
  })

  const totalTimePlayedMultiPlayer = computed(() => {
    let totalTimeInSeconds = 0

    games.value.forEach((game) => {
      totalTimeInSeconds += parseFloat(game.total_time.replace('s', '')) || 0
    })

    return (totalTimeInSeconds / 60).toFixed(2)
  })

  const createSinglePlayer = async (board_id, difficulty) => {
    try {
      const beganAt = new Date().toISOString().slice(0, 19).replace('T', ' ')

      const payload = {
        type: 'S',
        status: 'PL',
        began_at: beganAt,
        board_id: board_id
      }

      // Adicionar "custom" apenas se a dificuldade for válida
      if (difficulty && difficulty !== 'normal') {
        payload.custom = JSON.stringify({ difficulty })
      }

      const response = await axios.post('games', payload)

      const createdGame = response.data.data
      return createdGame.id
    } catch (e) {
      console.error('Error creating single-player game:', e)
      throw new Error('Failed to create single-player game')
    }
  }

  const saveInitialBoard = () => {
    const boardSize = boardFilter.value.split('x').map(Number)
    let boardMatrix = []
    let index = 0

    for (let i = 0; i < boardSize[0]; i++) {
      let row = []
      for (let j = 0; j < boardSize[1]; j++) {
        row.push(shuffledCards.value[index].image)
        index++
      }
      boardMatrix.push(row)
    }
    initialBoard.value = boardMatrix
    console.log(boardMatrix)
  }

  const registerAction = (position) => {
    console.log(position)
    replayActions.value.push({
      time: Date.now() - startTime.value.getTime(), // Captura o tempo decorrido em milissegundos
      position: position // Posição da carta virada
    })
  }

  const sendPostOnExit = async (gameId) => {
    try {
      if (!gameId) {
        console.error('Game ID não está definido.')
        return
      }

      await axios.patch(`/games/${gameId}`, {
        status: 'I'
      })
    } catch (error) {
      console.error('Erro ao atualizar status do jogo:', error.response?.data || error.message)
    }
  }

  const sendPostOnGameEnd = async (totalTime, totalTurns, gameId) => {
    try {
      if (!gameId) {
        console.error('Game ID is not defined.')
        return
      }

      const ended = new Date().toISOString().slice(0, 19).replace('T', ' ')

      const replayData = {
        replay: {
          board: initialBoard.value, // The initial board state
          actions: replayActions.value // The actions performed by the player
        }
      }

      // Send updated data to the backend
      await axios.patch(`/games/${gameId}`, {
        status: 'E',
        ended_at: ended,
        total_time: totalTime,
        total_turns_winner: totalTurns,
        custom: JSON.stringify(replayData) // Only send replay data
      })
    } catch (error) {
      console.error('Error updating game status:', error.response?.data || error.message)
    }
  }

  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5)

  const totalCards = computed(() => {
    if (!boardFilter.value || !boardFilter.value.includes('x')) return 16
    const [rows, cols] = boardFilter.value.split('x').map(Number)
    return Math.min(rows * cols, availableCards.length * 2)
  })

  const generateCards = () => {
    const [rows, cols] = boardFilter.value.split('x').map(Number)
    const totalCards = rows * cols

    let cards = []

    if (difficulty.value === 'hard') {
      const trioCount = Math.floor(totalCards / 3)
      const remainingCards = totalCards % 3

      const shuffledAvailableCards = shuffleArray([...availableCards])
      for (let i = 0; i < trioCount; i++) {
        const cardImage = shuffledAvailableCards[i % shuffledAvailableCards.length]
        cards.push(
          { id: i + 1, image: cardImage },
          { id: i + 1, image: cardImage },
          { id: i + 1, image: cardImage }
        )
      }
    } else {
      const pairCount = Math.floor(totalCards / 2)

      const shuffledAvailableCards = shuffleArray([...availableCards])
      for (let i = 0; i < pairCount; i++) {
        const cardImage = shuffledAvailableCards[i % shuffledAvailableCards.length]
        cards.push({ id: i + 1, image: cardImage }, { id: i + 1, image: cardImage })
      }
    }

    shuffledCards.value = shuffleArray(cards)
  }

  const startGame = (size, gameId) => {
    currentGameId.value = gameId

    boardFilter.value = size

    generateCards()
    saveInitialBoard()

    timer.value = 0
    moves.value = 0
    matchedPairs.value = []
    selectedCards.value = []
    startTime.value = null
    endTime.value = null

    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  const flipCard = (index) => {
    if (!startTime.value) {
      startTime.value = new Date()
      timerInterval.value = setInterval(() => {
        const now = new Date()
        timer.value = Math.floor((now - startTime.value) / 1000)
      }, 1000)
    }

    const position = [
      Math.floor(index / boardFilter.value.split('x')[1]),
      index % boardFilter.value.split('x')[1]
    ]

    registerAction(position)

    if (difficulty.value === 'hard') {
      if (selectedCards.value.length < 3 && !selectedCards.value.includes(index)) {
        selectedCards.value.push(index)

        if (selectedCards.value.length === 3) {
          moves.value++
          checkMatch()
        }
      }
    } else {
      if (selectedCards.value.length < 2 && !selectedCards.value.includes(index)) {
        selectedCards.value.push(index)

        if (selectedCards.value.length === 2) {
          moves.value++
          checkMatch()
        }
      }
    }
  }

  const checkMatch = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (difficulty.value === 'hard') {
      const [firstIndex, secondIndex, thirdIndex] = selectedCards.value
      if (
        shuffledCards.value[firstIndex].id === shuffledCards.value[secondIndex].id &&
        shuffledCards.value[firstIndex].id === shuffledCards.value[thirdIndex].id
      ) {
        matchedPairs.value.push(firstIndex, secondIndex, thirdIndex)
      }
    } else {
      const [firstIndex, secondIndex] = selectedCards.value
      if (shuffledCards.value[firstIndex].id === shuffledCards.value[secondIndex].id) {
        matchedPairs.value.push(firstIndex, secondIndex)
      }
    }

    selectedCards.value = []

    if (matchedPairs.value.length === shuffledCards.value.length) {
      endTime.value = new Date()
      clearInterval(timerInterval.value)
      timerInterval.value = null
      const totalTime = Math.floor((endTime.value - startTime.value) / 1000)
      sendPostOnGameEnd(totalTime, moves.value, currentGameId.value)
      setIsLeaving(true)

      notificationStore.setSuccessMessage(
        `You completed the game in ${totalTime} seconds!`,
        'Congratulations!'
      )

      router.push('/singlePlayer')
    }
  }

  const elapsedTime = computed(() => {
    if (startTime.value && endTime.value) {
      return Math.floor((endTime.value - startTime.value) / 1000)
    }
    return timer.value
  })

  const setIsLeaving = (value) => {
    isLeaving.value = value
  }

  const resetIsLeaving = () => {
    isLeaving.value = false
  }

  return {
    games,
    getSinglePlayerGames,
    getMultiPlayerGames,
    createSinglePlayer,
    sendPostOnExit,
    sendPostOnGameEnd,
    statusFilter,
    beginDateFilter,
    boardFilter,
    filteredGames,
    bestResultsSinglePlayer,
    bestResultsMultiplayer,
    handleBoardSizeChange,
    totalMultiplayerVictorys,
    totalMultiplayerLosses,
    totalTimePlayedMultiPlayer,
    difficultyFilter,
    setDifficulty,
    handleDifficultyChange,
    difficulty,
    shuffledCards,
    selectedCards,
    matchedPairs,
    startTime,
    endTime,
    moves,
    timer,
    elapsedTime,
    flipCard,
    startGame,
    isLeaving,
    setIsLeaving,
    resetIsLeaving
  }
})
