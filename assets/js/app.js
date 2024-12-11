const taskStore = {
  get() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
  },
  save(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  },
};

class TaskManager {
  constructor() {
    this.taskList = document.getElementById('taskList');
    this.taskInput = document.getElementById('taskInput');
    this.initEventListeners();
    this.loadTasks();
  }

  initEventListeners() {
    this.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTask();
    });

    document
      .getElementById('exportBtn')
      .addEventListener('click', this.exportTasks.bind(this));
    document
      .getElementById('importInput')
      .addEventListener('change', this.importTasks.bind(this));
  }

  loadTasks() {
    this.taskList.innerHTML = '';
    taskStore.get().forEach((task) => this.renderTask(task));
  }

  addTask() {
    const taskText = this.taskInput.value.trim();
    if (!taskText) return;

    const task = { text: taskText, completed: false };
    this.renderTask(task);
    this.updateStorage();
    this.taskInput.value = '';
  }

  renderTask(task) {
    const li = document.createElement('li');
    li.classList.toggle('completed', task.completed);

    const taskSpan = document.createElement('span');
    taskSpan.textContent = task.text;

    const actions = this.createTaskActions(li, task, taskSpan);
    li.append(taskSpan, ...actions);

    this.taskList.appendChild(li);
  }

  createTaskActions(li, task, taskSpan) {
    const createAction = (text, handler) => {
      const button = document.createElement('button');
      button.textContent = text;
      button.addEventListener('click', handler);
      return button;
    };

    const completeBtn = createAction(
      task.completed ? 'Uncheck' : 'Check',
      () => {
        task.completed = !task.completed;
        li.classList.toggle('completed');
        completeBtn.textContent = task.completed ? 'Uncheck' : 'Check';
        this.updateStorage();
      }
    );

    const editBtn = createAction('Edit', () => {
      const newText = prompt('Edit task:', task.text);
      if (newText && newText.trim()) {
        task.text = newText.trim();
        taskSpan.textContent = task.text;
        this.updateStorage();
      }
    });

    const deleteBtn = createAction('Delete', () => {
      li.remove();
      this.updateStorage();
    });

    return [completeBtn, editBtn, deleteBtn];
  }

  updateStorage() {
    const tasks = Array.from(this.taskList.children).map((li) => ({
      text: li.querySelector('span').textContent,
      completed: li.classList.contains('completed'),
    }));
    taskStore.save(tasks);
  }

  exportTasks() {
    const tasks = JSON.stringify(taskStore.get(), null, 2);
    const blob = new Blob([tasks], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `tasks-${
      new Date().toISOString().split('T')[0]
    }.json`;
    downloadLink.click();
    URL.revokeObjectURL(url);
  }

  importTasks(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const tasks = JSON.parse(e.target.result);
        taskStore.save(tasks);
        this.loadTasks();
      } catch {
        alert('Invalid file format. Please upload a valid tasks JSON file.');
      }
    };
    reader.readAsText(file);
  }
}

document.addEventListener('DOMContentLoaded', () => new TaskManager());
