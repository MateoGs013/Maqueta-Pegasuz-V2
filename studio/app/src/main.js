import { createApp } from 'vue'
import App from './App.vue'
import './styles.css'
import { connectWs } from './store.js'

connectWs()
createApp(App).mount('#app')
