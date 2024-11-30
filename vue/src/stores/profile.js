import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import avatarNoneAssetURL from '@/assets/avatar-none.png'

const apiDomain = import.meta.env.VITE_API_DOMAIN

export const useProfileStore = defineStore('profile', () => {
  const storeError = useErrorStore()

  const userProfile = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const responseMessage = ref('')

  const name = computed(() => {
    return userProfile.value ? userProfile.value.name : ''
  })

  const email = computed(() => {
    return userProfile.value ? userProfile.value.email : ''
  })

  const nickname = computed(() => {
    return userProfile.value ? userProfile.value.nickname : ''
  })

  const type = computed(() => {
    return userProfile.value ? userProfile.value.type : ''
  })

  const coins = computed(() => {
    return userProfile.value ? userProfile.value.brain_coins_balance : ''
  })

  const photoUrl = computed(() => {
    const photoFile = userProfile.value ? userProfile.value.photo_filename : ''
    if (photoFile) {
      return `http://${apiDomain}/storage/photos/${photoFile}`
    }
    return avatarNoneAssetURL
  })

  const fetchProfile = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get('/users/me')
      userProfile.value = response.data.data
    } catch (err) {
      error.value = 'Failed to load user profile. Please try again.'

      storeError.setErrorMessages(
        err.response?.data?.message,
        err.response?.data?.errors,
        err.response?.data?.status,
        'Profile Fetch Error'
      )
      console.error('Error fetching profile:', err)
    } finally {
      loading.value = false
    }
  }

  const updateUserInfo = async (user) => {
    loading.value = true
    responseMessage.value = ''
    error.value = null

    try {
      const response = await axios.put('/users/me', user)

      userProfile.value = response.data.data

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

      console.log(response.data)

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

  return {
    userProfile,
    loading,
    error,
    updateUserInfo,
    updatePassword,
    fetchProfile,
    name,
    email,
    nickname,
    type,
    photoUrl,
    coins
  }
})
