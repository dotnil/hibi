import { defineStore } from 'pinia'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: JSON.parse(localStorage.getItem('tasks') || '[]')
  }),

  actions: {
    addTask(task) {
      const newTask = {
        ...task,
        id: crypto.randomUUID(),
        history: []
      }
      this.tasks.push(newTask)
      this.save()
    },

    toggleDay(id, date) {
      const task = this.tasks.find(t => t.id === id)
      if (!task) return

      const index = task.history.findIndex(h => h.date === date)
      if (index === -1) task.history.push({ date })
      else task.history.splice(index, 1)

      this.save()
    },

    save() {
      localStorage.setItem('tasks', JSON.stringify(this.tasks))
    }
  }
})
