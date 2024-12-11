import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useErrorStore } from '@/stores/error'
import axios from 'axios'

export const useStatisticsStore = defineStore('statistics', () => {
  const storeError = useErrorStore()
  const games = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedYear = ref(new Date().getFullYear()) // Default to current year
  const transactions = ref([])

  const getAllGames = async () => {
    loading.value = true
    storeError.resetMessages()
    try {
      const response = await axios.get('games')

      const updatedGames = response.data.data.map((game) => ({
        id: game.id,
        board_id:
          game.board_id === 1
            ? '3x4'
            : game.board_id === 2
              ? '4x4'
              : game.board_id === 3
                ? '6x6'
                : '-',
        created_user: game.created_user.nickname || '-',

        winner_user:
          game.status === 'E' && game.type === 'S'
            ? game.created_user.nickname
            : game.winner_user.nickname,
        Type: game.type === 'S' ? 'Single-Player' : 'Multi-Player',
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
        total_time: game.total_time ? game.total_time + 's' : '-'
      }))

      games.value = updatedGames
    } catch (err) {
      storeError.setErrorMessages(
        err.response?.data?.message,
        err.response?.data?.errors,
        err.response?.data?.status,
        'Error Getting Games'
      )
    } finally {
      loading.value = false
    }
  }

  const filteredGames = computed(() => {
    let filtered = games.value
    return filtered
  })

  const totalGames = computed(() => games.value.length)

  const monthlyGameCounts = computed(() => {
    const gameCounts = {}

    games.value.forEach((game) => {
      const beganAt = new Date(game.began_at)
      const year = beganAt.getFullYear()

      if (year === selectedYear.value) {
        const month = beganAt.getMonth()
        const monthName = beganAt.toLocaleString('default', { month: 'short' })

        if (!gameCounts[monthName]) {
          gameCounts[monthName] = 0
        }
        gameCounts[monthName]++
      }
    })

    const allMonths = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]
    allMonths.forEach((month) => {
      if (!gameCounts[month]) {
        gameCounts[month] = 0
      }
    })

    return gameCounts
  })

  const getTransactions = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`admin/transactions`)
      transactions.value = response.data.map((transaction) => {
        const transactionValue = transaction.euros || 0
        const pack = Math.min(Math.floor(transactionValue), 6)

        return {
          id: transaction.id,
          Name: transaction.user?.name,
          date: transaction.transaction_datetime,
          type: transaction.type === 'P' ? 'Purchase' : 'Unknown',
          value: transactionValue,
          paymentMethod: transaction.payment_type || '-',
          reference: transaction.payment_reference || '-',
          coins: transaction.brain_coins,
          pack // Mapping the value to the pack (1-6)
        }
      })
    } catch (err) {
      storeError.setErrorMessages(
        err.response?.data?.message,
        err.response?.data?.errors,
        err.response?.data?.status,
        'Error Get Transactions'
      )
    } finally {
      loading.value = false
    }
  }

  return {
    getAllGames,
    loading,
    error,
    filteredGames,
    totalGames,
    monthlyGameCounts,
    selectedYear,
    getTransactions,
    transactions,
    games
  }
})
