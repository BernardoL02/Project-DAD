import HomeComponent from '@/components/HomeComponent.vue'
import LaravelTester from '@/components/LaravelTester.vue'
import PlayerHistory from '@/components/PlayerHistory.vue'
import PlayerProfile from '@/components/PlayerProfile.vue'
import SinglePlayer from '@/components/SinglePlayer.vue'
import WebSocketTester from '@/components/WebSocketTester.vue'
import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

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
      name: 'single-player/history',
      component: PlayerHistory
    },
    {
      path: '/playerProfile',
      name: 'Profile',
      component: PlayerProfile
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

  // routes "updateTask" and "updateProject" are only accessible when user is logged in
  if ((to.name == 'updateTask' || to.name == 'updateProject') && !storeAuth.user) {
    next({ name: 'login' })
    return
  }
  // all other routes are accessible to everyone, including anonymous users
  next()
})

export default router
