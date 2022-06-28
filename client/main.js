import './style.css'

import Alpine from 'alpinejs'
import MovieApp from './app'
 
window.Alpine = Alpine
Alpine.data('MovieApp', MovieApp)
Alpine.start()

// document.querySelector('#app').innerHTML = `
//   <h1>Hello Vite!</h1>
//   <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
// `
