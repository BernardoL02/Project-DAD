import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'

export const useTransactionStore = defineStore('transaction', () => {
  const storeError = useErrorStore()

  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)

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
    } catch (error) {
      storeError.setErrorMessages(
        error.response?.data?.message || 'An error occurred while fetching transactions.',
        'Transaction Fetch Error'
      )
      throw error
    }
  }

  return {
    transactions,
    loading,
    error,
    createTransactionsGames,
    createTransactionForBrainCoins,
    getTransactions
  }
})
