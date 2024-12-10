import { ref, computed, inject } from 'vue'
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

  return {
    games,
    totalGames,
    fetchGames,
    CreateLobby,
    joinlobby,
    setReady,
    leaveLobby
  }
})
