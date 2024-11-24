import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'

export const useBoardStore = defineStore('board', () => {
  const storeError = useErrorStore()

  const boards = ref([])

  const getBoards = async () => {
    storeError.resetMessages()

    try {
      const response = await axios.get('/boards')

      boards.value = response.data.map((board) => {
        board.coinsRequired = board.board_cols === 3 && board.board_rows === 4 ? 0 : 1
        return board
      })
    } catch (error) {
      storeError.setError('Erro ao carregar os boards. Tente novamente.')
      console.error(error)
    }
  }

  return {
    boards,
    getBoards
  }
})
