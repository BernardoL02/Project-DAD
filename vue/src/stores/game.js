import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import { useAuthStore } from '@/stores/auth'

export const useGameStore = defineStore('game', () => {
  const storeError = useErrorStore()
  const authStore = useAuthStore()

  const games = ref([])
  const statusFilter = ref('')
  const beginDateFilter = ref([null, null])
  const boardFilter = ref('All')

  const difficultyFilter = ref('Normal')
  const difficulty = ref('normal')

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

      const updatedGames = response.data.data.map((game) => ({
        id: game.id,
        difficulty: game.custom
          ? JSON.parse(game.custom).difficulty === 'hard'
            ? 'Hard'
            : 'Normal'
          : 'Normal',
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
        total_time: game.total_time + 's' || 'N/A',
        total_turns_winner: game.total_turns_winner ? game.total_turns_winner : 'N/A'
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

    return sorted.slice(0, 10)
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

      if (difficulty === 'hard') {
        payload.difficulty = 'hard'
      }

      const response = await axios.post('games', payload)

      const createdGame = response.data.data
      return createdGame.id
    } catch (e) {
      console.error('Error creating single-player game:', e)
      storeError.setErrorMessages(
        e.response?.data?.message || 'An error occurred while creating the game',
        e.response?.data?.errors || [],
        e.response?.status || 500
      )
      throw new Error('Failed to create single-player game')
    }
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
        console.error('Game ID não está definido.')
        return
      }

      const ended = new Date().toISOString().slice(0, 19).replace('T', ' ')

      await axios.patch(`/games/${gameId}`, {
        status: 'E',
        ended_at: ended,
        total_time: totalTime,
        total_turns_winner: totalTurns
      })

      console.log(
        `Game atualizado com status "ended", tempo total de ${totalTime} segundos, e ${totalTurns} jogadas.`
      )
    } catch (error) {
      console.error('Erro ao atualizar status do jogo:', error.response?.data || error.message)
    }
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
    difficulty
  }
})
