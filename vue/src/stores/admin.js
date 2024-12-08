import { ref } from 'vue'
import { useErrorStore } from '@/stores/error'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAdminStore = defineStore('admin', () => {
  const storeError = useErrorStore()

  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

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
        Type: user.type == 'A' ? 'Administrator' : 'Player'
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

  const blockUser = async (nickname) => {
    try {
      await axios.post(`/admin/users/block`, nickname)
      await getUsers()
    } catch (err) {
      console.error('Error blocking user:', err)
    }
  }

  const unblockUser = async (nickname) => {
    try {
      await axios.post(`/admin/users/unblock`, nickname)
      await getUsers()
    } catch (err) {
      console.error('Error unblocking user:', err)
    }
  }

  const deleteUser = async (nickname) => {
    try {
      await axios.delete(`admin/delete`, nickname)
      await getUsers()
    } catch (err) {
      console.error('Error deleting user:', err)
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

  return {
    users,
    loading,
    error,
    register,
    getUsers,
    blockUser,
    unblockUser,
    deleteUser
  }
})
