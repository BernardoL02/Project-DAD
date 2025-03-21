import { ref, computed, inject, nextTick, watch } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'
import { useRouter } from 'vue-router'
import { useGameMultiplayerStore } from '@/stores/gameMultiplayer'
import { useNotificationStore } from '@/stores/notification'

export const useLobbyStore = defineStore('lobby', () => {
  const storeAuth = useAuthStore()
  const storeError = useErrorStore()
  const socket = inject('socket')
  const storeGameMultiplayer = useGameMultiplayerStore()
  const router = useRouter()
  const games = ref([])
  const notificationStore = useNotificationStore()
  const storeGame = useGameStore()

  const totalGames = computed(() => games.value.length)

  const webSocketServerResponseHasError = (response) => {
    if (response.errorCode) {
      storeError.setErrorMessages(response.errorMessage, [], response.errorCode)
      return true
    }
    return false
  }

  // ------------------------------------------------------
  // Lobby
  // ------------------------------------------------------

  const fetchGames = () => {
    storeError.resetMessages()
    socket.emit('fetchGames', (response) => {
      if (!response.errorCode) {
        games.value = response.games
        now.value = response.serverTime
      } else {
        storeError.setErrorMessages(response.errorMessage)
      }
    })
  }

  const joinLobbyById = (lobbyId) => {
    const currentBalance = storeAuth.user.brain_coins_balance
    socket.emit('joinlobby', Number(lobbyId), currentBalance, (response) => {
      if (response.errorCode) {
        storeError.setErrorMessages(response.errorMessage)
      } else {
        now.value = response.serverTime
        notificationStore.setSuccessMessage('Successfully joined the lobby!', 'Lobby Joined')
        router.push({ path: '/multiplayer/lobbys' })
      }
    })
  }

  socket.on('lobbyChanged', (lobbyGames) => {
    games.value = lobbyGames
  })

  const CreateLobby = async (rows, cols, board_id) => {
    storeError.resetMessages()

    try {
      const idGame = await storeGame.createMultiPlayer(board_id)
      const currentBalance = storeAuth.user.brain_coins_balance

      socket.emit('createLobby', idGame, rows, cols, currentBalance, (response) => {
        if (webSocketServerResponseHasError(response)) {
          return
        }
      })
    } catch (error) {
      console.log(error.response)
      storeError.setErrorMessages('Failed to create multiplayer game.')
    }
  }

  const joinlobby = (id) => {
    storeError.resetMessages()

    const currentBalance = storeAuth.user.brain_coins_balance

    socket.emit('joinlobby', id, currentBalance, (response) => {
      if (webSocketServerResponseHasError(response)) {
        return
      }
      fetchGames()
    })
  }

  const setReady = (gameId, playerId) => {
    storeError.resetMessages()
    socket.emit('setReady', { gameId, playerId }, (response) => {
      if (webSocketServerResponseHasError(response)) return
      fetchGames()
    })
  }

  const leaveLobby = (gameId) => {
    storeError.resetMessages()
    socket.emit('leaveLobby', gameId, (response) => {
      if (webSocketServerResponseHasError(response)) {
        return
      }

      const currentUser = storeAuth.user
      const wasLobbyOwner = response.previousOwnerId === currentUser.id

      if (wasLobbyOwner && response.player1 && response.player1.id !== currentUser.id) {
        storeGame.sendPostUpdateOwner(response.id, response.player1.id)
      }

      fetchGames()
    })
  }

  const removePlayer = (gameId, playerId) => {
    socket.emit('removePlayer', { gameId, playerId }, (response) => {
      if (response.errorCode) {
        storeError.setErrorMessages(response.errorMessage)
      } else {
        notificationStore.setSuccessMessage('Player removed successfully!', 'Player Removed')
        fetchGames()
      }
    })
  }

  // ------------------------------------------------------
  // Chat
  // ------------------------------------------------------

  const openChats = ref([])
  const activeChatIndex = ref(0)
  const isChatOpen = ref(false)

  const toggleChat = (state) => {
    isChatOpen.value = state
  }

  const openChatPanel = (user) => {
    if (user.id === storeAuth.user.id) {
      storeError.setErrorMessages('You cannot open a chat with yourself.')
      return
    }

    const existingChatIndex = openChats.value.findIndex((chat) => chat.user.id === user.id)

    if (existingChatIndex === -1) {
      const savedMessages = sessionStorage.getItem(`chat_${user.id}`)
      const messages = savedMessages ? JSON.parse(savedMessages) : []

      openChats.value.push({ user, messages, isOpen: true })
      activeChatIndex.value = openChats.value.length - 1
    } else {
      openChats.value[existingChatIndex].isOpen = true
      activeChatIndex.value = existingChatIndex
    }

    isChatOpen.value = true
    saveChatsToSession()
  }

  const sendPrivateMessage = (user, message) => {
    socket.emit('privateMessage', { destinationUser: user, message }, (response) => {
      if (response.success) {
        const existingChat = openChats.value.find((chat) => chat.user.id === user.id)
        if (existingChat) {
          existingChat.messages.push({ sender: 'You', text: message })
        } else {
          openChats.value.push({ user, messages: [{ sender: 'You', text: message }] })
        }
      }
    })
  }

  socket.on('privateMessage', (payload) => {
    const existingChatIndex = openChats.value.findIndex((chat) => chat.user.id === payload.user.id)

    if (existingChatIndex !== -1) {
      openChats.value[existingChatIndex].messages.push({
        sender: payload.user.nickname,
        text: payload.message
      })
      activeChatIndex.value = existingChatIndex
    } else {
      openChats.value.push({
        user: payload.user,
        messages: [{ sender: payload.user.nickname, text: payload.message }]
      })
      activeChatIndex.value = openChats.value.length - 1
    }
    if (!isChatOpen.value) {
      isChatOpen.value = true
    }

    saveChatsToSession()
  })

  const closeChat = (index) => {
    const chat = openChats.value[index]
    if (chat) {
      sessionStorage.setItem(`chat_${chat.user.id}`, JSON.stringify(chat.messages))
    }
    openChats.value.splice(index, 1)

    if (openChats.value.length === 0) {
      isChatOpen.value = false
    } else {
      activeChatIndex.value = Math.max(0, index - 1)
    }

    saveChatsToSession()
  }

  const switchChatPanel = (index) => {
    activeChatIndex.value = index
  }

  const saveChatsToSession = () => {
    sessionStorage.setItem('openChats', JSON.stringify(openChats.value))
  }

  const loadChatsFromSession = () => {
    const savedChats = sessionStorage.getItem('openChats')
    if (savedChats) {
      openChats.value = JSON.parse(savedChats)
      if (openChats.value.length > 0) {
        const firstOpenChatIndex = openChats.value.findIndex((chat) => chat.isOpen)
        activeChatIndex.value = firstOpenChatIndex !== -1 ? firstOpenChatIndex : 0
        isChatOpen.value = firstOpenChatIndex !== -1
      }
    }
  }

  const now = ref(0)

  setInterval(() => {
    now.value += 1000
    refreshExpiredLobbies()
  }, 1000)

  const expiredLobbies = computed(() => {
    return games.value.filter((game) => game.expires_at <= now.value)
  })

  const refreshExpiredLobbies = () => {
    if (expiredLobbies.value.length > 0) {
      expiredLobbies.value.forEach(async (game) => {
        if (game.status === 'waiting') {
          await storeGame.sendPostOnExit(game.id)
        }
      })
      fetchGames()
    }
  }

  const timeRemaining = (expiresAt) => {
    const diff = expiresAt - now.value
    if (diff <= 1000) return 'Expired'

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    if (minutes === 0) {
      return `${seconds}s`
    }

    return `${minutes}m ${seconds}s`
  }

  // ------------------------------------------------------
  // Multiplayer Game
  // ------------------------------------------------------

  const startGame = async (gameId) => {
    storeError.resetMessages()

    await leaveOtherLobbies(gameId)

    socket.emit('startGame', gameId, (game) => {
      if (game) {
        storeGame.sendPostOnInPorgress(game.id)
        storeGame.storePlayers(game)
      } else {
        storeError.setErrorMessages('Failed to start the game.')
      }
    })
  }

  const leaveOtherLobbies = async (currentLobbyId) => {
    const lobbiesToLeave = games.value.filter((game) => game.id !== currentLobbyId)

    for (const lobby of lobbiesToLeave) {
      await new Promise((resolve) => {
        socket.emit('leaveLobby', lobby.id, async (response) => {
          if (!response.errorCode) {
            const currentUser = storeAuth.user
            if (response.previousOwnerId === currentUser.id) {
              try {
                await storeGame.sendPostOnExit(lobby.id)
              } catch (error) {}
            }
          }
          resolve()
        })
      })
    }
  }

  return {
    games,
    totalGames,
    fetchGames,
    CreateLobby,
    joinLobbyById,
    joinlobby,
    setReady,
    leaveLobby,
    removePlayer,
    sendPrivateMessage,
    openChats,
    activeChatIndex,
    closeChat,
    switchChatPanel,
    openChatPanel,
    isChatOpen,
    toggleChat,
    startGame,
    loadChatsFromSession,
    refreshExpiredLobbies,
    timeRemaining,
    now,
    leaveOtherLobbies
  }
})
