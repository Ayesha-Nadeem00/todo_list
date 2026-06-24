const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const count = document.getElementById("count");

const userInput = document.getElementById("userInput");
const addUserBtn = document.getElementById("addUserBtn");
const userTabs = document.getElementById("userTabs");
const userSelect = document.getElementById("userSelect");

//  DATA
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [];

let activeUser = "all";
let activeFilter = "all";

//  SAVE DATA 
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

//  ADD USER 
function addUser() {
    let name = userInput.value.trim();

    if (name === "") {
        alert("Enter a user name");
        return;
    }

    if (name.length < 2) {
        alert("User name must be at least 2 characters");
        return;
    }

    if (!/^[A-Za-z ]+$/.test(name)) {
        alert("Only alphabets are allowed in user name");
        return;
    }

    let exists = users.some(
        user => user.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
        alert("User already exists");
        return;
    }

    users.push(name);

    saveUsers();

    userInput.value = "";

    renderUserTabs();
    renderUserSelect();
}

//  REMOVE USER 
function removeUser(name) {
    if (!confirm(`Remove user "${name}"? Their tasks will also be deleted.`)) {
        return;
    }

    //users = users.filter(user => user !== name);
let updatedUsers = [];

for (let user of users) {
    if (user !== name) {
        updatedUsers.push(user);
    }
}

users = updatedUsers;

    //tasks = tasks.filter(task => task.user !== name);
let updatedTasks = [];

for (let task of tasks) {
    if (task.user !== name) {
        updatedTasks.push(task);
    }
}

tasks = updatedTasks;

    if (activeUser === name) {
        activeUser = "all";
    }

    saveUsers();
    saveTasks();

    renderUserTabs();
    renderUserSelect();
    displayTasks();
}

// USER TABS 
function renderUserTabs() {
    userTabs.innerHTML = "";

    // All Users Button
    let allBtn = document.createElement("button");
    allBtn.textContent = "All Users";
    allBtn.className =
        "user-tab" + (activeUser === "all" ? " active" : "");

    allBtn.setAttribute("data-user", "all");

    allBtn.onclick = function () {
        activeUser = "all";
        setActiveUserTab();
        displayTasks();
    };

    userTabs.appendChild(allBtn);

    // User Buttons
    users.forEach(user => {
        let wrapper = document.createElement("div");
        wrapper.className = "user-tab-wrapper";

        let userBtn = document.createElement("button");
        userBtn.textContent = user;

        userBtn.className =
            "user-tab" + (activeUser === user ? " active" : "");

        userBtn.setAttribute("data-user", user);

        userBtn.onclick = function () {
            activeUser = user;
            setActiveUserTab();
            displayTasks();
        };

        let removeBtn = document.createElement("button");
        removeBtn.textContent = "✕";
        removeBtn.className = "remove-user-btn";
        removeBtn.title = "Remove User";

        removeBtn.onclick = function (e) {
            e.stopPropagation();
            removeUser(user);
        };

        wrapper.appendChild(userBtn);
        wrapper.appendChild(removeBtn);

        userTabs.appendChild(wrapper);
    });
}

function setActiveUserTab() {
    let tabs = document.querySelectorAll(".user-tab");

    tabs.forEach(tab => {
        tab.classList.remove("active");

        if (tab.getAttribute("data-user") === activeUser) {
            tab.classList.add("active");
        }
    });
}

//  USER SELECT 
function renderUserSelect() {
    userSelect.innerHTML =
        '<option value="">--Assign to User--</option>';

    users.forEach(user => {
        let option = document.createElement("option");

        option.value = user;
        option.textContent = user;

        userSelect.appendChild(option);
    });
}

//  ADD TASK 
function addTask() {
    let text = taskInput.value.trim();
    let assignedUser = userSelect.value;

    if (text === "") {
        alert("Enter a task");
        return;
    }

    if (text.length < 2) {
        alert("Task must contain at least 2 characters");
        return;
    }

    if (!/^[A-Za-z ]+$/.test(text)) {
        alert("Only alphabets are allowed");
        return;
    }

    let duplicate = tasks.some(task =>
        task.text.toLowerCase() === text.toLowerCase() &&
        task.user === assignedUser
    );

    if (duplicate) {
        alert("Task already exists for this user");
        return;
    }

    tasks.push({
        text: text,
        completed: false,
        user: assignedUser
    });

    saveTasks();

    taskInput.value = "";
    userSelect.value = "";

    displayTasks();
}

//  DISPLAY TASKS 
function displayTasks() {
    taskList.innerHTML = "";

    buildStatsCard();

    let filteredTasks = tasks.filter(task => {

        if (
            activeUser !== "all" &&
            task.user !== activeUser
        ) {
            return false;
        }

        if (
            activeFilter === "pending" &&
            task.completed
        ) {
            return false;
        }

        if (
            activeFilter === "completed" &&
            !task.completed
        ) {
            return false;
        }

        return true;
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML =
            '<div class="empty-state">No tasks found.</div>';

        updateCount();
        return;
    }

    filteredTasks.forEach(task => {

        let index = tasks.indexOf(task);

        let taskDiv = document.createElement("div");
        taskDiv.className = "task";

        let userBadge = task.user
            ? `<span class="task-user-badge"> ${task.user}</span>`
            : `<span class="task-user-badge">Unassigned</span>`;

        taskDiv.innerHTML = `
        <div class="left">
            <input type="checkbox"
                   ${task.completed ? "checked" : ""}
                   onchange="toggleTask(${index})">

            <div class="task-info">
                <span class="${task.completed ? "completed" : ""}">
                    ${task.text}
                </span>
                ${userBadge}
            </div>
        </div>

        <div class="actions">
            <button class="edit-btn"
                    onclick="editTask(${index})">
                    Edit
            </button>

            <button class="delete-btn"
                    onclick="deleteTask(${index})">
                    Delete
            </button>
        </div>
        `;

        taskList.appendChild(taskDiv);
    });

    updateCount();
}

// STATS CARD 
function buildStatsCard() {

    let oldCard = document.getElementById("statsCard");

    if (oldCard) {
        oldCard.remove();
    }

   let currentTasks;

if (activeUser === "all") {
    currentTasks = tasks;
}
else {
    currentTasks =
        tasks.filter(task => task.user === activeUser);
}
    let total = currentTasks.length;

    let completed =
        currentTasks.filter(task => task.completed).length;

    let pending = total - completed;

    let percentage =
        total > 0
            ? Math.round((completed / total) * 100)
            : 0;

    let card = document.createElement("div");

    card.id = "statsCard";
    card.className = "stats-card";

    card.innerHTML = `
        <div class="stat-item">
            <span class="stat-number">${total}</span>
            <span class="stat-label">Total</span>
        </div>

        <div class="stat-divider"></div>

        <div class="stat-item">
            <span class="stat-number">${pending}</span>
            <span class="stat-label">Pending</span>
        </div>

        <div class="stat-divider"></div>

        <div class="stat-item">
            <span class="stat-number">${completed}</span>
            <span class="stat-label">Completed</span>
        </div>

        ${
            activeUser !== "all"
                ? `
                <div class="stat-divider"></div>

                <div class="stat-item">
                    <span class="stat-number">${percentage}%</span>
                    <span class="stat-label">Done</span>
                </div>
                `
                : ""
        }
    `;

    taskList.parentNode.insertBefore(card, taskList);
}

// TOGGLE TASK 
function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;

    saveTasks();
    displayTasks();
}

// DELETE TASK 
function deleteTask(index) {
    tasks.splice(index, 1);

    saveTasks();
    displayTasks();
}

// EDIT TASK 
function editTask(index) {

    let newText = prompt(
        "Edit Task",
        tasks[index].text
    );

    if (newText === null) return;

    newText = newText.trim();

    if (newText === "") return;

    if (!/^[A-Za-z ]+$/.test(newText)) {
        alert("Only alphabets are allowed");
        return;
    }

    tasks[index].text = newText;

    saveTasks();
    displayTasks();
}

// TASK COUNTER 
function updateCount() {

    let pending = 0;
    let completed = 0;

    for (let i = 0; i < tasks.length; i++) {

        if (activeUser !== "all" && tasks[i].user !== activeUser) {
            continue;
        }

        if (tasks[i].completed) {
            completed++;
        } else {
            pending++;
        }
    }

    let label = "";

    if (activeUser !== "all") {
        label = ` (${activeUser})`;
    }

    // count.textContent =
    //     `Pending: ${pending} | Completed: ${completed}${label}`;
}
// FILTER BUTTONS 
let filterBtns = document.querySelectorAll(".filter-btn");

filterBtns.forEach(btn => {

    btn.onclick = function () {

        activeFilter =
            btn.getAttribute("data-filter");

        filterBtns.forEach(button =>
            button.classList.remove("active")
        );

        btn.classList.add("active");

        displayTasks();
    };
});

// EVENTS 
addBtn.onclick = addTask;
addUserBtn.onclick = addUser;

taskInput.onkeydown = function (e) {
    if (e.key === "Enter") {
        addTask();
    }
};

userInput.onkeydown = function (e) {
    if (e.key === "Enter") {
        addUser();
    }
};

// START APP 
window.onload = function () {
    renderUserTabs();
    renderUserSelect();
    displayTasks();
};
