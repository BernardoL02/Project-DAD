import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import { useBoardStore } from '@/stores/board'

export const useTransactionStore = defineStore('transaction', () => {
  const storeError = useErrorStore()
  const boardStore = useBoardStore()

  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)
  const dateRange = ref([null, null])
  const filterType = ref('')
  const typeFilter = ref('All')
  const paymentMethodFilter = ref('All')

  const filterByType = (type) => {
    typeFilter.value = type
  }

  const filterByPaymentMethod = (method) => {
    paymentMethodFilter.value = method
  }

  const formatDate = (date) => {
    if (!date) return ''
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(date).toLocaleDateString('en-US', options)
  }

  const formattedDateRange = computed(() => {
    const [start, end] = dateRange.value
    if (start && end) {
      return `${formatDate(start)} - ${formatDate(end)}`
    }
    return 'Select Date Range'
  })

  const createTransactionsGames = async (gameId, cost, board_id, gameType) => {
    try {
      const datetime = new Date().toISOString().slice(0, 19).replace('T', ' ')

      let msg = null
      if (gameType === 'Single-Player' || gameType === 'Multi-Player') {
        const board = boardStore.boards.find((b) => b.id === board_id)
        const boardName = `${board.board_cols}x${board.board_rows}`

        msg =
          gameType === 'Single-Player'
            ? `You spent ${cost} brain coin to play on ${boardName} in a single-player game.`
            : `You spent ${cost} brain coin to play on ${boardName} in a multi-player game.`
      }

      const response = await axios.post('/transactions', {
        type: 'I',
        game_id: gameId,
        brain_coins: -cost,
        transaction_datetime: datetime,
        msg: msg
      })

      return response.data
    } catch (error) {
      storeError.setErrorMessages(
        error.response?.data?.message,
        error.response?.data?.errors,
        error.response?.data?.status,
        'Game Transaction Error'
      )
      throw error
    }
  }

  const createTransactionForBrainCoins = async (paymentDetails, coins) => {
    try {
      loading.value = true

      const datetime = new Date().toISOString().slice(0, 19).replace('T', ' ')

      const msg = `You purchased ${coins} brain coins for €${paymentDetails.value} via ${paymentDetails.type}.`

      const response = await axios.post('/transactions', {
        type: 'P',
        brain_coins: coins,
        payment_reference: paymentDetails.reference,
        payment_type: paymentDetails.type,
        euros: paymentDetails.value,
        transaction_datetime: datetime,
        msg: msg
      })

      return response.data
    } catch (error) {
      storeError.setErrorMessages(
        error.response?.data?.message || 'An error occurred while creating the transaction.',
        error.response?.data?.errors || [],
        error.response?.status || 500,
        'Transaction Creation Error'
      )

      throw error
    } finally {
      loading.value = false
    }
  }

  const getTransactions = async () => {
    storeError.resetMessages()
    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.get('/transactions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const formattedTransactions = response.data.data.map((transaction) => ({
        date: transaction.transaction_datetime,
        type:
          transaction.type === 'P'
            ? 'Purchase'
            : transaction.type === 'I'
              ? 'Game'
              : transaction.type === 'B'
                ? 'Bonus'
                : 'Other',
        value: transaction.euros || '-',
        paymentMethod: transaction.payment_type || '-',
        reference: transaction.payment_reference || '-',
        coins: transaction.brain_coins
      }))

      transactions.value = formattedTransactions

      dateRange.value = [null, null]
    } catch (error) {
      storeError.setErrorMessages(
        error.response?.data?.message || 'An error occurred while fetching transactions.',
        'Transaction Fetch Error'
      )
    }
  }

  const handleDateChange = (newRange) => {
    dateRange.value = newRange.map((date) =>
      date ? new Date(date).toISOString().split('T')[0] : null
    )
  }

  const filteredTransactions = computed(() => {
    // Filter by Date Range
    const filteredByDate =
      !dateRange.value[0] && !dateRange.value[1]
        ? transactions.value
        : transactions.value.filter((transaction) => {
            const transactionDate = new Date(transaction.date).setHours(0, 0, 0, 0)
            const [start, end] = dateRange.value.map((date) =>
              date ? new Date(date).setHours(0, 0, 0, 0) : null
            )
            return (!start || transactionDate >= start) && (!end || transactionDate <= end)
          })

    const filteredByType =
      typeFilter.value === 'All'
        ? filteredByDate
        : filteredByDate.filter((transaction) => transaction.type === typeFilter.value)

    if (paymentMethodFilter.value === 'All') {
      return filteredByType
    }

    return filteredByType.filter(
      (transaction) => transaction.paymentMethod === paymentMethodFilter.value
    )
  })

  const resetFilters = () => {
    dateRange.value = [null, null]
    typeFilter.value = 'All'
    paymentMethodFilter.value = 'All'
  }

  return {
    transactions,
    loading,
    error,
    dateRange,
    formattedDateRange,
    createTransactionsGames,
    createTransactionForBrainCoins,
    getTransactions,
    handleDateChange,
    filteredTransactions,
    resetFilters,
    filterByPaymentMethod,
    filterType,
    filterByType
  }
})
