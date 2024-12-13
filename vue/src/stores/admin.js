import { ref, computed } from 'vue'
import { useErrorStore } from '@/stores/error'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAdminStore = defineStore('admin', () => {
  const storeError = useErrorStore()

  const games = ref([])
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  const transactions = ref([])
  const filterType = ref('')
  const typeFilter = ref('All')
  const paymentMethodFilter = ref('All')
  const dateRange = ref([null, null])
  const searchTerm = ref('')
  const selectedType = ref('All')
  const selectedStatus = ref('All')

  //Dados tabelas e filtros
  const last_page = ref(0)
  const gameStatusFilter = ref('All')
  const gameTypeFilter = ref('All')
  const boardSizeFilter = ref('All')

  const totalPages = computed(() => last_page.value)

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

  const filterByPaymentMethod = (method) => {
    paymentMethodFilter.value = method
  }

  const filteredUsers = computed(() => {
    const term = searchTerm.value.toLowerCase().trim()
    const type = selectedType.value
    const status = selectedStatus.value

    return users.value.filter((user) => {
      const matchesSearch =
        !term ||
        user.NickName?.toLowerCase().includes(term) ||
        user.Email?.toLowerCase().includes(term)
      const matchesType = type === 'All' || user.Type === type
      const matchesStatus = status === 'All' || user.Blocked === status

      return matchesSearch && matchesType && matchesStatus
    })
  })

  const setSearchTerm = (term) => {
    searchTerm.value = term
  }
  const setSelectedType = (type) => {
    selectedType.value = type
  }

  const setSelectedStatus = (status) => {
    if (status === 'Blocked') {
      selectedStatus.value = 1
    } else if (status === 'Unblocked') {
      selectedStatus.value = 0
    } else {
      selectedStatus.value = 'All'
    }
  }
  const filteredTransactions = computed(() => {
    const filteredByDate =
      !dateRange.value[0] && !dateRange.value[1]
        ? transactions.value
        : transactions.value.filter((transaction) => {
            const transactionDate = new Date(transaction.date).setHours(0, 0, 0, 0)
            const [start, end] = dateRange.value
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

  /*
  const filteredGames = computed(() => {
    let filtered = games.value

    // Filter by Date Range
    if (dateRange.value[0] || dateRange.value[1]) {
      const [start, end] = dateRange.value
      filtered = filtered.filter((game) => {
        const gameDate = new Date(game.began_at).setHours(0, 0, 0, 0)
        return (!start || gameDate >= start) && (!end || gameDate <= end)
      })
    }

    // Filter by Game Status
    if (gameStatusFilter.value !== 'All') {
      filtered = filtered.filter((game) => game.status === gameStatusFilter.value)
    }

    // Filter by Game Type
    if (gameTypeFilter.value !== 'All') {
      filtered = filtered.filter((game) => game.Type === gameTypeFilter.value)
    }

    // Filter by Board Size
    if (boardSizeFilter.value !== 'All') {
      filtered = filtered.filter((game) => game.board_id === boardSizeFilter.value)
    }

    return filtered
  })*/

  const filterByBoardSize = (size) => {
    boardSizeFilter.value = size
  }
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
    typeFilter.value = 'All'
    paymentMethodFilter.value = 'All'
    gameStatusFilter.value = 'All'
    gameTypeFilter.value = 'All'
    searchTerm.value = ''
    selectedType.value = 'All'
    selectedStatus.value = 'All'
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

  const getAllGames = async (currentPage = 1, filters = {}) => {
    storeError.resetMessages()

    try {
      last_page.value = 0

      const boardSizeMapping = {
        '3x4': 1,
        '4x4': 2,
        '6x6': 3
      }

      const gameTypeMapping = {
        'Single-Player': 'S',
        'Multi-Player': 'M'
      }

      const gameStatusMapping = {
        Pending: 'PE',
        'In Progress': 'PL',
        Ended: 'E',
        Interrupted: 'I'
      }

      const requestData = {
        page: currentPage,
        board_size: boardSizeMapping[filters.boardSize] || 'All',
        game_type: gameTypeMapping[filters.gameType] || 'All',
        game_status: gameStatusMapping[filters.gameStatus] || 'All',
        date_range: filters.dateRange
      }

      const response = await axios.post('games/all', requestData)

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
      last_page.value = response.data.meta.last_page
      console.log(last_page.value)
    } catch (err) {
      storeError.setErrorMessages(
        err.response?.data?.message,
        err.response?.data?.errors,
        err.response?.data?.status,
        'Error Getting Games'
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

  const getTransactions = async (currentPage = 1) => {
    loading.value = true
    error.value = null

    try {
      last_page.value

      const requestData = {
        page: currentPage
      }

      const response = await axios.post(`admin/transactions`, requestData)

      transactions.value = response.data.data.map((transaction) => ({
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
      last_page.value = response.data.meta.last_page
      console.log(last_page.value)
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
    users,
    games,
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
    totalPages,
    gameStatusFilter,
    filterByGameStatus,
    filterByGameType,
    gameTypeFilter,
    filteredUsers,
    searchTerm,
    setSearchTerm,
    setSelectedType,
    selectedType,
    setSelectedStatus,
    selectedStatus,
    boardSizeFilter,
    filterByBoardSize
  }
})
