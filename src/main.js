import { createApp } from 'vue'
import App from './App.vue'

import './locales'
import './plugins'
import Components from './components'

const app = createApp(App)

for (const [key, value] of Object.entries(Components)) {
  app.component(key, value)
}

app.mount('#app')
