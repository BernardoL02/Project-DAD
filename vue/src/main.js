import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import { io } from 'socket.io-client'

import '@/assets/base.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.use(createPinia())
const apiDomain = import.meta.env.VITE_API_DOMAIN
const wsConnection = import.meta.env.VITE_WS_CONNECTION

axios.defaults.baseURL = `http://${apiDomain}/api`
axios.defaults.baseURLPhoto = `http://${apiDomain}`

app.provide('socket', io(wsConnection))

app.provide('serverBaseUrl', apiDomain)

app.mount('#app')
