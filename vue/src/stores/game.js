import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'

export const useGameStore = defineStore('game', () => {
  const storeError = useErrorStore()

  const games = ref([]) // Todos os jogos
  const statusFilter = ref('') // Filtro de status
  const beginDateFilter = ref('') // Filtro de data de início (exemplo)

  const getSinglePlayerGames = async () => {
    storeError.resetMessages()
    try {
      const response = await axios.get('games/single')

      const updatedGames = response.data.data.map((game) => ({
        id: game.id,
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
        ended_at: game.ended_at || '-',
        total_time: game.total_time || '-'
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
    if (statusFilter.value) {
      filtered = filtered.filter((game) => game.status === statusFilter.value)
    }

    // Filtro por data de início (exemplo de filtro)
    if (beginDateFilter.value) {
      filtered = filtered.filter((game) => game.began_at.includes(beginDateFilter.value))
    }

    return filtered
  })

  return {
    games,
    getSinglePlayerGames,
    statusFilter,
    beginDateFilter,
    filteredGames // Aqui exportamos a lista filtrada
  }
})
