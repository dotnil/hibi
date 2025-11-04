import { createRouter, createWebHistory } from 'vue-router'
import TaskListView from '@/views/TaskListView.vue'

const routes = [
  { path: '/', component: TaskListView }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
