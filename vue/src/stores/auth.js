import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'

import avatarNoneAssetURL from '@/assets/avatar-none.png'

export const useAuthStore = defineStore('auth', () => {
  const storeError = useErrorStore()

  const loading = ref(false)
  const error = ref(null)
  const responseMessage = ref('')

  const user = ref(null)
  const token = ref(sessionStorage.getItem('token') || '')
  const socket = inject('socket')

  const notifications = ref([])

  const isAdmin = computed(() => {
    return user.value ? user.value.type === 'A' : false
  })

  const isPlayer = computed(() => {
    return user.value ? user.value.type === 'P' : false
  })

  const name = computed(() => {
    return user.value ? user.value.name : ''
  })

  const email = computed(() => {
    return user.value ? user.value.email : ''
  })

  const nickname = computed(() => {
    return user.value ? user.value.nickname : ''
  })

  const type = computed(() => {
    return user.value ? user.value.type : ''
  })

  const coins = computed(() => {
    return user.value ? user.value.brain_coins_balance : ''
  })

  const photo_filename = computed(() => {
    return user.value ? user.value.photo_filename : ''
  })

  const userFirstLastName = computed(() => {
    const names = name.value.trim().split(' ')
    const firstName = names[0] ?? ''
    const lastName = names.length > 1 ? names[names.length - 1] : ''
    return (firstName + ' ' + lastName).trim()
  })

  const userPhotoUrl = computed(() => {
    const photoFile = user.value ? (user.value.photo_filename ?? '') : ''
    if (photoFile) {
      const baseUrl = axios.defaults.baseURL.replace('/api', '')
      return `${baseUrl}/storage/photos/${photoFile}`
    }
    return avatarNoneAssetURL
  })

  const getPhotoUrl = (photoFilename) => {
    if (photoFilename) {
      const baseUrl = axios.defaults.baseURL.replace('/api', '')
      return `${baseUrl}/storage/photos/${photoFilename}`
    }
    return avatarNoneAssetURL
  }

  // -------------- Profile --------------

  const fetchProfile = async () => {
    loading.value = true
    error.value = null

    try {
      const responseUser = await axios.get('users/me')
      user.value = responseUser.data.data
    } catch (err) {
      error.value = 'Failed to load user profile. Please try again.'

      storeError.setErrorMessages(
        err.response?.data?.message,
        err.response?.data?.errors,
        err.response?.data?.status,
        'Profile Fetch Error'
      )
    } finally {
      loading.value = false
    }
  }

  const getNotifications = async () => {
    storeError.resetMessages()
    try {
      const response = await axios.get('/users/me/notifications')

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
        coins: transaction.brain_coins,
        msg: transaction.msg
      }))

      notifications.value = formattedTransactions
    } catch (error) {
      storeError.setErrorMessages(
        error.response?.data?.message || 'An error occurred while fetching transactions.',
        'Transaction Fetch Error'
      )
    }
  }

  const deleteNotification = async (notificationId, toastMessage = true) => {
    try {
      const response = await axios.patch('/transactions/' + notificationId, {
        notificationRead: '0'
      })

      if (response.data?.message === 'Notification deleted successfully.' && toastMessage == true) {
        storeError.setSuccessMessages(response.data.message, {}, 200, null)
        return true
      }

      return false
    } catch (error) {
      storeError.setErrorMessages(
        error.response?.data?.message,
        error.response?.data?.errors,
        error.response?.data?.status,
        'Notification Error'
      )
    }
  }

  const deleteAllNotifications = async () => {
    try {
      await axios.delete('/users/me/notifications')

      storeError.setSuccessMessages('All notifications deleted successfully.', {}, 200, null)

      notifications.value = []
    } catch (error) {
      storeError.setErrorMessages(
        error.response?.data?.message,
        error.response?.data?.errors,
        error.response?.data?.status,
        'Notification Error'
      )
    }
  }

  const updateUserInfo = async (user) => {
    loading.value = true
    responseMessage.value = ''
    error.value = null

    try {
      const response = await axios.post('/users/me', user, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      user.value = response.data.data

      storeError.setSuccessMessages(
        'Your information has been updated successfully!',
        {},
        200,
        'Profile Update Success'
      )
    } catch (err) {
      error.value = 'Failed to update information. Please try again.'
      storeError.setErrorMessages(
        err.response?.data?.message || 'Error occurred.',
        err.response?.data?.errors || {},
        err.response?.status || 500,
        'Profile Update Error'
      )
    } finally {
      loading.value = false
    }
  }

  const updatePassword = async (password, confirmPassword) => {
    loading.value = true

    try {
      const data = {
        password: password,
        confirm_password: confirmPassword
      }

      const response = await axios.patch('/users/me', data)

      storeError.setSuccessMessages(response.data.message, {}, 200, response.data.title)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error occurred.'
      const errorTitle = err.response?.data?.title || 'Password Update Error'
      const errorStatus = err.response?.status || 500

      storeError.setErrorMessages(errorMessage, {}, errorStatus, errorTitle)
    } finally {
      loading.value = false
    }
  }

  const deleteAccount = async (password) => {
    storeError.resetMessages()
    loading.value = true

    try {
      const data = {
        password: password
      }

      const response = await axios.delete('/users/me', { data })

      storeError.setSuccessMessages(response.data.message, {}, 200, response.data.title)

      clearUser()
      return true
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'An error occurred while deleting your account.'
      const errorTitle = err.response?.data?.title || 'Account Deletion Error'
      const errorStatus = err.response?.status || 500

      storeError.setErrorMessages(errorMessage, {}, errorStatus, errorTitle)

      return false
    } finally {
      loading.value = false
    }
  }

  // -------------- Auth --------------
  // This function is "private" - not exported by the store
  const clearUser = () => {
    resetIntervalToRefreshToken()
    user.value = null
    token.value = ''
    sessionStorage.removeItem('token')
    axios.defaults.headers.common.Authorization = ''
  }

  const login = async (credentials) => {
    storeError.resetMessages()
    try {
      const responseLogin = await axios.post('auth/login', credentials)
      token.value = responseLogin.data.token
      sessionStorage.setItem('token', token.value)
      axios.defaults.headers.common.Authorization = 'Bearer ' + token.value
      const responseUser = await axios.get('users/me')
      user.value = responseUser.data.data
      socket.emit('login', user.value)
      repeatRefreshToken()
      return user.value
    } catch (e) {
      clearUser()

      storeError.setErrorMessages(
        e.response.data.message,
        e.response.data.errors,
        e.response.status,
        'Authentication Error!'
      )
      return false
    }
  }

  const register = async (userData) => {
    storeError.resetMessages()

    try {
      const response = await axios.post('auth/register', userData)

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

  const restoreToken = async function () {
    let storedToken = sessionStorage.getItem('token')
    if (storedToken) {
      try {
        token.value = storedToken
        axios.defaults.headers.common.Authorization = 'Bearer ' + token.value
        const responseUser = await axios.get('users/me')
        user.value = responseUser.data.data
        socket.emit('login', user.value)
        socket.emit('updateSocketId', user.value.id)
        repeatRefreshToken()
        return true
      } catch {
        clearUser()
        return false
      }
    }
    return false
  }

  const logout = async () => {
    storeError.resetMessages()
    try {
      if (user.value) {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve()
          }, 1000)

          socket.emit('logout', user.value, () => {
            clearTimeout(timeout)
            resolve()
          })
        })
      }

      await axios.post('auth/logout')
      clearUser()
      return true
    } catch (e) {
      clearUser()
      storeError.setErrorMessages(
        e.response?.data?.message || 'Logout failed.',
        e.response?.data?.errors || [],
        e.response?.status || 500,
        'Authentication Error!'
      )
      return false
    }
  }

  let intervalToRefreshToken = null

  const resetIntervalToRefreshToken = () => {
    if (intervalToRefreshToken) {
      clearInterval(intervalToRefreshToken)
    }
    intervalToRefreshToken = null
  }

  const repeatRefreshToken = () => {
    if (intervalToRefreshToken) {
      clearInterval(intervalToRefreshToken)
    }
    intervalToRefreshToken = setInterval(
      async () => {
        try {
          const response = await axios.post('auth/refreshtoken')
          token.value = response.data.token
          axios.defaults.headers.common.Authorization = 'Bearer ' + token.value
          return true
        } catch (e) {
          clearUser()
          storeError.setErrorMessages(
            e.response.data.message,
            e.response.data.errors,
            e.response.status,
            'Authentication Error!'
          )
          return false
        }
      },
      1000 * 60 * 110
    )
    return intervalToRefreshToken
  }

  const getFirstLastName = (fullName) => {
    const names = fullName.trim().split(' ')
    const firstName = names[0] ?? ''
    const lastName = names.length > 1 ? names[names.length - 1] : ''
    return (firstName + ' ' + lastName).trim()
  }

  return {
    user,
    isAdmin,
    socket,
    isPlayer,
    name,
    nickname,
    userFirstLastName,
    email,
    type,
    coins,
    photo_filename,
    getFirstLastName,
    userPhotoUrl,
    login,
    logout,
    restoreToken,
    register,
    fetchProfile,
    getNotifications,
    deleteNotification,
    deleteAllNotifications,
    notifications,
    updateUserInfo,
    updatePassword,
    deleteAccount,
    getPhotoUrl
  }
})
