const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const TodoLogic = require('../app.js');

describe('To-Do List Functional Logic Tests', () => {
  test('Verify that tasks can be created with valid properties', () => {
    const task = TodoLogic.createTask('Learn GitHub Actions');
    assert.equal(typeof task.id, 'string');
    assert.equal(task.text, 'Learn GitHub Actions');
    assert.equal(task.completed, false);
    assert.ok(task.createdAt);
  });

  test('Verify that empty or whitespace-only tasks cannot be added', () => {
    assert.throws(() => TodoLogic.createTask(''), /cannot be empty/);
    assert.throws(() => TodoLogic.createTask('   '), /cannot be empty/);
    assert.throws(() => TodoLogic.createTask(null), /cannot be empty/);
  });

  test('Verify that tasks can be added to the task list', () => {
    let tasks = [];
    tasks = TodoLogic.addTask(tasks, 'First task');
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].text, 'First task');

    tasks = TodoLogic.addTask(tasks, 'Second task');
    assert.equal(tasks.length, 2);
    assert.equal(tasks[0].text, 'Second task'); // Newest task first
  });

  test('Verify that tasks can be marked as completed and toggled back', () => {
    let tasks = [];
    tasks = TodoLogic.addTask(tasks, 'Task to complete');
    const taskId = tasks[0].id;

    // Toggle to completed
    tasks = TodoLogic.toggleTask(tasks, taskId);
    assert.equal(tasks[0].completed, true);

    // Toggle back to active
    tasks = TodoLogic.toggleTask(tasks, taskId);
    assert.equal(tasks[0].completed, false);
  });

  test('Verify that tasks can be deleted', () => {
    let tasks = [];
    tasks = TodoLogic.addTask(tasks, 'Task 1');
    tasks = TodoLogic.addTask(tasks, 'Task 2');
    const idToDelete = tasks[0].id;

    tasks = TodoLogic.deleteTask(tasks, idToDelete);
    assert.equal(tasks.length, 1);
    assert.equal(tasks.find(t => t.id === idToDelete), undefined);
  });

  test('Verify task filtering (all, active, completed)', () => {
    let tasks = [];
    tasks = TodoLogic.addTask(tasks, 'Task 1');
    tasks = TodoLogic.addTask(tasks, 'Task 2');
    tasks = TodoLogic.addTask(tasks, 'Task 3');
    
    // Complete Task 2
    tasks = TodoLogic.toggleTask(tasks, tasks[1].id);

    const all = TodoLogic.filterTasks(tasks, 'all');
    assert.equal(all.length, 3);

    const active = TodoLogic.filterTasks(tasks, 'active');
    assert.equal(active.length, 2);

    const completed = TodoLogic.filterTasks(tasks, 'completed');
    assert.equal(completed.length, 1);
  });

  test('Verify task statistics calculations', () => {
    let tasks = [];
    tasks = TodoLogic.addTask(tasks, 'Task A');
    tasks = TodoLogic.addTask(tasks, 'Task B');
    tasks = TodoLogic.toggleTask(tasks, tasks[0].id);

    const stats = TodoLogic.getStats(tasks);
    assert.deepEqual(stats, { total: 2, active: 1, completed: 1 });
  });
});

describe('Web Application Asset & Structure Integrity Tests', () => {
  const rootDir = path.resolve(__dirname, '..');

  test('Verify all essential web assets exist', () => {
    assert.ok(fs.existsSync(path.join(rootDir, 'index.html')), 'index.html must exist');
    assert.ok(fs.existsSync(path.join(rootDir, 'style.css')), 'style.css must exist');
    assert.ok(fs.existsSync(path.join(rootDir, 'app.js')), 'app.js must exist');
  });

  test('Verify HTML contains required functional elements per PRD', () => {
    const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
    assert.ok(html.includes('id="todo-form"'), 'HTML must have #todo-form');
    assert.ok(html.includes('id="todo-input"'), 'HTML must have #todo-input');
    assert.ok(html.includes('id="todo-list"'), 'HTML must have #todo-list');
    assert.ok(html.includes('id="add-btn"'), 'HTML must have #add-btn');
    assert.ok(html.includes('id="task-stats"'), 'HTML must have #task-stats');
    assert.ok(html.includes('style.css'), 'HTML must link style.css');
    assert.ok(html.includes('app.js'), 'HTML must include app.js');
  });
});
