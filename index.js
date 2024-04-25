// TASK: import helper functions from utils
// TASK: import initialData
import { initialData } from "./initialData.js";
import { createNewTask, deleteTask, getTasks, putTask } from "./utils/taskFunctions.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true');
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById("header-board-name"),
  columnDivs: document.querySelectorAll(".column-div"),
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  filterDiv: document.getElementById("filterDiv"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("switch"),
  createNewTaskBtn: document.getElementById("create-task-btn"),
  modalWindow: document.getElementById("new-task-modal-window")
};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  initializeData();
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    if(btn.textContent === boardName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status=${task.status}]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  document.addEventListener('mousedown', (event) => {
    if (!elements.modalWindow.contains(event.target)) {
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    }
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 
  const data = new FormData(event.target);
  //Assign user input to the task object
    const task = {
      "title": data.get("title"),
      "description": data.get("description"),
      "status": data.get("status")
    };
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}

// Toggle sidebar visibility
function toggleSidebar(show) {
  const sideBar = document.querySelector('.side-bar');
  const hideSidebarBtnIcon = document.querySelector('#show-side-bar-btn');
  
  if (show) {
    sideBar.style.display = 'block';
    hideSidebarBtnIcon.style.display = 'none'; // Hide the icon when sidebar is shown
    localStorage.setItem('showSideBar', 'true');
  } else {
    sideBar.style.display = 'none';
    hideSidebarBtnIcon.style.display = 'block'; // Show the icon when sidebar is hidden
    localStorage.setItem('showSideBar', 'false');
  }
}


function toggleTheme() {
  const body = document.body;
  const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';

  // Toggle between light and dark themes
  if (currentTheme === 'light') {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    localStorage.setItem('dark-theme', 'enabled');
  } else {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    localStorage.setItem('light-theme', 'enabled');
  }
}


function openEditTaskModal(task) {
  // Set task details in modal inputs
  const titleInput = document.getElementById('edit-task-title-input');
  const descriptionInput = document.getElementById('edit-task-desc-input');
  const statusInput = document.getElementById('edit-select-status');

  titleInput.value = task.title;
  descriptionInput.value = task.description;
  statusInput.value = task.status;

  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  const cancelTaskBtn = document.getElementById('cancel-edit-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');

  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.addEventListener('click', () => {
    saveTaskChanges(task.id);
  });

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener('click', () => {
    const taskId = task.id; // Assuming task.id holds the ID of the task to be deleted
    deleteTask(taskId); // Call the deleteTask helper function with the task ID
    
    // Once task is deleted, close the modal
    toggleModal(false);
  });


  toggleModal(true); // Show the edit task modal
}


function saveTaskChanges(taskId) {
  // Get new user inputs
  const titleInput = document.getElementById('edit-task-title-input');
  const descriptionInput = document.getElementById('edit-task-desc-input');
  const statusInput = document.getElementById('edit-select-status');

  // Create an object with the updated task details
  const updatedTask = {
    id: taskId,
    title: titleInput.value,
    description: descriptionInput.value,
    status: statusInput.value
  };

  // Update task using a helper function
  putTask(updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false);
  refreshTasksUI();
}


/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
