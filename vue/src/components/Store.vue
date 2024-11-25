<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProfileStore } from '@/stores/profile';
import { useTransactionStore } from '@/stores/transaction';

const profileStore = useProfileStore();
const transactionStore = useTransactionStore();

const storeItems = ref([]); // Armazena os itens da loja

// Função para gerar os itens disponíveis na loja
const generateStoreItems = () => {
  const multiples = [10, 20, 30, 40, 50, 60];
  storeItems.value = multiples.map((coins, index) => ({
    id: index + 1,
    name: `${coins} Coins`,
    price: coins / 10, // Cada 10 moedas custam 1 euro
    coins: coins,
  }));
};

// Função para processar a compra de moedas
const buyItem = async (item) => {
  try {
    // Verifica se o usuário está logado
    if (!profileStore.userProfile) {
      alert('You need to be logged in to buy coins.');
      return;
    }

    // Cria a transação no backend
    await transactionStore.createTransaction({
      type: 'Purchase', // Tipo de transação
      brain_coins: item.coins,
      euros: item.price,
      transaction_datetime: new Date().toISOString(), // Data atual no formato ISO
    });

    alert(`Successfully purchased ${item.name}.`);
    await profileStore.fetchProfile(); // Atualiza o saldo do perfil
  } catch (error) {
    console.error('Error purchasing item:', error.response?.data || error.message);
    alert('Failed to complete the purchase. Please try again.');
  }
};

// Atualiza o perfil e gera os itens da loja ao carregar a página
onMounted(async () => {
  await profileStore.fetchProfile();
  generateStoreItems();
});
</script>

<template>
  <div class="max-w-3xl mx-auto py-8">
    <h1 class="text-3xl font-bold text-center mb-8">Store</h1>

    <!-- Exibição do saldo do usuário -->
    <div class="bg-sky-100 p-4 rounded shadow-md flex justify-between items-center mb-6">
      <div>
        <p class="text-lg font-semibold">Hello, {{ profileStore.nickname }}</p>
        <div class="flex items-center">
          <img src="/coin.png" alt="Coin Icon" class="w-6 h-6 object-contain mr-2" />
          <span class="text-lg font-bold">{{ profileStore.coins }} Coins</span>
        </div>
      </div>
    </div>

    <!-- Lista de itens disponíveis -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="item in storeItems"
        :key="item.id"
        class="p-6 border rounded-lg flex flex-col items-center justify-between bg-white shadow-sm"
      >
        <p class="text-lg font-bold">{{ item.name }}</p>
        <p class="text-sm text-gray-500">Price: €{{ item.price }}</p>
        <button
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition mt-4"
          @click="buyItem(item)"
        >
          Buy
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos para organizar a grade de itens */
.grid {
  grid-gap: 1.5rem;
}

button {
  transition: all 0.3s ease-in-out;
}

button:hover {
  transform: scale(1.05);
}
</style>
