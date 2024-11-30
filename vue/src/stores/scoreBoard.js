import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const usescoreBoardStore = defineStore('scoreBoard', () => {
  const boardSize = ref('3x4') // Default board size is '3x4'
  const scoreboards = ref([]) // Data for the scoreboard
  const loading = ref(false)

  const fetchSinglePlayerScoreboard  = async (size) => {
    loading.value = true 
    scoreboards.value = [];
    try {
      const response = await axios.get(`/scoreboard/single/${size}`)
      scoreboards.value = response.data.scoreboards.map((score, index) => ({
        Rank: index + 1,
        Player: score.nickname,
        'Best Time': `${score.best_time}s`,
        'Num Turns': score.min_turns || 'N/A',
        Status: score.status === 'E' ? 'Ended' : score.status
      }))
    } catch (error) {
      console.error('Error fetching scoreboard:', error)
      scoreboards.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchMultiPlayerScoreboard = async () => {
    loading.value = true;
    try {
      const response = await axios.get('/scoreboard/multiplayer');
      // Map API response to match the table structure
      scoreboards.value = response.data.player_stats.map((player, index) => ({
        Rank: index + 1,
        Player: player.nickname,
        Victories: player.victories,
        Losses: player.losses,
      }));
    } catch (error) {
      console.error('Error fetching multiplayer scoreboard:', error);
      scoreboards.value = [];
    } finally {
      loading.value = false;
    }
  };

  const handleBoardSizeChange = (size) => {
    boardSize.value = size
    fetchSinglePlayerScoreboard(size)
  }

  return {
    boardSize,
    scoreboards,
    loading,
    fetchSinglePlayerScoreboard,
    fetchMultiPlayerScoreboard,
    handleBoardSizeChange,
  };
})
