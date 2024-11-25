<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProfileStore } from '@/stores/profile';
import { useTransactionStore } from '@/stores/transaction';

const profileStore = useProfileStore();
const transactionStore = useTransactionStore();

// Produtos disponíveis na loja
const storeItems = ref([
  { id: 1, name: '50 Coins', price: 5, coins: 50 },
  { id: 2, name: '100 Coins', price: 10, coins: 100 },
  { id: 3, name: '200 Coins', price: 20, coins: 200 },
]);

// Função para comprar moedas
const buyItem = async (item) => {
  try {
    if (!profileStore.userProfile) {
      alert('You need to be logged in to buy coins.');
      return;
    }

    // Exemplo de lógica para validar a compra (por exemplo, verifica saldo)
    // Neste caso, está simplificado, assumindo que o backend processa o pagamento.

    await transactionStore.createTransaction({
      type: 'Purchase',
      brain_coins: item.coins,
      transaction_datetime: new Date().toISOString(),
    });

    alert(`Successfully purchased ${item.name}`);
    await profileStore.fetchProfile(); // Atualiza os dados do perfil
  } catch (error) {
    console.error('Error purchasing item:', error.message || error.response?.data);
    alert('Failed to complete the purchase. Please try again.');
  }
};

// Atualizar perfil ao carregar
onMounted(async () => {
  await profileStore.fetchProfile();
});
</script>

<template>
  <div class="max-w-3xl mx-auto py-8">
    <h1 class="text-3xl font-bold text-center mb-8">Store</h1>

    <!-- Mostra o saldo do usuário -->
    <div class="bg-sky-100 p-4 rounded shadow-md flex justify-between items-center mb-6">
      <div>
        <p class="text-lg font-semibold">Hello, {{ profileStore.nickname }}</p>
        <div class="flex items-center">
          <img src="/coin.png" alt="Coin Icon" class="w-6 h-6 object-contain mr-2" />
          <span class="text-lg font-bold">{{ profileStore.coins }} Coins</span>
        </div>
      </div>
    </div>

    <!-- Lista de itens disponíveis na loja -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="item in storeItems"
        :key="item.id"
        class="p-6 border rounded-lg flex flex-col items-center justify-between bg-white shadow-sm"
      >
        <p class="text-lg font-bold">{{ item.name }}</p>
        <p class="text-sm text-gray-500">Price: ${{ item.price }}</p>
        <button
          class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition mt-4"
          @click="buyItem(item)"
        >
          Buy
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Adicione estilos personalizados aqui, se necessário */
</style>
