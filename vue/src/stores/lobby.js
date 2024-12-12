import { ref, computed, inject, nextTick, watch } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import { useAuthStore } from '@/stores/auth'
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
      console.log('Received games:', response)
      if (webSocketServerResponseHasError(response)) {
        return
      }
      games.value = response
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
  const CreateLobby = (rows, cols) => {
    storeError.resetMessages()
    socket.emit('createLobby', rows, cols, (response) => {
      if (webSocketServerResponseHasError(response)) {
        return
      }
      console.log('Game created:', response)
    })
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
    console.log(gameId)
    socket.emit('setReady', { gameId, playerId }, (response) => {
      if (webSocketServerResponseHasError(response)) return
      console.log('Player ready status toggled:', response)
      fetchGames() // Atualiza os jogos após alterar o status de ready
    })
  }

  //Leave Lobby
  const leaveLobby = (gameId) => {
    storeError.resetMessages()
    socket.emit('leaveLobby', gameId, (response) => {
      if (webSocketServerResponseHasError(response)) {
        return
      }
      console.log('Left lobby:', response)
      fetchGames()
    })
  }

  const removePlayer = (gameId, playerId) => {
    socket.emit('removePlayer', { gameId, playerId }, (response) => {
      if (response.errorCode) {
        storeError.setErrorMessages(response.errorMessage)
      } else {
        notificationStore.setSuccessMessage('Player removed successfully!', 'Player Removed')
        fetchGames() // Atualiza os jogos após a remoção
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
    // Verifica se o usuário está tentando abrir um chat consigo mesmo
    if (user.id === storeAuth.user.id) {
      storeError.setErrorMessages('You cannot open a chat with yourself.')
      return
    }

    // Verifica se o usuário já está na lista de chats
    const existingChatIndex = openChats.value.findIndex((chat) => chat.user.id === user.id)

    if (existingChatIndex === -1) {
      // Adiciona um novo chat se não existir
      openChats.value.push({ user, messages: [], isOpen: true })
      activeChatIndex.value = openChats.value.length - 1
    } else {
      // Reabre o chat existente e define o índice ativo
      openChats.value[existingChatIndex].isOpen = true
      activeChatIndex.value = existingChatIndex
    }

    // Abre o painel de chat
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
    console.log('Received payload:', payload)

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
    openChats.value[index].isOpen = false
    isChatOpen.value = false
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

  // ------------------------------------------------------
  // Multiplayer Game
  // ------------------------------------------------------

  const startGame = (gameId) => {
    socket.emit('startGame', gameId, (game) => {
      if (game) {
        storeGameMultiplayer.addActiveGame(game) // Adiciona o jogo à lista de jogos ativos
        router.push({ path: '/multiplayer/game', query: { gameId: game.id } }) // Redireciona para a rota com o gameId
      } else {
        console.error('Failed to start the game.')
      }
    })
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
    loadChatsFromSession
  }
})
