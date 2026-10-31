/**
 * CI/CD Demo - To-Do List Application
 * Matches the Visual Pitch Deck Design + Confetti & Build Details Drawer
 */

// Core Data Operations (Pure Functions for testing and reusability)
const TodoLogic = {
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

  addTask(tasks, text) {
    const newTask = this.createTask(text);
    return [newTask, ...tasks];
  },

  toggleTask(tasks, id) {
    return tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
  },

  deleteTask(tasks, id) {
    return tasks.filter(task => task.id !== id);
  },

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

  getStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    return { total, active, completed };
  }
};

// Browser DOM Controller & Interactive Features
if (typeof window !== 'undefined') {
  const STORAGE_KEY = 'todo_cicd_demo_tasks_v2';

  const DEFAULT_TASKS = [
    { id: 'task_default_1', text: 'Learn CI/CD with GitHub Actions', completed: true },
    { id: 'task_default_2', text: 'Build a To-Do List Project', completed: false },
    { id: 'task_default_3', text: 'Deploy Automatically', completed: false }
  ];

  let tasks = [];
  let currentFilter = 'all';

  // DOM Elements
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const taskStats = document.getElementById('task-stats');
  const filterPills = document.querySelectorAll('.filter-pill');
  const celebrationBanner = document.getElementById('celebration-banner');
  const confettiCanvas = document.getElementById('confetti-canvas');

  // Modal Elements
  const buildModal = document.getElementById('build-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const deploymentNoticeCard = document.getElementById('deployment-notice-card');
  const openInfoBadge = document.getElementById('open-info-badge');

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

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage', e);
    }
  }

  function render() {
    const filtered = TodoLogic.filterTasks(tasks, currentFilter);
    todoList.innerHTML = '';

    filtered.forEach(task => {
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

      const leftSection = li.querySelector('.todo-left');
      const toggle = () => {
        tasks = TodoLogic.toggleTask(tasks, task.id);
        saveTasks();
        render();
        checkCelebration();
      };

      leftSection.addEventListener('click', toggle);
      leftSection.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });

      const deleteBtn = li.querySelector('.btn-delete');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        tasks = TodoLogic.deleteTask(tasks, task.id);
        saveTasks();
        render();
        checkCelebration();
      });

      todoList.appendChild(li);
    });

    // Update stats text
    const stats = TodoLogic.getStats(tasks);
    if (taskStats) {
      taskStats.textContent = `${stats.active} pending`;
    }

    // Toggle Celebration Banner
    if (celebrationBanner) {
      if (tasks.length > 0 && stats.active === 0) {
        celebrationBanner.style.display = 'flex';
      } else {
        celebrationBanner.style.display = 'none';
      }
    }
  }

  function checkCelebration() {
    const stats = TodoLogic.getStats(tasks);
    if (tasks.length > 0 && stats.active === 0) {
      fireConfetti();
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Confetti Animation (Zero-dependency Canvas particle system)
  function fireConfetti() {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const colors = ['#2563eb', '#16a34a', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
    const particles = [];
    const count = 80;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        w: Math.random() * 8 + 4,
        h: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 16,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        gravity: 0.35,
        opacity: 1
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.vr;
        p.opacity -= 0.012;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });

      frame++;
      if (alive && frame < 120) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }
    requestAnimationFrame(animate);
  }

  // Form submission
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

  // Filter Buttons
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      render();
    });
  });

  // Modal Open/Close handlers
  function openModal() {
    if (buildModal) buildModal.classList.add('open');
  }

  function closeModal() {
    if (buildModal) buildModal.classList.remove('open');
  }

  if (deploymentNoticeCard) deploymentNoticeCard.addEventListener('click', openModal);
  if (openInfoBadge) openInfoBadge.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  if (buildModal) {
    buildModal.addEventListener('click', (e) => {
      if (e.target === buildModal) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Initial load
  loadTasks();
  render();
}

// Export for Node.js test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TodoLogic;
}
