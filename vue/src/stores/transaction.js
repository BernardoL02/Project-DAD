import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'

export const useTransactionStore = defineStore('transaction', () => {
  const storeError = useErrorStore()

  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)
  const dateRange = ref([null, null])

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

  const createTransactionsGames = async (gameId, cost) => {
    try {
      const datetime = new Date().toISOString().slice(0, 19).replace('T', ' ')

      const response = await axios.post('/transactions', {
        type: 'I',
        game_id: gameId,
        brain_coins: -cost,
        transaction_datetime: datetime
      })

      console.log('Transaction created for game successfully:', response.data)
      return response.data
    } catch (error) {
      storeError.setErrorMessages(
        error.response?.data?.message,
        error.response?.data?.errors,
        error.response?.data?.status,
        'Game Transaction Error'
      )
      console.error('Error creating game transaction:', error.response?.data || error.message)
      throw error
    }
  }

  const createTransactionForBrainCoins = async (paymentDetails, coins) => {
    try {
      loading.value = true

      const datetime = new Date().toISOString().slice(0, 19).replace('T', ' ')

      const response = await axios.post('/transactions', {
        type: 'P',
        brain_coins: coins,
        payment_reference: paymentDetails.reference,
        payment_type: paymentDetails.type,
        euros: paymentDetails.value,
        transaction_datetime: datetime
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
        id: transaction.id,
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

      // Não definir o `dateRange` automaticamente
      // Se quiser apenas manter vazio:
      dateRange.value = [null, null]
    } catch (error) {
      storeError.setErrorMessages(
        error.response?.data?.message || 'An error occurred while fetching transactions.',
        'Transaction Fetch Error'
      )
      throw error
    }
  }

  const handleDateChange = (newRange) => {
    dateRange.value = newRange.map((date) =>
      date ? new Date(date).toISOString().split('T')[0] : null
    )
  }

  const filteredTransactions = computed(() => {
    if (!dateRange.value[0] && !dateRange.value[1]) {
      return transactions.value
    }

    const [start, end] = dateRange.value.map((date) =>
      date ? new Date(date).setHours(0, 0, 0, 0) : null
    )

    return transactions.value.filter((transaction) => {
      const transactionDate = new Date(transaction.date).setHours(0, 0, 0, 0)
      return (!start || transactionDate >= start) && (!end || transactionDate <= end)
    })
  })

  const resetFilters = () => {
    dateRange.value = [null, null]
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
    resetFilters
  }
})
