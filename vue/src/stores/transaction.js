import { ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import { useErrorStore } from '@/stores/error';

export const useTransactionStore = defineStore('transaction', () => {
  const storeError = useErrorStore();

  const transactions = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const createTransactionsGames = async (gameId, cost) => {
    try {
      const datetime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const response = await axios.post('/transactions', {
        type: 'I',
        game_id: gameId,
        brain_coins: -cost,
        transaction_datetime: datetime,
      });

      console.log('Transaction created for game successfully:', response.data);
      return response.data;
    } catch (error) {
      storeError.setErrorMessages(
        error.response?.data?.message,
        error.response?.data?.errors,
        error.response?.data?.status,
        'Game Transaction Error'
      );
      console.error('Error creating game transaction:', error.response?.data || error.message);
      throw error;
    }
  };

  return {
    transactions,
    loading,
    error,
    createTransactionsGames,
  };
});
