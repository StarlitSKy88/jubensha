import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import directives from './directives'
import routes from './router'

// 创建应用实例
const app = createApp(App)

// 创建 Pinia 实例
const pinia = createPinia()

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 注册插件
app.use(pinia)
app.use(router)
app.use(directives)

// 挂载应用
app.mount('#app') 