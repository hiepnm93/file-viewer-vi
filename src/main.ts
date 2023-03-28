import { createApp } from 'vue'
import App from './App.vue'

import './assets/main.css'
import FileViewer from '@/package'

createApp(App).use(FileViewer)
  .mount('#app')
