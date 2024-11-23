import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import { useAuthStore } from '@/stores/auth'

export const useGameStore = defineStore('game', () => {
  const storeError = useErrorStore()

  const games = ref([])

  const totalGames = computed(() => {
    return games.value ? games.value.length : 0
  })

  const getSingleGames = async () => {
    storeError.resetMessages()
    try {
      useAuthStore.token
      const response = await axios.get('games/single')
      games.value = response.data.data
      console.log(response)
    } catch (e) {
      storeError.setErrorMessages(
        e.response.data.message,
        e.response.data.errors,
        e.response.status,
        "Error fetching user's single games!"
      )
    }
  }

  return {
    games,
    totalGames,
    getSingleGames
  }
})
