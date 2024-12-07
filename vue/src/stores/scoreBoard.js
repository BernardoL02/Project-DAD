import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import avatarNoneAssetURL from '@/assets/avatar-none.png'

export const usescoreBoardStore = defineStore('scoreBoard', () => {
  const boardSize = ref('3x4')
  const scoreboards = ref([])
  const loading = ref(false)
  const allScoreboards = ref({})
  const topPlayer1 = ref(null)
  const topPlayer2 = ref(null)
  const topPlayer3 = ref(null)

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
  const fetchProfileTopPlayers = async (nickname) => {
    loading.value = true // Start loading
    try {
      const response = await axios.get(`/users/${nickname}`)
      const user = response.data?.data

      if (user && user.photo_filename) {
        // Check if user and photo_filename exist
        const baseUrl = axios.defaults.baseURL.replace('/api', '')
        user.photo_filename = `${baseUrl}/storage/photos/${user.photo_filename}`
      } else {
        user.photo_filename = avatarNoneAssetURL
      }

      return user
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
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
        Losses: player.losses,
        WinRatio:
          player.losses === 0
            ? player.victories + '.0'
            : (player.victories / player.losses).toFixed(2)
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
    fetchProfileTopPlayers,
    filteredScoreboards,
    allScoreboards,
    topPlayer1,
    topPlayer2,
    topPlayer3
  }
})
