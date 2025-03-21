import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import axios from 'axios'
import avatarNoneAssetURL from '@/assets/avatar-none.png'

export const usescoreBoardStore = defineStore('scoreBoard', () => {
  const authStore = useAuthStore()
  const boardSize = ref('3x4')
  const scoreboards = ref([])
  const loading = ref(false)
  const allScoreboards = ref({})
  const boardSizeMap = ref({})
  const topPlayer1 = ref(null)
  const topPlayer2 = ref(null)
  const topPlayer3 = ref(null)
  const topPlayer4 = ref(null)
  const topPlayer5 = ref(null)

  const fetchAllScoreboards = async () => {
    loading.value = true
    try {
      const response = await axios.get('/scoreboard/single')

      const topPlayersByBoardSize = {}

      Object.keys(response.data.scoreboards).forEach((boardId) => {
        let i = 1
        const boardSize =
          boardSizeMap.value.value[boardId - 1].board_cols +
            'x' +
            boardSizeMap.value.value[boardId - 1].board_rows || 'Unknown'

        const topPlayers = response.data.scoreboards[boardId].map((player) => ({
          rank: i++,
          nickname: player.nickname,
          best_time: player.best_time,
          min_turns: player.min_turns,
          status: player.status === 'E' ? 'Ended' : player.status
        }))

        topPlayersByBoardSize[boardSize] = topPlayers
      })

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
        user.photo_filename = authStore.getPhotoUrl(user.photo_filename)
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
    boardSizeMap,
    loading,
    fetchAllScoreboards,
    fetchMultiPlayerScoreboard,
    fetchProfileTopPlayers,
    filteredScoreboards,
    allScoreboards,
    topPlayer1,
    topPlayer2,
    topPlayer3,
    topPlayer4,
    topPlayer5
  }
})
