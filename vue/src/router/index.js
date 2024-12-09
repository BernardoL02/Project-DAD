import HomeComponent from '@/components/HomeComponent.vue'
import PlayerHistory from '@/components/SinglePlayer/PlayerHistory.vue'
import PlayerProfile from '@/components/Profile/PlayerProfile.vue'
import SinglePlayer from '@/components/SinglePlayer/SinglePlayer.vue'
import WebSocketTester from '@/components/WebSocketTester.vue'
import { createRouter, createWebHistory } from 'vue-router'
import SinglePlayerScoreBoard from '@/components/ScoreBoard/SinglePlayerScoreBoard.vue'
import MultiPlayerScoreBoard from '@/components/ScoreBoard/MultiPlayerScoreBoard.vue'
import SinglePlayerGameBoard from '@/components/SinglePlayer/SinglePlayerGameBoard.vue'
import UpdateProfile from '@/components/Profile/UpdateProfile.vue'
import { useAuthStore } from '@/stores/auth'
import MultiPlayer from '@/components/Multiplayer/MultiPlayer.vue'
import UserLogin from '@/components/Auth/UserLogin.vue'
import UserRegistration from '@/components/Auth/UserRegistration.vue'
import Store from '@/components/Store/Store.vue'
import PlayerTransactionHistory from '@/components/Store/PlayerTransactionHistory.vue'
import PlayerHistoryMultiPlayer from '@/components/Multiplayer/PlayerHistoryMultiPlayer.vue'
import ChangePassword from '@/components/Profile/ChangePassword.vue'
import ManageUsers from '@/components/Administration/ManageUsers.vue'
import AdminTransactions from '@/components/Administration/AdminTransactions.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeComponent
    },
    {
      path: '/websocket',
      name: 'websocket',
      component: WebSocketTester
    },
    {
      path: '/singleplayer',
      name: 'single-player',
      component: SinglePlayer
    },
    {
      path: '/singleplayer/history',
      name: 'singlePlayerHistory',
      component: PlayerHistory
    },
    {
      path: '/multiplayer',
      name: 'multi-player',
      component: MultiPlayer
    },
    {
      path: '/multiplayer/history',
      name: 'multiPlayerHistory',
      component: PlayerHistoryMultiPlayer
    },
    {
      path: '/scoreBoard/singlePlayer',
      name: 'singlePlayerScore',
      component: SinglePlayerScoreBoard
    },
    {
      path: '/scoreBoard/multiPlayer',
      name: 'multiPlayerScore',
      component: MultiPlayerScoreBoard
    },
    {
      path: '/playerProfile',
      name: 'Profile',
      component: PlayerProfile
    },
    {
      path: '/game/:size/:gameId',
      name: 'SinglePlayerGameBoard',
      component: SinglePlayerGameBoard,
      props: (route) => ({ size: route.params.size, gameId: Number(route.params.gameId) })
    },
    {
      path: '/updateProfile',
      name: 'ProfileUpdate',
      component: UpdateProfile
    },
    {
      path: '/changePassword',
      name: 'changePassword',
      component: ChangePassword
    },
    {
      path: '/login',
      name: 'login',
      component: UserLogin
    },
    {
      path: '/registration',
      name: 'registration',
      component: UserRegistration
    },
    {
      path: '/store',
      name: 'store',
      component: Store
    },
    {
      path: '/PlayerTransactionHistory',
      name: 'PlayerTransactionHistory',
      component: PlayerTransactionHistory
    },
    {
      path: '/ManageUsers',
      name: 'ManageUsers',
      component: ManageUsers
    },
    {
      path: '/adminTransactions',
      name: 'adminTransactions',
      component: AdminTransactions
    }
  ]
})

let handlingFirstRoute = true

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (handlingFirstRoute) {
    handlingFirstRoute = false

    await authStore.restoreToken()

    if (authStore.user) {
      await authStore.fetchProfile()
      await authStore.getNotifications()
    }
  }

  if ((to.name == 'singlePlayerHistory' || to.name == 'Profile') && !authStore.user) {
    next({ name: 'login' })
    return
  }
  next()
})

export default router
