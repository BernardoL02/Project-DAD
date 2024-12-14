<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTransactionStore } from '@/stores/transaction';
import { useErrorStore } from '@/stores/error';
import { useNotificationStore } from '@/stores/notification';

const authStore = useAuthStore();
const transactionStore = useTransactionStore();
const storeError = useErrorStore()
const notificationStore = useNotificationStore();

const storeItems = ref([]);
const showModal = ref(false);
const selectedItem = ref(null);
const selectedPaymentType = ref('MBWAY');
const paymentReference = ref('');

const generateStoreItems = () => {
  const multiples = [10, 20, 30, 40, 50, 60];
  storeItems.value = multiples.map((coins, index) => ({
    id: index + 1,
    name: `${coins} Coins`,
    price: coins / 10,
    coins: coins,
    img: `/Store/${coins}Coins.png`,
  }));
};

const openModal = (item) => {
  selectedItem.value = item;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  paymentReference.value = '';
  selectedPaymentType.value = 'MB';
};

const hanglePayment = (type) => {
  selectedPaymentType.value = type
}

const processPurchase = async () => {
  try {
    if (!authStore.user) {
      storeError.setErrorMessages('You need to be logged in to buy coins.');
      return;
    }

    if (!paymentReference.value.trim()) {
      storeError.setErrorMessages('Please enter a valid payment reference.');
      return;
    }

    const paymentDetails = {
      type: selectedPaymentType.value,
      reference: paymentReference.value,
      value: selectedItem.value.price,
    };

    await transactionStore.createTransactionForBrainCoins(paymentDetails, selectedItem.value.coins);

    notificationStore.setSuccessMessage(`Successfully purchased ${selectedItem.value.name}.`);
    await authStore.fetchProfile();
    await authStore.getNotifications();
    closeModal();
  } catch (error) {
    console.error('Error processing payment:', error.response?.data || error.message);
  }
};

// Update profile and generate store items on page load
onMounted(async () => {
  generateStoreItems();
});
</script>



<template>
  <div class="max-w-3xl mx-auto py-8">
    <h1 class="text-3xl font-bold text-center mb-8">Store</h1>

    <!-- Display User's Brain Coins -->
    <div class="bg-sky-100 p-6 rounded-xl shadow-lg flex justify-between items-center">
      <div>
        <p class="text-lg font-semibold">Hello, {{ authStore.nickname }}</p>
        <div class="flex items-center">
          <img src="/coin.png" alt="Coin Icon" class="w-6 h-6 object-contain mr-2" />
          <span class="text-lg font-bold">{{ authStore.coins }}</span>
        </div>
      </div>


      <div class="relative">
        <RouterLink :to="{ name: 'PlayerTransactionHistory' }"
          class="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition duration-300">
          My Transactions
        </RouterLink>
      </div>

    </div>


    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <div v-for="item in storeItems" :key="item.id"
        class="p-6 border rounded-lg flex flex-col items-center justify-between bg-white shadow-sm">
        <img :src="item.img" :alt="`${item.name} image`" class="w-24 h-24 object-contain mb-4" />
        <p class="text-lg font-bold">{{ item.name }}</p>
        <p class="text-sm text-gray-500">Price: €{{ item.price }}</p>
        <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition mt-4"
          @click="openModal(item)">
          Buy
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-xl font-bold mb-4">Purchase {{ selectedItem?.name }}</h2>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-600 mb-2">Payment Type</label>
          <div class="flex flex-row space-x-6 justify-center">
            <img src="/Store/mbway.png" @click="hanglePayment('MBWAY')" alt="Payment Icon" class="w-8 h-10" :class="{
              'disabled': selectedPaymentType !== 'MBWAY'
            }" />

            <img src="/Store/multibanco.png" @click="hanglePayment('MB')" alt="Payment Icon" class="w-11 h-10" :class="{
              'disabled': selectedPaymentType !== 'MB'
            }" />

            <img src="/Store/paypal.png" @click="hanglePayment('PAYPAL')" alt="Payment Icon" class="mt-1 w-8 h-8"
              :class="{
                'disabled': selectedPaymentType !== 'PAYPAL'
              }" />

            <img src="/Store/visa.png" @click="hanglePayment('VISA')" alt="Payment Icon" class="mt-1 w-8 h-8" :class="{
              'disabled': selectedPaymentType !== 'VISA'
            }" />

            <img src="/Store/bank.png" @click="hanglePayment('IBAN')" alt="Payment Icon" class="mt-1 w-8 h-8" :class="{
              'disabled': selectedPaymentType !== 'IBAN'
            }" />
          </div>

        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-600 mb-2">Payment Reference</label>
          <input type="text" v-model="paymentReference" placeholder="Enter payment reference"
            class="block w-full border border-gray-300 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500" />
        </div>

        <div class="flex justify-end space-x-4">
          <button class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400" @click="closeModal">
            Cancel
          </button>
          <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" @click="processPurchase">
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>



<style scoped>
.grid {
  grid-gap: 1.5rem;
}

button {
  transition: all 0.3s ease-in-out;
}

button:hover {
  transform: scale(1.05);
}

img {
  transition: transform 0.3s;
}

img:hover {
  transform: scale(1.1);
}

.disabled {
  opacity: 0.4;
}
</style>
