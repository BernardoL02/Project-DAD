<template>
  <div class="statistics-container">
    <h1 class="text-5xl font-bold mb-10 text-center">Game Statistics</h1>
    <div v-if="loading" class="text-center text-gray-400">Loading...</div>
    <div v-else>
      <div class="flex pb-10 space-x-4">
        <!-- Buttons -->
        <div class="mb-6">
          <button
            @click="setSelectedView('game')"
            :class="{
              'bg-green-500 text-white': selectedView === 'game',
              'bg-gray-200': selectedView !== 'game'
            }"
            class="px-6 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
          >
            Game Statistics
          </button>
        </div>
        <div class="mb-6">
          <button
            @click="setSelectedView('purchase')"
            :class="{
              'bg-green-500 text-white': selectedView === 'purchase',
              'bg-gray-200': selectedView !== 'purchase'
            }"
            class="px-6 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
          >
            Purchase Statistics
          </button>
        </div>
        <div class="mb-6">
          <button
            @click="setSelectedView('players')"
            :class="{
              'bg-green-500 text-white': selectedView === 'players',
              'bg-gray-200': selectedView !== 'players'
            }"
            class="px-6 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
          >
            Players Statistics
          </button>
        </div>
      </div>

      <div class="flex flex-wrap justify-around">
        <div v-if="selectedView === 'game'" class="chart-container p-4 w-full">
          <div class="mb-6">
            <div class="text-lg font-semibold mb-6 text-center">
              Total Games Played: <span class="text-blue-600">{{ totalGames }}</span>
            </div>
            <div class="chart-container p-4 w-1/2">
              <div class="text-center font-semibold text-xl mb-2">
                Total games for Single-Player vs Multi-Player Games
              </div>
              <Bar :data="horizontalBarChartData" :options="horizontalBarChartOptions" />
            </div>
            <button
              v-for="year in [2023, 2024]"
              :key="year"
              @click="changeYear(year)"
              :class="{
                'bg-sky-500 text-white': selectedYear === year,
                'bg-gray-200': selectedYear !== year
              }"
              class="px-4 py-2 mx-2 rounded-md font-semibold"
            >
              {{ year }}
            </button>
          </div>
          <div class="flex flex-wrap justify-between space-x-4">
            <div class="chart-container p-4 w-1/2">
              <Bar :data="chartData" />
            </div>
            <div class="chart-container p-1 w-96 h-96">
              <div class="text-center font-semibold text-xl mb-2">
                Number of Games for Each Board Size
              </div>
              <Pie :data="pieChartData" />
            </div>
          </div>
        </div>
        <div v-if="selectedView === 'purchase'" class="chart-container p-4">
          <div v-if="playerStats">
            <div class="mb-6">
              <p class="font-semibold text-xl">
                Total Transactions:
                <span class="text-blue-600">{{ playerStats.totalTransactions }}</span>
              </p>
              <p class="font-semibold text-xl">
                Total Value of Transactions:
                <span class="text-blue-600">{{ playerStats.totalTransactionValue }} €</span>
              </p>
            </div>
            <div class="flex justify-between space-x-2">
              <div class="w-6/12 text-center">
                <div class="font-semibold text-xl mb-2">Number of Purchases per Payment Type</div>
                <div class="chart-container p-4">
                  <Doughnut :data="paymentTypesData" />
                </div>
              </div>

              <!-- Number of Purchases per Pack (Bar chart) -->
              <div class="w-6/12 text-center">
                <div class="font-semibold text-xl mb-2">Number of Purchases per Pack</div>
                <div class="chart-container p-4">
                  <Bar :data="packSalesData" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedView === 'players'" class="chart-container p-4 w-1/2">
          <h2 class="text-center">Players Statistics Chart (Coming Soon)</h2>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStatisticsStore } from '@/stores/statistics'
import { onMounted, computed, ref } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ScatterController,
  PointElement,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar, Pie, Doughnut, Scatter } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  ScatterController,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const statisticsStore = useStatisticsStore()

const loading = computed(() => statisticsStore.loading)
const totalGames = computed(() => statisticsStore.totalGames)
const selectedYear = computed(() => statisticsStore.selectedYear)
const transactions = computed(() => statisticsStore.transactions)
const games = computed(() => statisticsStore.games)

const selectedView = ref('game')

const monthlyGameCounts = computed(() => statisticsStore.monthlyGameCounts)

const chartData = computed(() => {
  const gameCounts = monthlyGameCounts.value

  const months = Object.keys(gameCounts)
  const counts = Object.values(gameCounts)

  return {
    labels: months,
    datasets: [
      {
        label: 'Games Played Each Month',
        data: counts,
        backgroundColor: '#fea112'
      }
    ]
  }
})

const pieChartData = computed(() => {
  const games = statisticsStore.filteredGames

  const boardSizeCounts = games.reduce((acc, game) => {
    if (!acc[game.board_id]) {
      acc[game.board_id] = 0
    }
    acc[game.board_id]++
    return acc
  }, {})

  return {
    labels: Object.keys(boardSizeCounts),
    datasets: [
      {
        data: Object.values(boardSizeCounts),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF5722'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF5722']
      }
    ]
  }
})

const horizontalBarChartOptions = {
  indexAxis: 'y', // This makes the bars horizontal
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    }
  }
}
const horizontalBarChartData = computed(() => {
  const singlePlayerGames = games.value.filter((game) => game.Type === 'Single-Player').length
  const multiplayerGames = games.value.filter((game) => game.Type === 'Multi-Player').length

  return {
    labels: ['Single-Player', 'Multiplayer'],
    datasets: [
      {
        label: 'Number of Games',
        data: [singlePlayerGames, multiplayerGames],
        backgroundColor: ['#FF6384', '#36A2EB'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB']
      }
    ]
  }
})

const playerStats = computed(() => {
  if (!transactions.value) return null

  const totalPlayers = new Set(transactions.value.map((t) => t.Name)).size
  const totalTransactions = transactions.value.length
  const totalTransactionValue = transactions.value.reduce(
    (sum, transaction) => sum + (parseFloat(transaction.value) || 0),
    0
  )

  return {
    totalPlayers,
    totalTransactions,
    totalTransactionValue
  }
})

const paymentTypesData = computed(() => {
  const validPaymentTypes = ['PAYPAL', 'MBWAY', 'VISA', 'IBAN', 'MB']

  const filteredTransactions = transactions.value.filter((transaction) =>
    validPaymentTypes.includes(transaction.paymentMethod)
  )

  const paymentTypeCounts = filteredTransactions.reduce((acc, transaction) => {
    const paymentType = transaction.paymentMethod
    if (!acc[paymentType]) {
      acc[paymentType] = 0
    }
    acc[paymentType]++
    return acc
  }, {})

  return {
    labels: Object.keys(paymentTypeCounts),
    datasets: [
      {
        label: 'Purchases per Payment Type',
        data: Object.values(paymentTypeCounts),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF5722'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF5722']
      }
    ]
  }
})

const packSalesData = computed(() => {
  const packCounts = transactions.value.reduce((acc, transaction) => {
    const pack = transaction.pack
    if (!acc[pack]) {
      acc[pack] = 0
    }
    acc[pack]++
    return acc
  }, {})

  const allPacks = [1, 2, 3, 4, 5, 6]
  allPacks.forEach((pack) => {
    if (!packCounts[pack]) {
      packCounts[pack] = 0
    }
  })

  return {
    labels: allPacks.map((pack) => `${pack * 10} Coins`),
    datasets: [
      {
        label: 'Purchases per Pack',
        data: allPacks.map((pack) => packCounts[pack]),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF5722', '#7F8C8D'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF5722', '#7F8C8D']
      }
    ]
  }
})

const changeYear = (year) => {
  statisticsStore.selectedYear = year
}

const setSelectedView = (view) => {
  selectedView.value = view
}

onMounted(() => {
  statisticsStore.getAllGames()
  statisticsStore.getTransactions()
})
</script>

<style scoped>
.statistics-container {
  margin: 0 auto;
  max-width: 1200px;
}

.chart-container {
  min-height: 400px;
}

button {
  transition: background-color 0.3s ease;
}
</style>
