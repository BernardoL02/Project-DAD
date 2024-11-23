import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const usescoreBoardStore = defineStore('scoreBoard', () => {
  const boardSize = ref('3x4') // Default board size is '3x4'
  const scoreboards = ref([]) // Data for the scoreboard
  const loading = ref(false)

  const fetchScoreboard = async (size) => {
    loading.value = true // Set loading state to true
    try {
      const response = await axios.get(`/scoreboard/single/${size}`)
      scoreboards.value = response.data.scoreboards.map((score, index) => ({
        Rank: index + 1,
        Player: score.nickname,
        'Best Time': `${score.best_time}s`,
        'Min Turns': score.min_turns || 'N/A',
        Status: score.status === 'E' ? 'Ended' : score.status
      }))
    } catch (error) {
      console.error('Error fetching scoreboard:', error)
      scoreboards.value = []
    } finally {
      loading.value = false
    }
  }

  // Change the board size and fetch new scoreboard data
  const handleBoardSizeChange = (size) => {
    boardSize.value = size
    fetchScoreboard(size)
  }

  return { boardSize, scoreboards, loading, fetchScoreboard, handleBoardSizeChange }
})
