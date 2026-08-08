import { createRouter, createWebHistory } from 'vue-router'
import TodoList from '@/views/TodoList.vue'

const routes = [
  {
    path: '/',
    name: 'TodoList',
    component: TodoList
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
