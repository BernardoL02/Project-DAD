import HomeComponent from '@/components/HomeComponent.vue'
import PlayerHistory from '@/components/PlayerHistory.vue'
import PlayerProfile from '@/components/PlayerProfile.vue'
import SinglePlayer from '@/components/SinglePlayer.vue'
import WebSocketTester from '@/components/WebSocketTester.vue'
import { createRouter, createWebHistory } from 'vue-router'
import SinglePlayerScoreBoard from '@/components/SinglePlayerScoreBoard.vue'
import MultiPlayerScoreBoard from '@/components/MultiPlayerScoreBoard.vue'
import SinglePlayerGameBoard from '@/components/SinglePlayerGameBoard.vue'
import UpdateProfile from '@/components/UpdateProfile.vue'
import { useAuthStore } from '@/stores/auth'
import MultiPlayer from '@/components/MultiPlayer.vue'
import UserLogin from '@/components/UserLogin.vue'
import UserRegistration from '@/components/UserRegistration.vue'
import Store from '@/components/Store.vue'
import PlayerTransactionHistory from '@/components/PlayerTransactionHistory.vue'
import PlayerHistoryMultiPlayer from '@/components/PlayerHistoryMultiPlayer.vue'
import ChangePassword from '@/components/ChangePassword.vue'

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
    }
  ]
})

let handlingFirstRoute = true

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (handlingFirstRoute) {
    handlingFirstRoute = false

    if (authStore.user) {
      await authStore.restoreToken()
      await authStore.fetchProfile()
    }
  }

  if ((to.name == 'singlePlayerHistory' || to.name == 'Profile') && !authStore.user) {
    next({ name: 'login' })
    return
  }
  next()
})

export default router
