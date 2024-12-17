<script setup>
import { useStatisticsStore } from '@/stores/statistics'
import { useAuthStore } from '@/stores/auth'
import { onMounted, computed, ref, defineAsyncComponent } from 'vue'
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
const Bar = defineAsyncComponent(() => import('vue-chartjs').then((m) => m.Bar))
const Pie = defineAsyncComponent(() => import('vue-chartjs').then((m) => m.Pie))
const Doughnut = defineAsyncComponent(() => import('vue-chartjs').then((m) => m.Doughnut))

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
const authStore = useAuthStore()

const loading = computed(() => statisticsStore.loading)
const totalGames = computed(() => statisticsStore.totalGames || 0)
const totalGamesUser = computed(() => statisticsStore.totalGamesUser || 0)
const selectedYear = computed(() => statisticsStore.selectedYear)
const transactionsStatistics = computed(() => statisticsStore.transactionsStatistics)
const transactionsUser = computed(() => statisticsStore.transactionsUser)
const totalMultiPlayerGames = computed(() => statisticsStore.totalMultiPlayerGames)
const totalSinglePlayerGames = computed(() => statisticsStore.totalSinglePlayerGames)
const gameStatistics = computed(() => statisticsStore.gameStatistics)
const topPlayersByTimePlayed = computed(() => statisticsStore.topPlayersByTimePlayed)
const selectedView = ref('')

if (authStore.isAdmin) {
  selectedView.value = 'game'
} else {
  selectedView.value = 'myStatistics'
}

const monthlyGameCountsUser = computed(() => statisticsStore.monthlyGameCountsUser)

const chartData = computed(() => {
  const monthlyData = gameStatistics.value.totalGamesByYearMoth
    .filter((item) => item.year === selectedYear.value)
    .reduce((acc, { month, total }) => {
      const monthName = new Date(0, month - 1).toLocaleString('default', { month: 'short' })
      acc[monthName] = total
      return acc
    }, {})

  const allMonths = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]
  const counts = allMonths.map((month) => monthlyData[month] || 0)

  return {
    labels: allMonths,
    datasets: [
      {
        label: 'Games Played Each Month',
        data: counts,
        backgroundColor: '#fea112'
      }
    ]
  }
})
const chartDataUser = computed(() => {
  const gameCounts = monthlyGameCountsUser.value

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
  const boardSizes = gameStatistics.value.gamesByBoardSize || []

  return {
    labels: boardSizes.map((item) => {
      return item.board === 1
        ? '3x4'
        : item.board === 2
          ? '4x4'
          : item.board === 3
            ? '6x6'
            : 'Other'
    }),
    datasets: [
      {
        data: boardSizes.map((item) => item.total),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF5722'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF5722']
      }
    ]
  }
})

const pieChartDataUser = computed(() => {
  const games = Array.isArray(statisticsStore.filteredGamesUser)
    ? statisticsStore.filteredGamesUser
    : []

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
  indexAxis: 'y',
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    }
  }
}
const horizontalBarChartData = computed(() => {
  const gamesByType = gameStatistics.value.gamesByType || []

  const singlePlayerGames = gamesByType.find((type) => type.type === 'S')?.total || 0
  const multiplayerGames = gamesByType.find((type) => type.type === 'M')?.total || 0

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
const horizontalBarChartDataUser = computed(() => {
  const singlePlayerCount = totalSinglePlayerGames.value
  const multiPlayerCount = totalMultiPlayerGames.value // Extract plain number

  return {
    labels: ['Single-Player', 'Multi-Player'],
    datasets: [
      {
        label: 'Number of Games',
        data: [singlePlayerCount, multiPlayerCount], // Use plain numbers
        backgroundColor: ['#07e87e', '#07b1e8'],
        hoverBackgroundColor: ['#06c86c', '#008dbb']
      }
    ]
  }
})

const userRegistrationData = computed(() => {
  const userCounts = statisticsStore.monthlyUserCounts

  // Define the fixed order of months
  const labels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]

  const counts = labels.map((month) => userCounts[month] || 0)

  return {
    labels,
    datasets: [
      {
        label: 'Users Registered Each Month',
        data: counts,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#8BC34A',
          '#FF5722',
          '#7F8C8D',
          '#E91E63',
          '#9C27B0',
          '#2196F3',
          '#00BCD4',
          '#4CAF50',
          '#FFC107'
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#8BC34A',
          '#FF5722',
          '#7F8C8D',
          '#E91E63',
          '#9C27B0',
          '#2196F3',
          '#00BCD4',
          '#4CAF50',
          '#FFC107'
        ]
      }
    ]
  }
})

const playerStatsUser = computed(() => {
  if (!transactionsUser.value) return null

  const purchaseTransactions = transactionsUser.value.filter(
    (transaction) => transaction.type === 'Purchase'
  )

  const totalPurchasesUser = purchaseTransactions.length
  const totalPurchaseUserValue = purchaseTransactions.reduce(
    (sum, transaction) => sum + (parseFloat(transaction.value) || 0),
    0
  )
  return {
    totalPurchasesUser,
    totalPurchaseUserValue
  }
})

const packSalesDataUser = computed(() => {
  const packCounts = transactionsUser.value.reduce((acc, transaction) => {
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

const paymentTypesData = computed(() => {
  const paymentTypeCounts = transactionsStatistics.value.numberOfPurchasesPerPaymentType || []

  return {
    labels: paymentTypeCounts.map((item) => item.payment_type), // Correct field for labels
    datasets: [
      {
        label: 'Purchases per Payment Type',
        data: paymentTypeCounts.map((item) => item.total), // Use "total" instead of "purchases"
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF5722'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF5722']
      }
    ]
  }
})

const playerStats = computed(() => {
  if (!transactionsStatistics.value) return null

  const totalPurchases = transactionsStatistics.value.totalPurchases || 0
  const totalPurchaseValue = transactionsStatistics.value.totalPurchaseValue || 0

  return {
    totalPurchases,
    totalPurchaseValue
  }
})

const packSalesData = computed(() => {
  const packCounts = transactionsStatistics.value.numberOfPurchasesPerPack || []
  return {
    labels: packCounts.map((item) => `${item.pack * 10} Coins`),
    datasets: [
      {
        label: 'Purchases per Pack',
        data: packCounts.map((item) => item.total),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF5722', '#7F8C8D'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF5722', '#7F8C8D']
      }
    ]
  }
})

const monthlyPurchaseData = computed(() => {
  const purchasesByMonth = transactionsStatistics.value.totalPurchasesByMonth || []

  return {
    labels: purchasesByMonth.map((item) => `${item.month}/${item.year}`), // Showing month and year
    datasets: [
      {
        label: 'Purchases per Month',
        data: purchasesByMonth.map((item) => item.total), // Use "total" instead of "purchases"
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF5722'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF5722']
      }
    ]
  }
})

const monthlyPurchaseDataUser = computed(() => {
  const purchaseCounts = statisticsStore.monthlyPurchaseCountsUser

  return {
    labels: Object.keys(purchaseCounts),
    datasets: [
      {
        label: 'Purchases by Month',
        data: Object.values(purchaseCounts),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#8BC34A',
          '#FF5722',
          '#7F8C8D',
          '#E91E63',
          '#9C27B0',
          '#2196F3',
          '#00BCD4',
          '#4CAF50',
          '#FFC107'
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#8BC34A',
          '#FF5722',
          '#7F8C8D',
          '#E91E63',
          '#9C27B0',
          '#2196F3',
          '#00BCD4',
          '#4CAF50',
          '#FFC107'
        ]
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

const topPlayersChartData = computed(() => {
  const players = topPlayersByTimePlayed.value

  return {
    labels: players.map((player) => player.name),
    datasets: [
      {
        label: 'Total Time Played (hrs)',
        data: players.map((player) => player.timePlayed),
        backgroundColor: '#36A2EB',
        hoverBackgroundColor: '#2A85C5'
      }
    ]
  }
})

const horizontalBarOptions = {
  indexAxis: 'y',
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.raw} hrs`
      }
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Time Played (hrs)'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Players'
      }
    }
  }
}
const totalPlayers = computed(() => {
  if (!statisticsStore.users) return 0
  return statisticsStore.users.length
})

onMounted(() => {
  if (authStore.isAdmin) {
    statisticsStore.fetchTransactionStatistics()
    statisticsStore.fetchGameStatistics()
    //statisticsStore.fetchProfile()
    statisticsStore.getUsers()
  } else {
    statisticsStore.fetchProfile()
    statisticsStore.getMultiPlayerGames()
    statisticsStore.getSinglePlayerGames()
    statisticsStore.getTransactionsGroupedByMonth()
    statisticsStore.getTransactionsUser()
  }
})
</script>

<template>
  <div class="statistics-container max-w-5xl mx-auto py-8 space-y-6">
    <h1 class="text-3xl font-bold mb-10 text-center justify-center mr-8">Statistics</h1>
    <div v-if="loading" class="text-center text-gray-400 mr-8">Loading...</div>
    <div v-else>
      <!-- BUTTONS PARA CADA PÁGINA DE ESTATISTICA -->
      <div class="flex flex-row pb-10 justify-center">
        <div v-if="authStore.isAdmin" class="flex flex-row space-x-6">
          <div class="mb-2">
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
          <div class="mb-2">
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
          <div class="mb-2">
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
        <div class="flex flex-row pb-10 justify-center space-x-6">
          <div class="mb-1">
            <button
              v-if="authStore.isPlayer"
              @click="setSelectedView('myStatistics')"
              :class="{
                'bg-green-500 text-white': selectedView === 'myStatistics',
                'bg-gray-200': selectedView !== 'myStatistics'
              }"
              class="px-6 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
            >
              My Statistics
            </button>
          </div>
          <div class="mb-1">
            <button
              v-if="authStore.isPlayer"
              @click="setSelectedView('myPurchases')"
              :class="{
                'bg-green-500 text-white': selectedView === 'myPurchases',
                'bg-gray-200': selectedView !== 'myPurchases'
              }"
              class="px-6 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
            >
              My Purchase
            </button>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap justify-around">
        <!--ESTATISTICA DOS GAMES PARA O ADMIN-->
        <div v-if="selectedView === 'game'" class="chart-container p-2 w-full">
          <div class="flex flex-col items-center mb-6">
            <div class="text-lg font-semibold text-center">
              Total Games Played: <span class="text-blue-600">{{ totalGames }}</span>
            </div>
            <div class="chart-container p-4 w-1/2 justify-center items-center flex flex-col mb-10">
              <div class="flex flex-row mb-2">
                <button
                  v-for="year in [2023, 2024]"
                  :key="year"
                  @click="changeYear(year)"
                  :class="{
                    'bg-yellow-400 text-white': selectedYear === year,
                    'bg-gray-200': selectedYear !== year
                  }"
                  class="px-4 py-1 mx-2 rounded-md font-semibold mb-2"
                >
                  {{ year }}
                </button>
              </div>
              <Bar :data="chartData" />
            </div>
          </div>

          <div class="flex flex-wrap justify-between space-x-4">
            <div class="chart-container w-1/2">
              <div class="text-center font-semibold text-xl mb-2">
                Total games for Single-Player vs Multi-Player Games
              </div>
              <Bar :data="horizontalBarChartData" :options="horizontalBarChartOptions" />
            </div>
            <div class="chart-container -mt-12 p-4 w-96 h-96">
              <div class="text-center font-semibold text-xl mb-2 pt-8">
                Number of Games for Each Board Size
              </div>
              <Pie :data="pieChartData" />
            </div>
          </div>
        </div>
        <!--ESTATISTICA DAS COMPRAS PARA O ADMIN-->
        <div v-if="selectedView === 'purchase'" class="chart-container p-4">
          <div>
            <div class="mb-6 text-center mr-20">
              <p class="font-semibold text-xl">
                Total Purchases:
                <span class="text-blue-600">{{ playerStats.totalPurchases }}</span>
              </p>
              <p class="font-semibold text-xl">
                Total Value of Purchases:
                <span class="text-blue-600">{{ playerStats.totalPurchaseValue }} €</span>
              </p>
            </div>
            <div class="flex justify-between pt-10 space-x-20">
              <div class="w-6/12 text-center">
                <div class="font-semibold text-xl mb-2">Number of Purchases per Payment Type</div>
                <div class="chart-container p-4">
                  <Doughnut :data="paymentTypesData" />
                </div>
              </div>

              <!-- Number of Purchases per Pack (Bar chart) -->
              <div class="w-6/12 text-center">
                <div class="font-semibold text-xl mb-2">Number of Purchases per Pack</div>
                <div class="chart-container p-4 w-96">
                  <Bar :data="packSalesData" />
                </div>
              </div>

              <div class="w-full text-center">
                <div class="font-semibold text-xl mb-2">Total Purchases by Month</div>
                <div class="chart-container p-4 w-96 h-96 mx-auto">
                  <Pie :data="monthlyPurchaseData" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <!--ESTATISTICA DOS PLAYERS PARA O ADMIN-->
        <div v-if="selectedView === 'players'" class="chart-container p-4 w-1/2">
          <div class="mb-6 text-center">
            <p class="font-semibold text-xl">
              Total Players Registered:
              <span class="text-blue-600">{{ totalPlayers }}</span>
            </p>
          </div>
          <div class="font-semibold text-center text-xl mb-2">
            Total Registered Player Each Month
          </div>
          <div class="font-semibold text-center text-sm text-gray-500 mb-2">
            From the current year
          </div>
          <div class="chart-container w-full mx-auto -mb-10">
            <Bar :data="userRegistrationData" />
          </div>
          <div class="font-semibold text-center text-xl mb-2">Top 10 Players by Time Played</div>
          <div class="chart-container p-2 w-full mx-auto">
            <Bar :data="topPlayersChartData" :options="horizontalBarOptions" />
          </div>
        </div>
        <!--ESTATISTICA DOS GAMES PARA O USER LOGADO-->
        <div v-if="selectedView === 'myStatistics'" class="chart-container p-4 w-full">
          <div class="flex flex-col items-center mb-6">
            <div class="text-lg font-semibold mb-6 text-center">
              Total Games Played: <span class="text-blue-600">{{ totalGamesUser }}</span>
            </div>
            <div class="flex flex-row space-x-28">
              <div class="chart-container p-4 w-1/3 ml-44">
                <div class="text-center font-semibold text-xl mb-2">
                  Number of Games for Each Board Size
                </div>
                <Pie :data="pieChartDataUser" class="mt-8" />
              </div>
              <div class="chart-container p-4 w-1/3">
                <div class="text-center font-semibold text-xl mb-2">
                  Total games for Single-Player vs Multi-Player Games
                </div>

                <Doughnut :data="horizontalBarChartDataUser" />
              </div>
            </div>
            <div class="chart-container p-1 w-1/2 mt-20">
              <button
                v-for="year in [2023, 2024]"
                :key="year"
                @click="changeYear(year)"
                :class="{
                  'bg-yellow-400 text-white': selectedYear === year,
                  'bg-gray-200': selectedYear !== year
                }"
                class="px-4 py-1 mx-2 rounded-md font-semibold"
              >
                {{ year }}
              </button>
              <Bar :data="chartDataUser" />
            </div>
          </div>
        </div>
        <!--ESTATISTICA DAS COMPRAS PARA O USER LOGADO-->
        <div v-if="selectedView === 'myPurchases'" class="chart-container p-4 w-full">
          <div class="mb-6 text-center">
            <p class="font-semibold text-xl">
              Total Purchases:
              <span class="text-blue-600">{{ playerStatsUser.totalPurchasesUser }}</span>
            </p>
            <p class="font-semibold text-xl">
              Total Value of Purchases:
              <span class="text-blue-600">{{ playerStatsUser.totalPurchaseUserValue }} €</span>
            </p>
          </div>
          <div class="flex justify-between space-x-2 pt-10 pl-36">
            <div class="w-6/12 text-center">
              <div class="font-semibold text-xl mb-2">Number of Purchases per Pack</div>
              <div class="chart-container p-4 w-96">
                <Bar :data="packSalesDataUser" />
              </div>
            </div>

            <div class="w-full text-center">
              <div class="font-semibold text-xl mb-2">Total Purchases by Month</div>
              <div class="chart-container p-4 w-96 h-96 mx-auto">
                <Pie :data="monthlyPurchaseDataUser" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

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
