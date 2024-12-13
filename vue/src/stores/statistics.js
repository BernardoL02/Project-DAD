import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useErrorStore } from '@/stores/error'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

export const useStatisticsStore = defineStore('statistics', () => {
  const storeError = useErrorStore()
  const authStore = useAuthStore()

  const games = ref([])
  const gamesUser = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedYear = ref(new Date().getFullYear()) // Default to current year
  const transactions = ref([])
  const users = ref([])
  const user = ref(null)
  const gamesMulty = ref([])

  const getMultiPlayerGames = async () => {
    storeError.resetMessages()
    try {
      const response = await axios.get('games/multi')

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
        created_user:
          game.created_user.nickname === authStore.nickname ? 'You' : game.created_user.nickname,
        winner_user:
          game.winner_user.nickname === authStore.nickname ? 'You' : game.winner_user.nickname,
        participants_count: game.participants_count,
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
        total_time: game.total_time + 's' || '-',
        pairs_discovered: game.pairs_discovered || '-'
      }))
      gamesMulty.value = updatedGames
    } catch (e) {
      storeError.setErrorMessages(
        e.response?.data?.message || 'An error occurred',
        e.response?.data?.errors || [],
        e.response?.status || 500,
        "Error fetching user's single games!"
      )
    }
  }

  const getSinglePlayerGames = async () => {
    storeError.resetMessages()
    try {
      const response = await axios.get('games/single')

      const updatedGames = response.data.data.map((game) => {
        let replay = null
        let difficulty = 'Normal'
        if (game.custom) {
          try {
            const customData = JSON.parse(game.custom)
            if (customData.replay) {
              replay = customData.replay // Extrai os dados do replay
            }
            difficulty = customData.difficulty === 'hard' ? 'Hard' : 'Normal'
          } catch (error) {
            console.error(`Erro ao processar o campo custom do jogo ID ${game.id}:`, error)
          }
        }

        return {
          id: game.id,
          difficulty,
          board_id:
            game.board_id === 1
              ? '3x4'
              : game.board_id === 2
                ? '4x4'
                : game.board_id === 3
                  ? '6x6'
                  : '-',
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
          total_time: game.total_time ? game.total_time + 's' : '-',
          total_turns_winner: game.total_turns_winner || '-',
          replay
        }
      })

      gamesUser.value = updatedGames
    } catch (e) {
      storeError.setErrorMessages(
        e.response?.data?.message || 'An error occurred',
        e.response?.data?.errors || [],
        e.response?.status || 500,
        "Error fetching user's single games!"
      )
    }
  }

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

  const getUsers = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get('admin/users')
      users.value = response.data.map((user) => ({
        Id: user.id,
        Name: user.name,
        Email: user.email,
        NickName: user.nickname,
        Type: user.type === 'A' ? 'Administrator' : 'Player',
        Blocked: user.blocked,
        RegisteredAt: user.created_at
      }))
    } catch (err) {
      error.value = 'Failed to load users. Please try again.'
      storeError.setErrorMessages(
        err.response?.data?.message,
        err.response?.data?.errors,
        err.response?.data?.status,
        'Error Get Users'
      )
    } finally {
      loading.value = false
    }
  }

  const monthlyUserCounts = computed(() => {
    const userCounts = {}

    if (!users.value || users.value.length === 0) {
      return userCounts
    }

    const currentYear = new Date().getFullYear()

    users.value.forEach((user) => {
      if (!user.RegisteredAt) return

      const registeredAt = new Date(user.RegisteredAt)

      if (registeredAt.getFullYear() !== currentYear) return

      const monthName = registeredAt.toLocaleString('default', { month: 'short' })

      if (!userCounts[monthName]) {
        userCounts[monthName] = 0
      }
      userCounts[monthName]++
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
      if (!userCounts[month]) {
        userCounts[month] = 0
      }
    })

    return userCounts
  })

  const monthlyPurchaseCounts = computed(() => {
    const purchaseCounts = {}

    transactions.value.forEach((transaction) => {
      if (transaction.type === 'Purchase') {
        const transactionDate = new Date(transaction.date)
        const year = transactionDate.getFullYear()

        if (year === selectedYear.value) {
          const monthName = transactionDate.toLocaleString('default', { month: 'short' })
          if (!purchaseCounts[monthName]) {
            purchaseCounts[monthName] = 0
          }
          purchaseCounts[monthName]++
        }
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
      if (!purchaseCounts[month]) {
        purchaseCounts[month] = 0
      }
    })

    return purchaseCounts
  })

  const filteredGamesUser = computed(() => {
    let filtered = [...(gamesUser.value || []), ...(gamesMulty.value || [])]
    return filtered
  })
  const filteredGames = computed(() => {
    let filtered = games.value
    return filtered
  })

  const totalGames = computed(() => games.value.length)
  const totalGamesUser = computed(() => gamesUser.value.length + gamesMulty.value.length)

  const monthlyGameCounts = computed(() => {
    const gameCounts = {}

    games.value.forEach((game) => {
      const beganAt = new Date(game.began_at)
      const year = beganAt.getFullYear()

      if (year === selectedYear.value) {
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

  const monthlyGameCountsUser = computed(() => {
    const gameCounts = {}
    const filtered = [...(gamesUser.value || []), ...(gamesMulty.value || [])]

    filtered.forEach((game) => {
      const beganAt = new Date(game.began_at)
      const year = beganAt.getFullYear()

      if (year === selectedYear.value) {
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
          pack
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

  const fetchProfile = async () => {
    loading.value = true
    error.value = null

    try {
      const responseUser = await axios.get('users/me')
      user.value = responseUser.data.data
    } catch (err) {
      error.value = 'Failed to load user profile. Please try again.'
      console.error('Error fetching profile:', err)
    } finally {
      loading.value = false
    }
  }

  const totalMultiPlayerGames = computed(() => {
    return gamesMulty.value.filter((game) => game.participants_count > 1).length
  })

  const totalSinglePlayerGames = computed(() => {
    if (!gamesUser.value || gamesUser.value.length === 0) {
      return 0
    }
    return gamesUser.value.filter((game) => game.Type === 'Single-Player').length
  })

  return {
    getAllGames,
    totalSinglePlayerGames,
    loading,
    error,
    filteredGames,
    totalGames,
    monthlyGameCounts,
    totalMultiPlayerGames,
    selectedYear,
    getTransactions,
    transactions,
    games,
    monthlyPurchaseCounts,
    monthlyUserCounts,
    users,
    getUsers,
    monthlyGameCountsUser,
    fetchProfile,
    user,
    getMultiPlayerGames,
    getSinglePlayerGames,
    totalGamesUser,
    filteredGamesUser
  }
})
