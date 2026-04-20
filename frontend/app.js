const API_BASE = "http://localhost:8080";

window.togglePassword = function(inputId) {
  const input = document.getElementById(inputId);
  const btn = input.nextElementSibling;
  
  const showIcon = `<svg class="eye-show" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
  const hideIcon = `<svg class="eye-hide" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>`;

  if (input.type === "password") {
    input.type = "text";
    btn.innerHTML = hideIcon;
  } else {
    input.type = "password";
    btn.innerHTML = showIcon;
  }
};

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");
const forgotMessage = document.getElementById("forgotMessage");
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const backToLogin = document.getElementById("backToLogin");

const authToken = localStorage.getItem("smartTaskUserId");

if (window.location.pathname.endsWith("dashboard.html") && !authToken) {
  window.location = "index.html";
}

if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/" || window.location.pathname === "") {
  loginTab?.addEventListener("click", () => toggleAuth(true));
  registerTab?.addEventListener("click", () => toggleAuth(false));
  loginForm?.addEventListener("submit", handleLogin);
  registerForm?.addEventListener("submit", handleRegister);
  forgotPasswordForm?.addEventListener("submit", handleForgotPassword);
  forgotPasswordLink?.addEventListener("click", (e) => {
    e.preventDefault();
    showForgotPassword(true);
  });
  backToLogin?.addEventListener("click", (e) => {
    e.preventDefault();
    showForgotPassword(false);
  });
}

if (window.location.pathname.endsWith("dashboard.html") || window.location.pathname.endsWith("/dashboard")) {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("smartTaskUserId");
    localStorage.removeItem("smartTaskUserName");
    window.location = "index.html";
  });
  document.getElementById("refreshBtn").addEventListener("click", loadTasks);
  document.getElementById("statusFilter").addEventListener("change", loadTasks);
  document.getElementById("saveTaskBtn").addEventListener("click", saveTask);
  document.getElementById("cancelEditBtn").addEventListener("click", resetForm);
  document.getElementById("welcomeText").textContent = `Welcome, ${localStorage.getItem("smartTaskUserName") || "Task User"}`;
  loadTasks();
}

function toggleAuth(loginMode) {
  loginForm.classList.toggle("hidden", !loginMode);
  registerForm.classList.toggle("hidden", loginMode);
  forgotPasswordForm.classList.add("hidden");
  loginTab.classList.toggle("active", loginMode);
  registerTab.classList.toggle("active", !loginMode);
  loginMessage.textContent = "";
  registerMessage.textContent = "";
  forgotMessage.textContent = "";
}

function showForgotPassword(show) {
  forgotPasswordForm.classList.toggle("hidden", !show);
  loginForm.classList.add("hidden");
  registerForm.classList.add("hidden");
  loginTab.classList.remove("active");
  registerTab.classList.remove("active");
  forgotMessage.textContent = "";
  if (!show) toggleAuth(true);
}

async function handleLogin(event) {
  event.preventDefault();
  loginMessage.textContent = "";
  loginMessage.style.color = "#6b7280";
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      loginMessage.textContent = data.error || "Login failed. Check your email and password.";
      loginMessage.style.color = "#dc2626";
      return;
    }
    localStorage.setItem("smartTaskUserId", data.userId);
    localStorage.setItem("smartTaskUserName", data.name || "User");
    window.location = "dashboard.html";
  } catch (error) {
    loginMessage.textContent = "Unable to connect to the backend. Please start the server and try again.";
    loginMessage.style.color = "#dc2626";
  }
}

async function handleRegister(event) {
  event.preventDefault();
  registerMessage.textContent = "";
  registerMessage.style.color = "#6b7280";
  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Registration error:", data);
      registerMessage.textContent = data.error || data.message || "Registration failed. Please check the input.";
      registerMessage.style.color = "#dc2626";
      return;
    }
    registerMessage.textContent = data.message || "Registration successful";
    registerMessage.style.color = "#16a34a";
    localStorage.setItem("smartTaskUserId", data.userId);
    localStorage.setItem("smartTaskUserName", name);
    setTimeout(() => {
      window.location = "dashboard.html";
    }, 500);
  } catch (error) {
    registerMessage.textContent = "Unable to connect to the backend. Please start the server and try again.";
    registerMessage.style.color = "#dc2626";
  }
}

async function handleForgotPassword(event) {
  event.preventDefault();
  forgotMessage.textContent = "";
  forgotMessage.style.color = "#6b7280";

  const email = document.getElementById("forgotEmail").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (newPassword !== confirmPassword) {
    forgotMessage.textContent = "Passwords do not match.";
    forgotMessage.style.color = "#dc2626";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      forgotMessage.textContent = data.error || "Reset failed. Please try again.";
      forgotMessage.style.color = "#dc2626";
      return;
    }

    forgotMessage.textContent = "Password reset successful! You can now login.";
    forgotMessage.style.color = "#16a34a";
    setTimeout(() => {
      showForgotPassword(false);
    }, 2000);
  } catch (error) {
    forgotMessage.textContent = "Unable to connect to the backend. Please try again.";
    forgotMessage.style.color = "#dc2626";
  }
}

function getUserHeader() {
  return { "X-User-Id": localStorage.getItem("smartTaskUserId") };
}

async function loadTasks() {
  const filter = document.getElementById("statusFilter").value;
  const url = `${API_BASE}/tasks${filter ? `?status=${encodeURIComponent(filter)}` : ""}`;
  const response = await fetch(url, { headers: getUserHeader() });
  const data = await response.json();
  if (!response.ok) {
    document.getElementById("taskMessage").textContent = data.error || "Unable to load tasks";
    return;
  }
  renderTasks(data);
}

function renderTasks(tasks) {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  if (!Array.isArray(tasks) || tasks.length === 0) {
    taskList.innerHTML = `<p class="message">No tasks yet. Create one with the form above.</p>`;
    return;
  }
  tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = `task-card priority-${task.priority || 'Medium'}`;
    card.innerHTML = `
      <div class="priority-tag ${task.priority || 'Medium'}">${task.priority || 'Medium'}</div>
      <h3>${escapeHtml(task.title)}</h3>
      <p>${escapeHtml(task.description)}</p>
      <div class="task-meta">
        <span>Status: <strong>${task.status}</strong></span>
        <span class="due-date">📅 ${task.dueDate || "No due date"}</span>
      </div>
      <div class="task-actions">
        <button onclick="editTask(${task.id})" class="secondary">Edit</button>
        <button onclick="removeTask(${task.id})" class="secondary">Delete</button>
      </div>
    `;
    taskList.appendChild(card);
  });
}

function escapeHtml(value) {
  return value
    ? value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    : "";
}

let editingTaskId = null;

async function saveTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const status = document.getElementById("taskStatus").value;
  const priority = document.getElementById("taskPriority").value;
  const dueDate = document.getElementById("taskDueDate").value;
  const taskMessage = document.getElementById("taskMessage");
  taskMessage.textContent = "";
  if (!title || !description) {
    taskMessage.textContent = "Title and description are required.";
    return;
  }
  const payload = { title, description, status, priority, dueDate };
  const method = editingTaskId ? "PUT" : "POST";
  const url = editingTaskId ? `${API_BASE}/tasks/${editingTaskId}` : `${API_BASE}/tasks`;
  const response = await fetch(url, {
    method,
    headers: { ...getUserHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    taskMessage.textContent = data.error || "Unable to save task";
    return;
  }
  resetForm();
  loadTasks();
}

function resetForm() {
  editingTaskId = null;
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskStatus").value = "Pending";
  document.getElementById("taskPriority").value = "Medium";
  document.getElementById("taskDueDate").value = "";
  document.getElementById("taskFormTitle").textContent = "Create Task";
  document.getElementById("cancelEditBtn").classList.add("hidden");
  document.getElementById("taskMessage").textContent = "";
}

async function editTask(id) {
  const response = await fetch(`${API_BASE}/tasks`, { headers: getUserHeader() });
  const data = await response.json();
  if (!response.ok) {
    document.getElementById("taskMessage").textContent = data.error || "Unable to load tasks";
    return;
  }
  const task = data.find((item) => item.id === id);
  if (!task) {
    document.getElementById("taskMessage").textContent = "Task not found.";
    return;
  }
  editingTaskId = id;
  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskDescription").value = task.description;
  document.getElementById("taskStatus").value = task.status;
  document.getElementById("taskPriority").value = task.priority || "Medium";
  document.getElementById("taskDueDate").value = task.dueDate || "";
  document.getElementById("taskFormTitle").textContent = "Edit Task";
  document.getElementById("cancelEditBtn").classList.remove("hidden");
}

async function removeTask(id) {
  const confirmed = window.confirm("Delete this task?");
  if (!confirmed) return;
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "DELETE",
    headers: getUserHeader(),
  });
  const data = await response.json();
  if (!response.ok) {
    document.getElementById("taskMessage").textContent = data.error || "Unable to delete task";
    return;
  }
  loadTasks();
}
