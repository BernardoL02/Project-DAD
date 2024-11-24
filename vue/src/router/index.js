import HomeComponent from '@/components/HomeComponent.vue'
import LaravelTester from '@/components/LaravelTester.vue'
import PlayerHistory from '@/components/PlayerHistory.vue'
import PlayerProfile from '@/components/PlayerProfile.vue'
import SinglePlayer from '@/components/SinglePlayer.vue'
import WebSocketTester from '@/components/WebSocketTester.vue'
import { createRouter, createWebHistory } from 'vue-router'
import SinglePlayerScoreBoard from '@/components/SinglePlayerScoreBoard.vue'
import MultiPlayerScoreBoard from '@/components/MultiPlayerScoreBoard.vue'
import SinglePlayerGameBoard from '@/components/SinglePlayerGameBoard.vue'

import { useAuthStore } from '@/stores/auth'
import MultiPlayer from '@/components/MultiPlayer.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeComponent
    },
    {
      path: '/testers',
      children: [
        {
          path: 'laravel',
          name: 'login',
          component: LaravelTester
        },
        {
          path: 'websocket',
          component: WebSocketTester
        }
      ]
    },
    {
      path: '/singleplayer',
      name: 'single-player',
      component: SinglePlayer
    },
    {
      path: '/singleplayer/history',
      name: 'single-playerHistory',
      component: PlayerHistory
    },
    {
      path: '/multiplayer',
      name: 'multi-player',
      component: MultiPlayer
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
      path: '/game/:size',
      name: 'SinglePlayerGameBoard',
      component: SinglePlayerGameBoard,
      props: true
    }
  ]
})

let handlingFirstRoute = true

router.beforeEach(async (to, from, next) => {
  const storeAuth = useAuthStore()
  if (handlingFirstRoute) {
    handlingFirstRoute = false
    await storeAuth.restoreToken()
  }

  if ((to.name == 'single-playerHistory' || to.name == 'Profile') && !storeAuth.user) {
    next({ name: 'login' })
    return
  }
  next()
})

export default router
