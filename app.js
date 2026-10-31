/**
 * Simple To-Do List Application
 * Core Logic & DOM Bindings
 */

// Core Data Operations (Pure Functions for testing and reusability)
const TodoLogic = {
  /**
   * Creates a new todo item object
   * @param {string} text - Title of the task
   * @returns {Object} New task object
   */
  createTask(text) {
    const trimmed = (text || '').trim();
    if (!trimmed) {
      throw new Error('Task text cannot be empty');
    }
    return {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      text: trimmed,
      completed: false,
      createdAt: new Date().toISOString()
    };
  },

  /**
   * Adds a task to the task list
   * @param {Array} tasks - Current list of tasks
   * @param {string} text - Text of the task to add
   * @returns {Array} Updated list of tasks
   */
  addTask(tasks, text) {
    const newTask = this.createTask(text);
    return [newTask, ...tasks];
  },

  /**
   * Toggles completion status of a task by ID
   * @param {Array} tasks - Current list of tasks
   * @param {string} id - Task ID to toggle
   * @returns {Array} Updated list of tasks
   */
  toggleTask(tasks, id) {
    return tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
  },

  /**
   * Deletes a task by ID
   * @param {Array} tasks - Current list of tasks
   * @param {string} id - Task ID to delete
   * @returns {Array} Updated list of tasks
   */
  deleteTask(tasks, id) {
    return tasks.filter(task => task.id !== id);
  },

  /**
   * Filters tasks based on criteria ('all', 'active', 'completed')
   * @param {Array} tasks - Current list of tasks
   * @param {string} filter - Filter type
   * @returns {Array} Filtered list of tasks
   */
  filterTasks(tasks, filter = 'all') {
    switch (filter) {
      case 'active':
        return tasks.filter(task => !task.completed);
      case 'completed':
        return tasks.filter(task => task.completed);
      case 'all':
      default:
        return tasks;
    }
  },

  /**
   * Calculates statistics for tasks
   * @param {Array} tasks 
   * @returns {Object} { total, active, completed }
   */
  getStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    return { total, active, completed };
  }
};

// Browser DOM Controller
if (typeof window !== 'undefined') {
  const STORAGE_KEY = 'todo_app_tasks_v1';

  let tasks = [];
  let currentFilter = 'all';

  // DOM Elements
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const emptyState = document.getElementById('empty-state');
  const taskStats = document.getElementById('task-stats');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');

  // Load from LocalStorage
  function loadTasks() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      tasks = saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load tasks from localStorage', e);
      tasks = [];
    }
  }

  // Save to LocalStorage
  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage', e);
    }
  }

  // Render UI
  function render() {
    const filtered = TodoLogic.filterTasks(tasks, currentFilter);
    todoList.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.classList.add('visible');
    } else {
      emptyState.classList.remove('visible');
    }

    filtered.forEach(task => {
      const li = document.createElement('li');
      li.className = `todo-item ${task.completed ? 'completed' : ''}`;
      li.dataset.id = task.id;

      li.innerHTML = `
        <label class="todo-content" for="check-${task.id}">
          <input 
            type="checkbox" 
            id="check-${task.id}" 
            class="todo-checkbox" 
            ${task.completed ? 'checked' : ''}
            aria-label="Mark task as ${task.completed ? 'incomplete' : 'completed'}"
          >
          <span class="todo-text">${escapeHtml(task.text)}</span>
        </label>
        <button type="button" class="delete-btn" aria-label="Delete task ${escapeHtml(task.text)}">
          ✕
        </button>
      `;

      // Event: Toggle
      const checkbox = li.querySelector('.todo-checkbox');
      checkbox.addEventListener('change', () => {
        tasks = TodoLogic.toggleTask(tasks, task.id);
        saveTasks();
        render();
      });

      // Event: Delete
      const deleteBtn = li.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => {
        tasks = TodoLogic.deleteTask(tasks, task.id);
        saveTasks();
        render();
      });

      todoList.appendChild(li);
    });

    // Update Stats
    const stats = TodoLogic.getStats(tasks);
    taskStats.textContent = `${stats.active} task${stats.active === 1 ? '' : 's'} remaining`;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize Event Listeners
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value;
    try {
      tasks = TodoLogic.addTask(tasks, text);
      todoInput.value = '';
      saveTasks();
      render();
    } catch (err) {
      alert(err.message);
    }
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  clearCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    render();
  });

  // Initial load
  loadTasks();
  render();
}

// Export for Node.js test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TodoLogic;
}
