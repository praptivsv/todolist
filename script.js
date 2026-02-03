const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const taskList = document.getElementById("taskList");
const progressBar = document.querySelector(".progress");
const progressText = document.getElementById("progressText");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

tasks.forEach(task => createTask(task));
updateProgress();

function addTask() {
  if (taskInput.value.trim() === "") {
    alert("Enter a task");
    return;
  }

  const task = {
    id: Date.now(),
    text: taskInput.value,
    date: dateInput.value,
    completed: false
  };

  tasks.push(task);
  saveTasks();
  createTask(task);

  taskInput.value = "";
  dateInput.value = "";
}

function createTask(task) {
  const li = document.createElement("li");
  li.draggable = true;
  li.dataset.id = task.id;

  if (task.completed) li.classList.add("completed");

  li.innerHTML = `
    <input type="checkbox" ${task.completed ? "checked" : ""}>
    <div class="task-info">
      <span>${task.text}</span>
      <div class="due-date">${task.date ? "📅 " + task.date : ""}</div>
    </div>
    <div class="actions">
      <i class="fa fa-trash"></i>
    </div>
  `;

  // Complete
  li.querySelector("input").onchange = () => {
    task.completed = !task.completed;
    saveTasks();
    li.classList.toggle("completed");
    updateProgress();
  };

  // Delete
  li.querySelector(".fa-trash").onclick = () => {
    tasks = tasks.filter(t => t.id !== task.id);
    li.remove();
    saveTasks();
    updateProgress();
  };

  // Drag Events
  li.addEventListener("dragstart", () => li.classList.add("dragging"));
  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
    updateOrder();
  });

  taskList.appendChild(li);
}

taskList.addEventListener("dragover", e => {
  e.preventDefault();
  const after = getDragAfterElement(e.clientY);
  const dragging = document.querySelector(".dragging");
  if (after == null) taskList.appendChild(dragging);
  else taskList.insertBefore(dragging, after);
});

function getDragAfterElement(y) {
  return [...taskList.querySelectorAll("li:not(.dragging)")]
    .reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      return offset < 0 && offset > closest.offset
        ? { offset, element: child }
        : closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateOrder() {
  const ids = [...taskList.children].map(li => Number(li.dataset.id));
  tasks.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  saveTasks();
}

function updateProgress() {
  const completed = tasks.filter(t => t.completed).length;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  progressBar.style.width = percent + "%";
  progressText.innerText = `${percent}% Completed`;
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
