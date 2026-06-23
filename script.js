const taskInput = document.getElementById("taskInput");

const addBtn = document.getElementById("addBtn");

const taskList = document.getElementById("taskList");

const count = document.getElementById("count");

// Local Storage se purane tasks load karo

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Tasks save karne wala function

function saveTasks() {

localStorage.setItem("tasks", JSON.stringify(tasks));

}

// Add button click hone par task add karo

addBtn.onclick = function () {

addTask();

};

// Task add karne wala function

function addTask() {

let text = taskInput.value.trim();

if (text == "") {

alert("Enter a task");

return;

}

let task = {

text: text,

completed: false

};

tasks.push(task);

saveTasks();

taskInput.value = "";

displayTasks();

}

// Saare tasks screen par show karo

function displayTasks() {

taskList.innerHTML = "";

for (let i = 0; i < tasks.length; i++) {

let task = tasks[i];

let taskDiv = document.createElement("div");

taskDiv.className = "task";

let checked = "";

let completedClass = "";

if (task.completed == true) {

checked = "checked";

completedClass = "completed";

}

taskDiv.innerHTML = `
<div class="left">

<input type="checkbox" ${checked}
onchange="toggleTask(${i})">

<span class="${completedClass}">
${task.text}
</span>

</div>

<div class="actions">

<button class="edit-btn"
onclick="editTask(${i})">
Edit
</button>

<button class="delete-btn"
onclick="deleteTask(${i})">
Delete
</button>

</div>
`;

taskList.appendChild(taskDiv);

}

updateCount();

}

// Checkbox click hone par complete/incomplete karo

function toggleTask(index) {

if (tasks[index].completed == true) {

tasks[index].completed = false;

} else {

tasks[index].completed = true;

}

saveTasks();

displayTasks();

}

// Task delete karo

function deleteTask(index) {

tasks.splice(index, 1);

saveTasks();

displayTasks();

}

// Task edit karo

function editTask(index) {

let newText = prompt("Edit Task", tasks[index].text);

if (newText != null && newText.trim() != "") {

tasks[index].text = newText.trim();

saveTasks();

displayTasks();

}

}

// Remaining tasks count karo

function updateCount() {

let active = 0;

for (let i = 0; i < tasks.length; i++) {

if (tasks[i].completed == false) {

active++;

}

}

count.textContent = active + " tasks left";

}

// Page load hote hi tasks dikhao

displayTasks();