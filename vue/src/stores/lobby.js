import { ref, computed, inject, nextTick } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import { useAuthStore } from '@/stores/auth'

export const useLobbyStore = defineStore('lobby', () => {
  const storeAuth = useAuthStore()
  const storeError = useErrorStore()
  const socket = inject('socket')
  const games = ref([])

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

  // when the lobby changes on the server, it is updated on the client
  socket.on('lobbyChanged', (lobbyGames) => {
    games.value = lobbyGames
  })

  // add a game to the lobby
  const CreateLobby = (board) => {
    storeError.resetMessages()
    socket.emit('createLobby', board, (response) => {
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

  // ------------------------------------------------------
  // Chat
  // ------------------------------------------------------

  const chatPanel = ref(null)
  const setChatPanel = (panel) => {
    if (panel) {
      console.log('Chat panel set:', panel)
      chatPanel.value = panel
    } else {
      console.error('Chat panel is null or undefined')
    }
  }

  const openChats = ref([])
  const activeChatIndex = ref(0)
  const isChatOpen = ref(false)

  const toggleChat = (state) => {
    isChatOpen.value = state
  }

  const sendPrivateMessage = (user, message) => {
    console.log('sendPrivateMessage called with:', user, message)
    socket.emit('privateMessage', { destinationUser: user, message }, (response) => {
      if (response.success) {
        console.log(`Message sent to ${user.name}: ${message}`)
        const existingChat = openChats.value.find((chat) => chat.user.id === user.id)
        if (existingChat) {
          existingChat.messages.push({ sender: 'You', text: message })
        }
      } else {
        storeError.setErrorMessages(response.errorMessage)
      }
    })
  }

  socket.on('privateMessage', (payload) => {
    console.log('Received payload:', payload)

    const existingChatIndex = openChats.value.findIndex((chat) => chat.user.id === payload.user.id)

    if (existingChatIndex !== -1) {
      // Chat já existe: adiciona a mensagem e abre o chat com a pessoa correta
      openChats.value[existingChatIndex].messages.push({
        sender: payload.user.nickname,
        text: payload.message
      })
      activeChatIndex.value = existingChatIndex
    } else {
      // Chat não existe: cria um novo chat e adiciona a mensagem
      openChats.value.push({
        user: payload.user,
        messages: [{ sender: payload.user.nickname, text: payload.message }]
      })
      activeChatIndex.value = openChats.value.length - 1
    }

    // Abre o painel de chat e o chat com a pessoa correta
    nextTick(() => {
      chatPanel.value?.openPanel(
        openChats.value[activeChatIndex.value].user,
        openChats.value[activeChatIndex.value].messages
      )
    })

    // Se o chat não estiver aberto, abre o painel de chat
    if (!isChatOpen.value) {
      toggleChat(true)
    }
  })

  const openChatPanel = (user) => {
    if (user.id === storeAuth.user.id) {
      storeError.setErrorMessages('Cannot open chat with yourself.')
      return
    }

    const existingChatIndex = openChats.value.findIndex((chat) => chat.user.id === user.id)
    if (existingChatIndex === -1) {
      openChats.value.push({ user, messages: [] })
      activeChatIndex.value = openChats.value.length - 1
    } else {
      activeChatIndex.value = existingChatIndex
    }

    nextTick(() => {
      chatPanel.value?.openPanel(
        openChats.value[activeChatIndex.value].user,
        openChats.value[activeChatIndex.value].messages
      )
    })
    if (toggleChat) {
      toggleChat(true)
    }
  }

  const closeChat = (index) => {
    openChats.value.splice(index, 1)
    if (activeChatIndex.value >= openChats.value.length) {
      activeChatIndex.value = openChats.value.length - 1
    }
  }

  const switchChatPanel = (index) => {
    activeChatIndex.value = index
    nextTick(() => {
      chatPanel.value?.openPanel(openChats.value[index].user, openChats.value[index].messages)
    })
  }

  return {
    games,
    totalGames,
    fetchGames,
    CreateLobby,
    joinlobby,
    setReady,
    leaveLobby,
    sendPrivateMessage,
    setChatPanel,
    openChats,
    activeChatIndex,
    openChatPanel,
    closeChat,
    switchChatPanel,
    isChatOpen,
    toggleChat
  }
})
