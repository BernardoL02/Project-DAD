import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import { useErrorStore } from '@/stores/error'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'

export const useLobbyStore = defineStore('lobby', () => {
  const storeAuth = useAuthStore()
  const storeError = useErrorStore()
  const socket = inject('socket')
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

  // fetch lobby games from the Websocket server
  const fetchGames = () => {
    storeError.resetMessages()
    socket.emit('fetchGames', (response) => {
      if (!response.errorCode) {
        games.value = response
      } else {
        storeError.setErrorMessages(response.errorMessage)
      }
    })
  }

  const joinLobbyById = (lobbyId) => {
    socket.emit('joinlobby', Number(lobbyId), (response) => {
      if (response.errorCode) {
        storeError.setErrorMessages(response.errorMessage)
      } else {
        notificationStore.setSuccessMessage('Successfully joined the lobby!', 'Lobby Joined')
        router.push({ path: '/multiplayer/lobbys' })
      }
    })
  }

  // when the lobby changes on the server, it is updated on the client
  socket.on('lobbyChanged', (lobbyGames) => {
    games.value = lobbyGames
  })

  // add a game to the lobby
  const CreateLobby = async (rows, cols, board_id) => {
    storeError.resetMessages()

    try {
      const idGame = await storeGame.createMultiPlayer(board_id)

      socket.emit('createLobby', idGame, rows, cols, (response) => {
        if (webSocketServerResponseHasError(response)) {
          return
        }
      })
    } catch (error) {
      storeError.setErrorMessages('Failed to create multiplayer game.')
      console.error('Error creating lobby:', error)
    }
  }

  // join a game of the lobby
  const joinlobby = (id) => {
    storeError.resetMessages()
    socket.emit('joinlobby', id, (response) => {
      if (webSocketServerResponseHasError(response)) {
        return
      }
      fetchGames()
    })
  }

  //Set Ready Player on lobby
  const setReady = (gameId, playerId) => {
    storeError.resetMessages()
    socket.emit('setReady', { gameId, playerId }, (response) => {
      if (webSocketServerResponseHasError(response)) return
      fetchGames() // Atualiza os jogos após alterar o status de ready
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

      if (wasLobbyOwner && response.player1.id !== currentUser.id) {
        if (response.id != null && response.player1.id != null) {
          storeGame.sendPostUpdateOwner(response.id, response.player1.id)
        }
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
    // Verifica se o chat com o usuário já existe
    const existingChatIndex = openChats.value.findIndex((chat) => chat.user.id === payload.user.id)

    if (existingChatIndex !== -1) {
      // Chat já existe: adiciona a mensagem recebida
      openChats.value[existingChatIndex].messages.push({
        sender: payload.user.nickname,
        text: payload.message
      })
      activeChatIndex.value = existingChatIndex
    } else {
      // Chat não existe: cria um novo chat com a mensagem recebida
      openChats.value.push({
        user: payload.user,
        messages: [{ sender: payload.user.nickname, text: payload.message }]
      })
      activeChatIndex.value = openChats.value.length - 1
    }

    // Abre o painel de chat se não estiver aberto
    if (!isChatOpen.value) {
      isChatOpen.value = true
    }

    // Salva o estado dos chats na sessionStorage
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
        // Abre o primeiro chat que estava aberto
        const firstOpenChatIndex = openChats.value.findIndex((chat) => chat.isOpen)
        activeChatIndex.value = firstOpenChatIndex !== -1 ? firstOpenChatIndex : 0
        isChatOpen.value = firstOpenChatIndex !== -1
      }
    }
  }

  // Dentro do storeLobby
  const now = ref(Date.now())

  // Atualiza a hora atual a cada segundo
  setInterval(() => {
    now.value = Date.now()
    refreshExpiredLobbies()
  }, 1000)

  // Computed para verificar lobbies expirados
  const expiredLobbies = computed(() => {
    return games.value.filter((game) => game.expires_at <= now.value)
  })

  // Função para atualizar lobbies expirados
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
    if (diff <= 0) return 'Expired'

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

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
    // Filtra os lobbies ativos, exceto o lobby atual
    const lobbiesToLeave = games.value.filter((game) => game.id !== currentLobbyId)

    for (const lobby of lobbiesToLeave) {
      await new Promise((resolve) => {
        socket.emit('leaveLobby', lobby.id, async (response) => {
          if (!response.errorCode) {
            // Verifica se o usuário era o dono do lobby
            const currentUser = storeAuth.user
            if (response.previousOwnerId === currentUser.id) {
              try {
                await storeGame.sendPostOnExit(lobby.id)
              } catch (error) {
                console.error(`Error updating lobby ${lobby.id} status via API:`, error)
              }
            }
          } else {
            console.error(`Error leaving lobby ${lobby.id}:`, response.errorMessage)
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
