import { createApp } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App.vue'
import '@components/tokens.css'
import './preview.css'

gsap.registerPlugin(ScrollTrigger)

createApp(App).mount('#app')
