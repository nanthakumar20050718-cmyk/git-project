/**
 * CI/CD Demo - To-Do List Application
 * Matches the Visual Pitch Deck Design & Functional Requirements
 */

// Core Data Operations (Pure Functions for testing and reusability)
const TodoLogic = {
  /**
   * Creates a new todo item object
   * @param {string} text - Title of the task
   * @param {boolean} completed - Initial completion state
   * @returns {Object} New task object
   */
  createTask(text, completed = false) {
    const trimmed = (text || '').trim();
    if (!trimmed) {
      throw new Error('Task text cannot be empty');
    }
    return {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      text: trimmed,
      completed: Boolean(completed),
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
  const STORAGE_KEY = 'todo_cicd_demo_tasks_v2';

  // Default tasks matching the screenshot sample
  const DEFAULT_TASKS = [
    { id: 'task_default_1', text: 'Learn CI/CD with GitHub Actions', completed: true },
    { id: 'task_default_2', text: 'Build a To-Do List Project', completed: false },
    { id: 'task_default_3', text: 'Deploy Automatically', completed: false }
  ];

  let tasks = [];

  // DOM Elements
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const taskStats = document.getElementById('task-stats');

  // Load from LocalStorage
  function loadTasks() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        tasks = JSON.parse(saved);
      } else {
        tasks = DEFAULT_TASKS;
        saveTasks();
      }
    } catch (e) {
      console.error('Failed to load tasks from localStorage', e);
      tasks = DEFAULT_TASKS;
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

  // Render UI matching the screenshot
  function render() {
    todoList.innerHTML = '';

    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `todo-item ${task.completed ? 'completed' : ''}`;
      li.dataset.id = task.id;

      li.innerHTML = `
        <div class="todo-left" role="button" tabindex="0" aria-label="Toggle task ${escapeHtml(task.text)}">
          <div class="custom-checkbox ${task.completed ? 'checked' : ''}" aria-hidden="true"></div>
          <span class="todo-title">${escapeHtml(task.text)}</span>
        </div>
        <div class="todo-right">
          <span class="status-badge ${task.completed ? 'completed' : 'pending'}">
            ${task.completed ? 'Completed' : 'Pending'}
          </span>
          <button type="button" class="btn-delete" title="Delete task" aria-label="Delete task ${escapeHtml(task.text)}">
            🗑
          </button>
        </div>
      `;

      // Event: Toggle on clicking the left portion
      const leftSection = li.querySelector('.todo-left');
      const toggle = () => {
        tasks = TodoLogic.toggleTask(tasks, task.id);
        saveTasks();
        render();
      };

      leftSection.addEventListener('click', toggle);
      leftSection.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });

      // Event: Delete on clicking the trash icon
      const deleteBtn = li.querySelector('.btn-delete');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        tasks = TodoLogic.deleteTask(tasks, task.id);
        saveTasks();
        render();
      });

      todoList.appendChild(li);
    });

    // Update accessible stats
    if (taskStats) {
      const stats = TodoLogic.getStats(tasks);
      taskStats.textContent = `${stats.active} task${stats.active === 1 ? '' : 's'} remaining`;
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Form submit handler
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

  // Initial load
  loadTasks();
  render();
}

// Export for Node.js test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TodoLogic;
}
