import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import { useProfileStore } from '@/stores/profile'

export const useGameStore = defineStore('game', () => {
  const storeError = useErrorStore()
  const profileStore = useProfileStore()

  const games = ref([])
  const statusFilter = ref('')
  const beginDateFilter = ref('')
  const boardFilter = ref('All')

  const handleBoardSizeChange = (boardSize) => {
    boardFilter.value = boardSize
  }

  const getSinglePlayerGames = async () => {
    storeError.resetMessages()
    try {
      const response = await axios.get('games/single')

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
        turns: game.turns || 'N/A'
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
          game.created_user.nickname === profileStore.nickname ? 'You' : game.created_user.nickname,
        winner_user:
          game.winner_user.nickname === profileStore.nickname ? 'You' : game.winner_user.nickname,
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
        turns: game.turns || 'N/A'
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

  // Computed property para filtrar os jogos
  const filteredGames = computed(() => {
    let filtered = games.value

    // Filtro por status
    if (statusFilter.value && statusFilter.value !== 'All') {
      filtered = filtered.filter((game) => game.status === statusFilter.value)
    }

    // Filtro por data de início
    if (beginDateFilter.value) {
      filtered = filtered.filter((game) => game.began_at.includes(beginDateFilter.value))
    }

    // Filtro por tabuleiro
    if (boardFilter.value && boardFilter.value !== 'All') {
      filtered = filtered.filter((game) => game.board_id === boardFilter.value)
    }

    return filtered
  })

  const bestResultsSinglePlayer = computed(() => {
    const endedGames = games.value.filter((game) => {
      const isBoardMatch =
        !boardFilter.value || boardFilter.value === 'All' || game.board_id === boardFilter.value
      return game.status === 'Ended' && isBoardMatch
    })

    const sorted = endedGames.sort((a, b) => {
      const timeA = parseFloat(a.total_time.replace('s', '')) || 0
      const timeB = parseFloat(b.total_time.replace('s', '')) || 0

      const turnsA = a.turns === 'N/A' ? Number.MAX_SAFE_INTEGER : parseInt(a.turns, 10) || 0
      const turnsB = b.turns === 'N/A' ? Number.MAX_SAFE_INTEGER : parseInt(b.turns, 10) || 0

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
        const turnsA = a.turns === 'N/A' ? Infinity : a.turns
        const turnsB = b.turns === 'N/A' ? Infinity : b.turns

        if (turnsA === turnsB) {
          const playersA = a.participants_count || 0
          const playersB = b.participants_count || 0

          return playersB - playersA
        }

        return turnsA - turnsB
      }

      return timeA - timeB
    })

    return sorted.slice(0, 10)
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

  const createSinglePlayer = async (board_id) => {
    try {
      const beganAt = new Date().toISOString().slice(0, 19).replace('T', ' ')

      const response = await axios.post('games', {
        type: 'S',
        status: 'PL',
        began_at: beganAt,
        board_id: board_id
      })
      const createdGame = response.data.data
      return createdGame.id // Retorna o ID do jogo criado
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
      console.log('Game status atualizado para "interrupted".')
    } catch (error) {
      console.error('Erro ao atualizar status do jogo:', error.response?.data || error.message)
    }
  }

  const sendPostOnGameEnd = async (totalTime, gameId) => {
    try {
      if (!gameId) {
        console.error('Game ID não está definido.')
        return
      }

      await axios.patch(`/games/${gameId}`, {
        status: 'E',
        total_time: totalTime
      })

      console.log(`Game atualizado com status "ended" e tempo total de ${totalTime} segundos.`)
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
    totalTimePlayedMultiPlayer
  }
})
