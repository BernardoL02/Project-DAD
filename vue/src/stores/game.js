import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'

export const useGameStore = defineStore('game', () => {
  const storeError = useErrorStore()

  const games = ref([])
  const statusFilter = ref('')
  const beginDateFilter = ref('')
  const boardFilter = ref('All')

  // Função para atualizar o filtro de tabuleiro
  const handleBoardSizeChange = (boardSize) => {
    boardFilter.value = boardSize
  }

  const getSinglePlayerGames = async () => {
    storeError.resetMessages()
    try {
      const response = await axios.get('games/single')

      const updatedGames = response.data.data.map((game) => ({
        id: game.id,
        board_id:
          game.board_id === 1
            ? '3x4'
            : game.board_id === 2
              ? '4x4'
              : game.board_id === 3
                ? '6x6'
                : 'N/A',
        status:
          game.status === 'PE'
            ? 'Pending'
            : game.status === 'PL'
              ? 'In Progress'
              : game.status === 'E'
                ? 'Ended'
                : game.status === 'I'
                  ? 'Interrupted'
                  : 'N/A',
        began_at: game.began_at || 'N/A',
        total_time: game.total_time + 's' || 'N/A'
      }))
      games.value = updatedGames
    } catch (e) {
      storeError.setErrorMessages(
        e.response?.data?.message || 'An error occurred',
        e.response?.data?.errors || [],
        e.response?.status || 500,
        "Error fetching user's single games!"
      )
    }
  }

  // Computed property para filtrar os jogos
  const filteredGames = computed(() => {
    let filtered = games.value

    // Filtro por status
    if (statusFilter.value && statusFilter.value !== 'All') {
      filtered = filtered.filter((game) => game.status === statusFilter.value)
    }

    // Filtro por data de início
    if (beginDateFilter.value) {
      filtered = filtered.filter((game) => game.began_at.includes(beginDateFilter.value))
    }

    // Filtro por tabuleiro
    if (boardFilter.value && boardFilter.value !== 'All') {
      filtered = filtered.filter((game) => game.board_id === boardFilter.value)
    }

    return filtered
  })

  const bestResults = computed(() => {
    const endedGames = games.value.filter((game) => {
      const isBoardMatch =
        !boardFilter.value || boardFilter.value === 'All' || game.board_id === boardFilter.value;
      return game.status === 'Ended' && isBoardMatch;
    });

    const sorted = endedGames.sort((a, b) => {
      const timeA = parseFloat(a.total_time.replace('s', '')) || 0;
      const timeB = parseFloat(b.total_time.replace('s', '')) || 0;
      return timeA - timeB;
    });

    return sorted.slice(0, 10);
  });   


  const createSinglePlayer = async (board_id) => {
    try {
      const beganAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const response = await axios.post('games', {
        type: 'S',
        status: 'PL',
        began_at: beganAt,
        board_id: board_id
      });
      const createdGame = response.data.data;
      return createdGame.id; // Retorna o ID do jogo criado
    } catch (e) {
      console.error('Error creating single-player game:', e);
      storeError.setErrorMessages(
        e.response?.data?.message || 'An error occurred while creating the game',
        e.response?.data?.errors || [],
        e.response?.status || 500
      );
      throw new Error('Failed to create single-player game');
    }
  };

  const sendPostOnExit = async (gameId) => {
    try {
      if (!gameId) {
        console.error('Game ID não está definido.');
        return;
      }
  
      await axios.patch(`/games/${gameId}`, {
        status: 'I',
      });
      console.log('Game status atualizado para "interrupted".');
    } catch (error) {
      console.error('Erro ao atualizar status do jogo:', error.response?.data || error.message);
    }
  };
  
  const sendPostOnGameEnd = async (totalTime, gameId) => {
    try {
      if (!gameId) {
        console.error('Game ID não está definido.');
        return;
      }
  
      await axios.patch(`/games/${gameId}`, {
        status: 'E',
        total_time: totalTime,
      });
  
      console.log(`Game atualizado com status "ended" e tempo total de ${totalTime} segundos.`);
    } catch (error) {
      console.error('Erro ao atualizar status do jogo:', error.response?.data || error.message);
    }
  };
  

  return {
    games,
    getSinglePlayerGames,
    createSinglePlayer,
    sendPostOnExit,
    sendPostOnGameEnd,
    statusFilter,
    beginDateFilter,
    boardFilter,
    filteredGames,
    bestResults,
    handleBoardSizeChange
  }
})
