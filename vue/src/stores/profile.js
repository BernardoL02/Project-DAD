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
      const response = await axios.put('/users/me', {
        name: user.name,
        email: user.email,
        nickname: user.nickname
      })

      userProfile.value = response.data.data
      responseMessage.value = 'Your information has been updated successfully!'
    } catch (err) {
      error.value = 'Failed to update information. Please try again.'

      storeError.setErrorMessages(
        err.response?.data?.message,
        err.response?.data?.errors,
        err.response?.data?.status,
        'Profile Update Error'
      )
      console.error('Error updating profile:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    userProfile,
    loading,
    error,
    updateUserInfo,
    fetchProfile,
    name,
    email,
    nickname,
    type,
    photoUrl,
    coins
  }
})
