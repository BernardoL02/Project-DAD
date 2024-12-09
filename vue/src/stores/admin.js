import { ref, computed } from 'vue'
import { useErrorStore } from '@/stores/error'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAdminStore = defineStore('admin', () => {
  const storeError = useErrorStore()

  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  const transactions = ref([])
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

  const getUsers = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`admin/users`)
      users.value = response.data.map((user) => ({
        Id: user.id,
        Name: user.name,
        Email: user.email,
        NickName: user.nickname,
        Type: user.type == 'A' ? 'Administrator' : 'Player',
        Blocked: user.blocked
      }))
    } catch (err) {
      error.value = 'Failed to load usersPlease try again.'
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

  const blockUser = async (nickname) => {
    try {
      await axios.post(`admin/block/` + nickname)
      await getUsers()
    } catch (err) {
      console.log('entrou')
      error.value = 'Failed to block an user'
      storeError.setErrorMessages(
        err.response?.data?.message,
        err.response?.data?.errors,
        err.response?.data?.status,
        'Error Blocking User'
      )
    }
  }

  const unblockUser = async (nickname) => {
    try {
      await axios.post(`admin/unblock/` + nickname)
      await getUsers()
    } catch (err) {
      error.value = 'Failed to unblocking an user'
      storeError.setErrorMessages(
        err.response?.data?.message,
        err.response?.data?.errors,
        err.response?.data?.status,
        'Error Unblocking User'
      )
    }
  }

  const deleteUser = async (nickname) => {
    try {
      console.log(nickname)
      await axios.delete(`admin/delete/` + nickname)
      await getUsers()
    } catch (err) {
      if (err.response) {
        // Captura os detalhes do erro do servidor
        const message = err.response.data?.message || 'Erro desconhecido.'
        const status = err.response.status || 'Status não definido.'

        // Exibe a mensagem personalizada no console (ou em outro lugar no app)
        console.error(`Erro ${status}: ${message}`)

        // Configura o estado de erro no frontend
        error.value = `Falha ao excluir o usuário: ${message}`
        storeError.setErrorMessages(
          message,
          err.response?.data?.errors,
          status,
          'Erro ao deletar usuário'
        )
      }
    }
  }

  const register = async (userData) => {
    storeError.resetMessages()

    try {
      const response = await axios.post('admin/register', userData)

      if (response.data?.errors) {
        const errorMessages = response.data.errors

        const title = 'Register Error'
        const message = response.data.message || 'There were issues with your registration.'

        storeError.setErrorMessages(message, errorMessages, 422, title)
        return false
      }

      storeError.setSuccessMessages(
        'Your account has been created successfully!',
        {},
        201,
        'Registration Success'
      )

      return response.data
    } catch (error) {
      if (error.response?.status === 422) {
        const errorData = error.response?.data
        const errorMessages = errorData?.errors || {}

        const formattedMessages = Object.entries(errorMessages)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n')

        const detailedMessage =
          formattedMessages || errorData?.message || 'Validation errors occurred:'

        const title = 'Register Error'

        storeError.setErrorMessages(detailedMessage, errorMessages, error.response.status, title)
      } else {
        const status = error.response?.status || 500
        const message = error.response?.data?.message || 'An unexpected error occurred'
        const title = error.response?.data?.title || 'Error'
        storeError.setErrorMessages(message, error.response?.data?.errors || [], status, title)
      }

      return false
    }
  }

  const userFirstLastName = (fullName) => {
    if (!fullName) return 'Unknown'
    const names = fullName.trim().split(' ')
    const firstName = names[0] ?? ''
    const lastName = names.length > 1 ? names[names.length - 1] : ''
    return (firstName + ' ' + lastName).trim()
  }

  const getTransactions = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`admin/transactions`)
      transactions.value = response.data.map((transaction) => ({
        id: transaction.id,
        Name: userFirstLastName(transaction.user?.name),
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
    } catch (err) {
      error.value = 'Failed to load user profiles. Please try again.'
      storeError.setErrorMessages(
        err.response?.data?.message,
        err.response?.data?.errors,
        err.response?.data?.status,
        'Profile Fetch Error'
      )
      console.error('Error fetching profiles:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    register,
    getUsers,
    blockUser,
    unblockUser,
    deleteUser,
    getTransactions,
    transactions,
    handleDateChange,
    filteredTransactions,
    resetFilters,
    formattedDateRange
  }
})
