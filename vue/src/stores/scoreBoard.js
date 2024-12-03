import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const usescoreBoardStore = defineStore('scoreBoard', () => {
  const boardSize = ref('3x4') // Default board size is '3x4'
  const scoreboards = ref([]) // Data for the scoreboard
  const loading = ref(false)
  const allScoreboards = ref({})

  const fetchAllScoreboards = async () => {
    loading.value = true
    try {
      const response = await axios.get('/scoreboard/single')

      const topPlayersByBoardSize = {}

      Object.keys(response.data.scoreboards).forEach((boardSize) => {
        const topPlayers = response.data.scoreboards[boardSize].map((player) => ({
          rank: player.rank,
          nickname: player.nickname,
          best_time: player.best_time,
          min_turns: player.min_turns,
          status: player.status === 'E' ? 'Ended' : player.status
        }))

        // Assign the top players for the specific board size
        topPlayersByBoardSize[boardSize] = topPlayers
      })

      // Store the grouped scoreboards by board size
      allScoreboards.value = topPlayersByBoardSize
    } catch (e) {
      console.error('Error fetching all scoreboards:', e)
    } finally {
      loading.value = false
    }
  }

  const fetchMultiPlayerScoreboard = async () => {
    loading.value = true
    try {
      const response = await axios.get('/scoreboard/multiplayer')
      scoreboards.value = response.data.player_stats.map((player, index) => ({
        Rank: index + 1,
        Player: player.nickname,
        Victories: player.victories,
        Losses: player.losses
      }))
    } catch (error) {
      console.error('Error fetching multiplayer scoreboard:', error)
      scoreboards.value = []
    } finally {
      loading.value = false
    }
  }

  const filteredScoreboards = computed(() => {
    return allScoreboards.value[boardSize.value] || []
  })

  return {
    boardSize,
    scoreboards,
    loading,
    fetchAllScoreboards,
    fetchMultiPlayerScoreboard,
    filteredScoreboards,
    allScoreboards
  }
})
