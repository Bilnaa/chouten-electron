import { createApp } from 'vue'
import App from './App.vue'
import routes from './routes'
import 'vue-material-design-icons/styles.css';
import store from './store/index'
import { ObserveVisibility } from 'vue-observe-visibility'

import './style.css'

import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'



createApp(App)
  .use(routes)
  .use(store)
  .directive('observe-visibility', ObserveVisibility)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
