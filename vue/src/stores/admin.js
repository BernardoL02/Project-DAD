import { ref, computed } from 'vue'
import { useErrorStore } from '@/stores/error'
import { useAuthStore } from '@/stores/auth'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAdminStore = defineStore('admin', () => {
  const storeError = useErrorStore()
  const authStore = useAuthStore()

  const games = ref([])
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  const transactions = ref([])
  const dateRange = ref([null, null])
  const filterType = ref('')
  const typeFilter = ref('All')
  const paymentMethodFilter = ref('All')
  const gameStatusFilter = ref('All')
  const gameTypeFilter = ref('All')

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
    dateRange.value = newRange.map((date) => (date ? new Date(date).setHours(0, 0, 0, 0) : null))
  }
  const filterByPaymentMethod = (method) => {
    paymentMethodFilter.value = method
  }

  const filteredTransactions = computed(() => {
    // Filter by date range
    const filteredByDate =
      !dateRange.value[0] && !dateRange.value[1]
        ? transactions.value
        : transactions.value.filter((transaction) => {
            const transactionDate = new Date(transaction.date).setHours(0, 0, 0, 0) // Normalize transaction date
            const [start, end] = dateRange.value
            return (!start || transactionDate >= start) && (!end || transactionDate <= end)
          })

    // Filter by type
    const filteredByType =
      typeFilter.value === 'All'
        ? filteredByDate
        : filteredByDate.filter((transaction) => transaction.type === typeFilter.value)

    // Filter by payment method
    if (paymentMethodFilter.value === 'All') {
      return filteredByType
    }

    return filteredByType.filter(
      (transaction) => transaction.paymentMethod === paymentMethodFilter.value
    )
  })

  const filteredGames = computed(() => {
    let filtered = games.value

    if (dateRange.value[0] || dateRange.value[1]) {
      const [start, end] = dateRange.value
      filtered = filtered.filter((game) => {
        const gameDate = new Date(game.began_at).setHours(0, 0, 0, 0)
        return (!start || gameDate >= start) && (!end || gameDate <= end)
      })
    }

    if (gameStatusFilter.value !== 'All') {
      filtered = filtered.filter((game) => game.status === gameStatusFilter.value)
    }

    if (gameTypeFilter.value !== 'All') {
      filtered = filtered.filter((game) => game.Type === gameTypeFilter.value)
    }

    return filtered
  })
  const filterByGameType = (type) => {
    gameTypeFilter.value = type
  }

  const filterByGameStatus = (status) => {
    gameStatusFilter.value = status
  }

  const filterByType = (type) => {
    typeFilter.value = type
  }

  const resetFilters = () => {
    dateRange.value = [null, null]
    filterType.value = ''
    getTransactions()
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
      filterType.value = ''
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

  const blockUser = async (id) => {
    try {
      await axios.patch('admin/block/' + parseInt(id))
      await getUsers()
      storeError.setSuccessMessages('User blocked successfully!', {}, 200, 'Blocked Success')
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

  const unblockUser = async (id) => {
    try {
      await axios.patch('admin/unblock/' + parseInt(id))
      await getUsers()
      storeError.setSuccessMessages('User unblocked successfully!', {}, 200, 'Unblocked Success')
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

  const deleteUser = async (id) => {
    try {
      await axios.delete('admin/delete/' + id)
      await getUsers()

      storeError.setSuccessMessages(
        'Your have deleted the user successfully!',
        {},
        200,
        'Deleted Success'
      )
    } catch (err) {
      error.value = 'Failed to unblocking an user'
      storeError.setErrorMessages(
        err.response?.data?.message,
        err.response?.data?.errors,
        err.response?.data?.status,
        'Error deleting User'
      )
    }
  }
  const getAllGames = async () => {
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
                : 'N/A',
        created_user:
          game.created_user_id === authStore.user_id
            ? 'You'
            : game.created_user_id
              ? game.created_user_id
              : '',

        winner_user:
          game.winner_user_id === authStore.user_id
            ? 'You'
            : game.winner_user_id
              ? game.winner_user_id
              : game.created_user_id === authStore.user_id
                ? 'You'
                : game.created_user_id || '',
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
                  : 'N/A',
        began_at: game.began_at || 'N/A',
        total_time: game.total_time ? game.total_time + 's' : 'N/A'
      }))
      games.value = updatedGames
    } catch (e) {
      storeError.setErrorMessages(
        e.response?.data?.message || 'An error occurred',
        e.response?.data?.errors || [],
        e.response?.status || 500,
        "Error fetching user's single games!"
      )
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

      dateRange.value = [null, null]
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
    formattedDateRange,
    filterByType,
    filterByPaymentMethod,
    getAllGames,
    filteredGames,
    gameStatusFilter,
    filterByGameStatus,
    filterByGameType,
    gameTypeFilter
  }
})
