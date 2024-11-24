import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'

export const useGameStore = defineStore('game', () => {
  const storeError = useErrorStore()

  const games = ref([])
  const statusFilter = ref('')
  const beginDateFilter = ref('')
  const boardFilter = ref('All')

  // Função para atualizar o filtro de tabuleiro
  const handleBoardSizeChange = (boardSize) => {
    boardFilter.value = boardSize
  }

  const getSinglePlayerGames = async () => {
    storeError.resetMessages()
    try {
      const response = await axios.get('games/single')

      const updatedGames = response.data.data.map((game) => ({
        id: game.id,
        // Mapeamento do board_id
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
        ended_at: game.ended_at || 'N/A',
        total_time: game.total_time || 'N/A'
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

  const bestResults = computed(() => {
    const filtered = games.value.filter(
      (game) =>
        game.status === 'Ended' &&
        (game.board_id === boardFilter.value || boardFilter.value === 'All')
    )

    const sorted = filtered.sort((a, b) => {
      const timeA = parseInt(a.total_time) || 0
      const timeB = parseInt(b.total_time) || 0
      return timeA - timeB
    })

    return sorted.slice(0, 10)
  })

  return {
    games,
    getSinglePlayerGames,
    statusFilter,
    beginDateFilter,
    boardFilter,
    filteredGames,
    bestResults,
    handleBoardSizeChange
  }
})
