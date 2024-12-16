import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import avatarNoneAssetURL from '@/assets/avatar-none.png'

export const useGameStore = defineStore('game', () => {
  const storeError = useErrorStore()
  const authStore = useAuthStore()
  const router = useRouter()
  const notificationStore = useNotificationStore()

  const games = ref([])
  const game = ref([])
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

        if (game.custom) {
          try {
            const customData = JSON.parse(game.custom)
            if (customData.replay) {
              replay = customData.replay
            }
            difficulty = customData.difficulty === 'hard' ? 'Hard' : 'Normal'
          } catch (error) {}
        }

        return {
          difficulty,
          board_id:
            game.board_id === 1
              ? '3x4'
              : game.board_id === 2
                ? '4x4'
                : game.board_id === 3
                  ? '6x6'
                  : '-',
          status:
            game.status === 'PE'
              ? 'Pending'
              : game.status === 'PL'
                ? 'In Progress'
                : game.status === 'E'
                  ? 'Ended'
                  : game.status === 'I'
                    ? 'Interrupted'
                    : '-',
          began_at: game.began_at || '-',
          total_time: game.total_time ? game.total_time + 's' : '-',
          total_turns_winner: game.total_turns_winner || '-',
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

  const getMultiPlayerGame = async (gameId) => {
    storeError.resetMessages()

    const baseUrl = axios.defaults.baseURL.replace('/api', '')

    try {
      const response = await axios.get('games/' + gameId)
      const gameData = response.data.data

      game.value = {
        id: gameData.id,
        board_id:
          gameData.board_id === 1
            ? '3x4'
            : gameData.board_id === 2
              ? '4x4'
              : gameData.board_id === 3
                ? '6x6'
                : '-',
        created_user:
          gameData.created_user.nickname === authStore.nickname
            ? 'You'
            : gameData.created_user.nickname,
        created_user_photo: gameData.created_user.photo_filename
          ? `${baseUrl}/storage/photos/${gameData.created_user.photo_filename}`
          : avatarNoneAssetURL,
        winner_user:
          gameData.winner_user.nickname === authStore.nickname
            ? 'You'
            : gameData.winner_user.nickname,
        winner_user_photo: gameData.winner_user.photo_filename
          ? `${baseUrl}/storage/photos/${gameData.winner_user.photo_filename}`
          : avatarNoneAssetURL,
        participants_count: gameData.participants_count || '-',
        participants: gameData.participants.map((participant) => ({
          name: participant.name,
          player_name: participant.player_name,
          player_won: participant.player_won,
          pairs_discovered: participant.pairs_discovered,
          photo_filename:
            participant.photo_filename != null
              ? `${baseUrl}/storage/photos/${participant.photo_filename}`
              : avatarNoneAssetURL
        })),
        status:
          gameData.status === 'PE'
            ? 'Pending'
            : gameData.status === 'PL'
              ? 'In Progress'
              : gameData.status === 'E'
                ? 'Ended'
                : gameData.status === 'I'
                  ? 'Interrupted'
                  : '-',
        began_at: gameData.began_at || '-',
        ended_at: gameData.ended_at || '-',
        total_time: gameData.total_time ? `${gameData.total_time}s` : '-',
        total_turns_winner: gameData.total_turns_winner || '-'
      }
    } catch (e) {
      storeError.setErrorMessages(
        e.response?.data?.message || 'An error occurred',
        e.response?.data?.errors || [],
        e.response?.status || 500,
        'Error getting game!'
      )
    }
  }

  const getMultiPlayerGames = async () => {
    storeError.resetMessages()
    try {
      const response = await axios.get('games/multi')
      const updatedGames = response.data.data.map((game) => ({
        Id: game.id,
        board_id:
          game.board_id === 1
            ? '3x4'
            : game.board_id === 2
              ? '4x4'
              : game.board_id === 3
                ? '6x6'
                : '-',
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
                  : '-',
        began_at: game.began_at || '-',
        total_time: game.total_time + 's' || '-',
        pairs_discovered: game.pairs_discovered || '-'
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
        a.total_turns_winner === '-'
          ? Number.MAX_SAFE_INTEGER
          : parseInt(a.total_turns_winner, 10) || 0
      const turnsB =
        b.total_turns_winner === '-'
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
        const pairsA = a.pairs_discovered === '-' ? 0 : a.pairs_discovered
        const pairsB = b.pairs_discovered === '-' ? 0 : b.pairs_discovered

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

      if (difficulty && difficulty !== 'normal') {
        payload.custom = JSON.stringify({ difficulty })
      }

      const response = await axios.post('games', payload)

      const createdGame = response.data.data
      return createdGame.id
    } catch (e) {
      throw new Error('Failed to create single-player game')
    }
  }

  const createMultiPlayer = async (board_id) => {
    try {
      const payload = {
        type: 'M',
        status: 'PE',
        board_id: board_id
      }

      const response = await axios.post('games', payload)

      const createdGame = response.data.data
      return createdGame.id
    } catch (e) {
      throw new Error('Falha ao criar o jogo multiplayer')
    }
  }

  const sendPostUpdateOwner = async (gameId, IdUser) => {
    try {
      if (!gameId) {
        return
      }
      if (!IdUser) {
        return
      }

      await axios.patch(`/games/${gameId}/owner`, {
        new_owner_id: IdUser
      })
    } catch (error) {}
  }

  const saveInitialBoard = () => {
    const boardSize = boardFilter.value.split('x').map(Number)
    let boardMatrix = []
    let index = 0
    const totalShuffledCards = shuffledCards.value.length

    for (let i = 0; i < boardSize[0]; i++) {
      let row = []
      for (let j = 0; j < boardSize[1]; j++) {
        if (index < totalShuffledCards) {
          row.push(shuffledCards.value[index].image)
        } else {
          row.push(null)
        }
        index++
      }
      boardMatrix.push(row)
    }

    initialBoard.value = boardMatrix
  }

  const registerAction = (position) => {
    replayActions.value.push({
      time: Date.now() - startTime.value.getTime(),
      position: position
    })
  }

  const sendPostOnExit = async (gameId) => {
    try {
      if (!gameId) {
        return
      }

      await axios.patch(`/games/${gameId}`, {
        status: 'I'
      })
    } catch (error) {}
  }

  const sendPostOnInPorgress = async (gameId) => {
    try {
      if (!gameId) {
        return
      }

      await axios.patch(`/games/${gameId}`, {
        status: 'PL'
      })
    } catch (error) {}
  }

  const storePlayers = async (game) => {
    try {
      const gameId = game.id

      const userIds = game.players.map((player) => player.id)

      const response = await axios.post(`/games/${gameId}`, {
        user_ids: userIds
      })

      return response.data
    } catch (error) {
      storeError.setErrorMessages(error.response?.data?.message || 'Error storing players', 'Error')
    }
  }

  const updatePlayers = async (game) => {
    try {
      const response = await axios.patch(`/games/${gameId}/players`, {
        updates
      })

      return response.data
    } catch (error) {
      storeError.setErrorMessages(
        error.response?.data?.message || 'Error updating players',
        'Error'
      )
    }
  }

  const sendPostOnGameEndMuiltiplayer = async (game, winner) => {
    try {
      if (!game.id) {
        return
      }

      if (!game.startTime) {
        return
      }

      const totalTime = ((game.endMatch - game.startTime) / 1000).toFixed(2)

      const ended = new Date(game.endMatch).toISOString().slice(0, 19).replace('T', ' ')

      const requestData = {
        status: 'E',
        began_at: new Date(game.startTime).toISOString().slice(0, 19).replace('T', ' '),
        ended_at: ended,
        winner_user_id: winner.id,
        total_time: totalTime,
        total_turns_winner: winner.totalTurns
      }

      await axios.patch(`/games/${game.id}`, requestData)
    } catch (error) {
      console.error('Error sending game end data:', error)
    }
  }

  const sendPostOnForfeitMuiltiplayer = async (game, winner) => {
    try {
      if (!game.id) {
        return
      }

      const requestData = {
        status: 'E',
        winner_user_id: winner.id
      }

      if (game.startTime) {
        const ended = new Date(game.endMatch).toISOString().slice(0, 19).replace('T', ' ')
        requestData.began_at = new Date(game.startTime).toISOString().slice(0, 19).replace('T', ' ')
        requestData.ended_at = ended
      }

      await axios.patch(`/games/${game.id}`, requestData)
    } catch (error) {}
  }

  const sendPostOnGameEndMuiltiplayerPlayers = async (game, winner) => {
    try {
      if (!game.id) {
        return
      }

      if (!game.players || !Array.isArray(game.players)) {
        return
      }

      const updates = game.players.map((player) => ({
        id: player.id,
        player_won: player.id === winner.id,
        pairs_discovered: player.pairsFound || 0
      }))

      const requestData = {
        updates
      }

      await axios.patch(`/games/${game.id}/players`, requestData)
    } catch (error) {}
  }

  const sendPostOnGameEnd = async (totalTime, totalTurns, gameId) => {
    try {
      if (!gameId) {
        return
      }

      const ended = new Date().toISOString().slice(0, 19).replace('T', ' ')

      const replayData = {
        replay: {
          board: initialBoard.value,
          actions: replayActions.value
        }
      }

      await axios.patch(`/games/${gameId}`, {
        status: 'E',
        ended_at: ended,
        total_time: totalTime,
        total_turns_winner: totalTurns,
        custom: JSON.stringify(replayData)
      })
    } catch (error) {}
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
        timer.value = now - startTime.value
      }, 10)
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
      const totalTime = (endTime.value - startTime.value) / 1000
      sendPostOnGameEnd(totalTime, moves.value, currentGameId.value)
      setIsLeaving(true)

      notificationStore.setSuccessMessage(
        `You completed the game in ${totalTime.toFixed(2)} seconds!`,
        'Congratulations!'
      )

      router.push('/singlePlayer')
    }
  }

  const elapsedTime = computed(() => {
    if (startTime.value && endTime.value) {
      return ((endTime.value - startTime.value) / 1000).toFixed(2) + 's'
    }
    return (timer.value / 1000).toFixed(2) + 's'
  })

  const setIsLeaving = (value) => {
    isLeaving.value = value
  }

  const resetIsLeaving = () => {
    isLeaving.value = false
  }

  return {
    games,
    game,
    getSinglePlayerGames,
    getMultiPlayerGames,
    getMultiPlayerGame,
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
    resetIsLeaving,
    createMultiPlayer,
    sendPostUpdateOwner,
    sendPostOnInPorgress,
    storePlayers,
    updatePlayers,
    sendPostOnGameEndMuiltiplayer,
    sendPostOnGameEndMuiltiplayerPlayers,
    sendPostOnForfeitMuiltiplayer
  }
})
