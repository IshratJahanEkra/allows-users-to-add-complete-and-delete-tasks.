document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const tasksLeft = document.getElementById('tasksLeft');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize the app
    function init() {
        renderTasks();
        updateTaskCount();
        addEventListeners();
    }
    
    // Add event listeners
    function addEventListeners() {
        // Add task
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });
        
        // Clear completed tasks
        clearCompletedBtn.addEventListener('click', clearCompletedTasks);
        
        // Filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });
    }
    
    // Add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;
        
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        
        tasks.push(newTask);
        saveTasks();
        taskInput.value = '';
        renderTasks();
        updateTaskCount();
    }
    
    // Render tasks based on current filter
    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = currentFilter === 'all' ? 'No tasks yet!' : 
                                      currentFilter === 'active' ? 'No active tasks!' : 'No completed tasks!';
            emptyMessage.classList.add('empty-message');
            taskList.appendChild(emptyMessage);
        } else {
            filteredTasks.forEach(task => {
                const taskItem = createTaskElement(task);
                taskList.appendChild(taskItem);
            });
        }
    }
    
    // Create task element
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;
        
        if (task.completed) {
            li.classList.add('completed');
        }
        
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <button class="delete-btn">Delete</button>
        `;
        
        const checkbox = li.querySelector('.task-checkbox');
        const deleteBtn = li.querySelector('.delete-btn');
        const taskText = li.querySelector('.task-text');
        
        // Toggle completed status
        checkbox.addEventListener('change', function() {
            task.completed = this.checked;
            li.classList.toggle('completed', task.completed);
            saveTasks();
            updateTaskCount();
            
            // If filtering by active/completed, remove the task from view
            if (currentFilter !== 'all') {
                setTimeout(() => {
                    li.style.opacity = '0';
                    setTimeout(() => {
                        li.remove();
                        if (taskList.children.length === 0) {
                            renderTasks();
                        }
                    }, 300);
                }, 300);
            }
        });
        
        // Delete task
        deleteBtn.addEventListener('click', function() {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            li.style.opacity = '0';
            setTimeout(() => {
                li.remove();
                updateTaskCount();
                if (taskList.children.length === 0) {
                    renderTasks();
                }
            }, 300);
        });
        
        // Edit task on double click
        taskText.addEventListener('dblclick', function() {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = task.text;
            input.className = 'edit-input';
            
            li.replaceChild(input, taskText);
            input.focus();
            
            const handleBlur = () => {
                const newText = input.value.trim();
                if (newText && newText !== task.text) {
                    task.text = newText;
                    saveTasks();
                }
                li.replaceChild(taskText, input);
                taskText.textContent = task.text;
            };
            
            input.addEventListener('blur', handleBlur);
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleBlur();
                }
            });
        });
        
        return li;
    }
    
    // Update tasks left counter
    function updateTaskCount() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        tasksLeft.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} left`;
    }
    
    // Clear completed tasks
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateTaskCount();
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Initialize the app
    init();
});