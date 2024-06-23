import { createApp } from 'vue'
import App from './App.vue'
import routes from './routes'
import 'vue-material-design-icons/styles.css';

import './style.css'

import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'



createApp(App)
  .use(routes)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
