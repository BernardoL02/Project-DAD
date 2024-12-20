import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useErrorStore } from '@/stores/error'
import axios from 'axios'

export const useStatisticsStore = defineStore('statistics', () => {
  const storeError = useErrorStore()

  const games = ref([])
  const gamesUser = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedYear = ref(new Date().getFullYear())
  const transactionsUser = ref([])
  const users = ref([])
  const user = ref(null)
  const gamesMulty = ref([])

  //-----------------------------------------------------
  //---------------ESTATISTICA DO USER-------------------
  //-----------------------------------------------------

  const gameStatisticsUser = ref({
    totalMulty: 0,
    totalSingle: 0,
    totalGamesByYearMonth: []
  })

  const fetchPlayerGames = async () => {
    loading.value = true
    storeError.resetMessages()

    try {
      const response = await axios.get('users/me/statistics')
      gameStatisticsUser.value = response.data
    } catch (err) {
      storeError.setErrorMessages(
        err.response?.data?.message,
        err.response?.data?.errors,
        err.response?.data?.status,
        'Error Getting Game Statistics'
      )
    } finally {
      loading.value = false
    }
  }

  const filteredGamesUser = computed(() => {
    let filtered = [
      ...(gameStatisticsUser.value.totalMulty || []),
      ...(gameStatisticsUser.value.totalSingle || [])
    ]
    return filtered
  })

  const totalGamesUser = computed(() => gamesUser.value.length + gamesMulty.value.length)

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

  const getTransactionsUser = async () => {
    storeError.resetMessages()
    try {
      const response = await axios.get('/transactions', {})
      transactionsUser.value = response.data.data.map((transaction) => {
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
    } catch (error) {
      storeError.setErrorMessages(
        error.response?.data?.message || 'An error occurred while fetching transactions.',
        'Transaction Fetch Error'
      )
    }
  }
  const getTransactionsGroupedByMonth = () => {
    return transactionsUser.value.reduce((grouped, transaction) => {
      const monthYear = transaction.date.toLocaleString('default', {
        month: 'long',
        year: 'numeric'
      })

      if (!grouped[monthYear]) {
        grouped[monthYear] = []
      }
      grouped[monthYear].push(transaction)
      return grouped
    }, {})
  }

  const monthlyPurchaseCountsUser = computed(() => {
    const purchaseCounts = {}

    transactionsUser.value.forEach((transaction) => {
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

  //-----------------------------------------------------
  //---------------ESTATISTICA DO ADMIN------------------
  //-----------------------------------------------------

  const getUsers = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get('admin/users')
      users.value = response.data.map((user) => ({
        id: user.id,
        name: user.name,
        Email: user.email,
        nickname: user.nickname,
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

    const monthMapping = {
      'JAN.': 'Jan',
      'FEV.': 'Feb',
      'MAR.': 'Mar',
      'ABR.': 'Apr',
      'MAI.': 'May',
      'JUN.': 'Jun',
      'JUL.': 'Jul',
      'AGO.': 'Aug',
      'SET.': 'Sep',
      'OUT.': 'Oct',
      'NOV.': 'Nov',
      'DEZ.': 'Dec'
    }

    users.value.forEach((user) => {
      if (!user.RegisteredAt) return

      const registeredAt = new Date(user.RegisteredAt)

      if (registeredAt.getFullYear() !== currentYear) return
      let monthName = registeredAt.toLocaleString('default', { month: 'short' }).toUpperCase()
      monthName = monthMapping[monthName] || monthName

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

  const filteredGames = computed(() => {
    let filtered = games.value
    return filtered
  })

  const totalGames = computed(() => gameStatistics.value.total)

  const gameStatisticsAnonymous = ref({
    total: 0,
    totalGamesCurrentMonth: 0,
    totalPlayers: 0
  })

  const fetchGameAnonymous = async () => {
    loading.value = true
    storeError.resetMessages()

    try {
      const response = await axios.get('anonymous/games')
      gameStatisticsAnonymous.value = response.data
    } catch (err) {
      storeError.setErrorMessages(
        err.response?.data?.message,
        err.response?.data?.errors,
        err.response?.data?.status,
        'Error Getting Game Statistics'
      )
    } finally {
      loading.value = false
    }
  }

  const gameStatistics = ref({
    totalGamesByYearMoth: [],
    gamesByBoardSize: [],
    gamesByType: [],
    total: []
  })

  const fetchGameStatistics = async () => {
    loading.value = true
    storeError.resetMessages()

    try {
      const response = await axios.get('/games')
      gameStatistics.value = response.data
    } catch (err) {
      storeError.setErrorMessages(
        err.response?.data?.message,
        err.response?.data?.errors,
        err.response?.data?.status,
        'Error Getting Game Statistics'
      )
    } finally {
      loading.value = false
    }
  }

  const transactionsStatistics = ref({
    totalPurchases: 0,
    totalPurchaseValue: '',
    numberOfPurchasesPerPack: [],
    numberOfPurchasesPerPaymentType: [],
    totalPurchasesByMonth: []
  })

  const fetchTransactionStatistics = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`admin/transactions`)
      transactionsStatistics.value = response.data
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

  const topPlayersByTimePlayed = computed(() => {
    const players = gameStatistics.value.topPlayersByTimePlayed || []

    // Map and filter out invalid players (empty names)
    const validPlayers = players
      .map((player) => {
        const user = users.value.find((user) => user.id === player.user_id)
        return user?.name
          ? {
              name: user.name,
              timePlayed: Math.round(player.total_time / 3600)
            }
          : null // Exclude invalid players
      })
      .filter((player) => player !== null) // Remove null entries (invalid players)

    // Return only the top 10 valid players
    return validPlayers.slice(0, 10)
  })

  return {
    loading,
    error,
    filteredGames,
    totalGames,
    selectedYear,
    fetchTransactionStatistics,
    transactionsStatistics,
    games,
    monthlyUserCounts,
    users,
    getUsers,
    monthlyGameCountsUser,
    fetchProfile,
    user,
    totalGamesUser,
    filteredGamesUser,
    getTransactionsGroupedByMonth,
    transactionsUser,
    getTransactionsUser,
    monthlyPurchaseCountsUser,
    topPlayersByTimePlayed,
    fetchGameStatistics,
    gameStatistics,
    gameStatisticsAnonymous,
    fetchGameAnonymous,
    gameStatisticsUser,
    fetchPlayerGames
  }
})
