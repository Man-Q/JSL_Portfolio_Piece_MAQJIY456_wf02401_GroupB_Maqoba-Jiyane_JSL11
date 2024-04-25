// TASK: import helper functions from utils
// TASK: import initialData


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
import {getTasks,createNewTask,patchTask,deleteTask,} from "./utils/taskFunctions.js";

import { initialData } from "./initialData.js";

function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById("header-board-name"),
  columnDivs: document.getElementsByClassName("column-div"),
  editTaskModalWindow: document.getElementsByClassName(
    "edit-task-modal-window"
  )[0],
  filterDiv: document.getElementById("filterDiv"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("switch"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  newTaskModalWindow: document.getElementById("new-task-modal-window"),
  sideLogoImage: document.getElementById("logo"),
};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  initializeData();
  const tasks = getTasks();
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = "";
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board;
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();
  const filteredTasks = tasks.filter((task) => task.board === boardName);

  Array.from(elements.columnDivs).forEach((column) => {
    const status = column.getAttribute("data-status");
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks
      .filter((task) => task.status === status)
      .forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute("data-task-id", task.id);

        taskElement.addEventListener("click", () => {
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
  document.querySelectorAll(".board-btn").forEach((btn) => {
    if (btn.textContent === boardName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTaskToUI(task) {
  const column = document.querySelector(
    `.column-div[data-status="${task.status}"]`
  );
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title;
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild(taskElement);
}

function setupEventListeners() {
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.addEventListener("click", () =>
    toggleModal(false, elements.editTaskModal)
  );

  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    newToggleModal(false);
    elements.filterDiv.style.display = "none";
  });

  const createTaskButton = document.getElementById("create-task-btn");
  createTaskButton.addEventListener("click", () => {
    newToggleModal(false);
  });

  document.addEventListener("mousedown", (event) => {
    if (
      !elements.editTaskModalWindow.contains(event.target) &&
      !elements.newTaskModalWindow.contains(event.target)
    ) {
      toggleModal(false);
      newToggleModal(false);
      elements.filterDiv.style.display = "none";
    }
  });

  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(true));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(false));

  elements.themeSwitch.addEventListener("change", toggleTheme);

  elements.createNewTaskBtn.addEventListener("click", () => {
    newToggleModal(true);
    elements.filterDiv.style.display = "block";
  });

  elements.newTaskModalWindow.addEventListener("submit", (event) => {
    addTask(event);
  });
}

function toggleModal(show, modal = elements.editTaskModalWindow) {
  modal.style.display = show ? "block" : "none";
}

function newToggleModal(show, modal = elements.newTaskModalWindow) {
  modal.style.display = show ? "block" : "none";
}

function addTask(event) {
  event.preventDefault();

  const titleInput = document.getElementById("title-input").value;
  const descInput = document.getElementById("desc-input").value;
  const statusSelect = document.getElementById("select-status").value;

  const task = {
    title: titleInput,
    description: descInput,
    status: statusSelect,
    board: activeBoard,
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = "none";
    event.target.reset();
    refreshTasksUI();
  }
}

function toggleSidebar(show) {
  const sidebar = document.querySelector(".side-bar");

  if (!show) {
    sidebar.classList.add("show-sidebar");
    elements.hideSideBarBtn.style.display = "block";
    elements.showSideBarBtn.style.display = "none";
  } else {
    sidebar.classList.remove("show-sidebar");
    elements.hideSideBarBtn.style.display = "none";
    elements.showSideBarBtn.style.display = "block";
  }

  localStorage.setItem("showSideBar", show.toString());
}

function toggleTheme() {
  const body = document.body;

  const isLightTheme = body.classList.contains("light-theme");

  if (isLightTheme) {
    body.classList.remove("light-theme");
    localStorage.setItem("theme", "dark");
  } else {
    body.classList.add("light-theme");
    localStorage.setItem("theme", "light");
  }
}

function openEditTaskModal(task) {
  updateTaskDetailsInModal(task);

  const saveChangesButton = document.getElementById("save-task-changes-btn");
  const deleteTaskButton = document.getElementById("delete-task-btn");

  function handleSavingTheChanges() {
    saveTaskChanges(task.id);
    saveChangesButton.removeEventListener("click", handleSavingTheChanges);
  }

  saveChangesButton.addEventListener("click", handleSavingTheChanges);

  deleteTaskButton.addEventListener("click", function () {
    deleteTask(task.id);
    const existingTaskElement = document.querySelector(
      `.task-div[data-task-id="${task.id}"]`
    );
    existingTaskElement.remove();
    toggleModal(false);
  });

  toggleModal(true);
}

function updateTaskDetailsInModal(task) {
  const titleInput = document.getElementById("edit-task-title-input");
  const descriptionInput = document.getElementById("edit-task-desc-input");
  const statusSelect = document.getElementById("edit-select-status");

  titleInput.value = task.title;
  descriptionInput.value = task.description;
  statusSelect.value = task.status;
}

function saveTaskChanges(taskId) {
  const statusInput = document.getElementById("edit-select-status").value;
  const titleInput = document.getElementById("edit-task-title-input").value;
  const descriptionInput = document.getElementById(
    "edit-task-desc-input"
  ).value;
  const tasks = getTasks();
  const taskToUpdate = tasks.find((task) => task.id === taskId);

  taskToUpdate.status = statusInput;
  taskToUpdate.title = titleInput;
  taskToUpdate.description = descriptionInput;

  patchTask(taskId, taskToUpdate);
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

document.addEventListener("DOMContentLoaded", function () {
  init();
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem("theme");
  if (isLightTheme === "light") {
    document.body.classList.add("light-theme");
  }

  const logo = localStorage.getItem("logo");
  if (logo) {
    elements.sideLogoImage.src = logo;
  }

  fetchAndDisplayBoardsAndTasks();
}
