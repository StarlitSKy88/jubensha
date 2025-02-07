import { App } from 'vue'
import { vClickOutside } from './click-outside'

export default {
  install(app: App) {
    app.directive('click-outside', vClickOutside)
  }
} 