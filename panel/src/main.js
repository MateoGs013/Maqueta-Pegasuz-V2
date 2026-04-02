import { createApp } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App.vue'
import router from './router/index.js'
import '@components/tokens.css'
import './panel.css'

// Required for component previews
gsap.registerPlugin(ScrollTrigger)

createApp(App).use(router).mount('#app')
