/* =========================================================
   Planify — Complete Dashboard Logic
   Features: Task CRUD, Pomodoro Timer, AI Tips, Search,
   Keyboard Shortcuts, Sidebar, Streak, Categories, Progress
   ========================================================= */

// ===== STATE =====
let currentFilter = "all";
let searchQuery = "";

// Pomodoro state
let pomoInterval = null;
let pomoRunning = false;
let pomoMode = "work";       // work | short | long
let pomoTimeLeft = 25 * 60;  // seconds
let pomoSessions = parseInt(localStorage.getItem("pomoSessions") || "0");
const POMO_DURATIONS = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
let customPomoDurations = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
const POMO_CIRCUMFERENCE = 565.48;

// AI Productivity Tips
const AI_TIPS = [
    "Break large tasks into smaller sub-tasks. You will feel progress faster and stay motivated throughout the day.",
    "Use the 2-minute rule: if a task takes less than 2 minutes, do it immediately instead of adding it to your list.",
    "Schedule your most challenging tasks during your peak energy hours for maximum productivity.",
    "Take regular breaks using the Pomodoro technique. Your brain needs rest to maintain high performance.",
    "Review your task list every morning and identify your top 3 priorities for the day.",
    "Batch similar tasks together to reduce context-switching and boost your focus efficiency.",
    "End each workday by planning tomorrow. You will start the next day with clarity and purpose.",
    "Limit work-in-progress to 3 tasks at a time. Multitasking reduces quality and increases stress.",
    "Celebrate small wins! Completing even minor tasks builds momentum for bigger achievements.",
    "Use categories to organize tasks by area of life. Balance across work, personal, health, and learning.",
    "Set realistic deadlines. Overcommitting leads to burnout and disappointment.",
    "Try the Eisenhower Matrix: separate tasks by urgency and importance to focus on what truly matters.",
    "Eliminate distractions during focus sessions. Put your phone on silent and close unnecessary tabs.",
    "Track your streak! Consistency beats intensity when building productive habits.",
    "Review completed tasks weekly to see how far you have come. Reflection fuels motivation.",
    "Start with the hardest task first (Eat the Frog). Everything else will feel easier after.",
    "Use time-blocking: assign specific hours to specific tasks for better structure.",
    "Automate repetitive tasks where possible. Spend your energy on work that requires creativity.",
    "Stay hydrated and take movement breaks. Physical well-being directly impacts mental performance.",
    "Write tasks as actionable items starting with a verb — it makes them clearer and easier to start."
];

// ===== INITIALIZE ON PAGE LOAD =====
window.onload = function () {
    setGreeting();
    setUserDisplay();
    setDateDisplay();
    loadTasks();
    updateStreak();
    updateSidebarBadges();
    refreshTip();
    updatePomodoroDisplay();
    updatePomodoroSessionDisplay();

    // Password strength meter on signup page
    const signupPwd = document.getElementById("signupPassword");
    if (signupPwd) {
        signupPwd.addEventListener("input", function () {
            updatePasswordStrength(this.value);
        });
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", handleKeyboardShortcuts);
};

// ===== GREETING BASED ON TIME OF DAY =====
function setGreeting() {
    const el = document.getElementById("greeting");
    if (!el) return;

    const hour = new Date().getHours();
    const name = localStorage.getItem("userName") || "";
    const firstName = name ? name.split(" ")[0] : "";
    let greeting;

    if (hour < 12) greeting = "Good morning";
    else if (hour < 17) greeting = "Good afternoon";
    else greeting = "Good evening";

    el.textContent = firstName ? `${greeting}, ${firstName}! 👋` : `${greeting}! 👋`;

    const sub = document.getElementById("greetingSub");
    if (sub) {
        const tasks = getTasks();
        const pending = tasks.filter(t => !t.completed).length;
        if (pending === 0) {
            sub.textContent = "You are all caught up! Time to relax or plan ahead.";
        } else if (pending === 1) {
            sub.textContent = "You have 1 task waiting. Let's get it done!";
        } else {
            sub.textContent = `You have ${pending} tasks on your plate today.`;
        }
    }
}

// ===== DATE DISPLAY =====
function setDateDisplay() {
    const dateEl = document.getElementById("dateDisplay");
    const dayEl = document.getElementById("dayDisplay");
    if (!dateEl || !dayEl) return;

    const now = new Date();
    dateEl.textContent = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    dayEl.textContent = now.toLocaleDateString("en-US", { weekday: "long" });
}

// ===== SHOW USER INFO IN SIDEBAR + NAV =====
function setUserDisplay() {
    const email = localStorage.getItem("userEmail") || "User";
    const name = localStorage.getItem("userName") || email;

    const displayEl = document.getElementById("userDisplay");
    const avatarEl = document.getElementById("userAvatar");
    const sidebarAvatar = document.getElementById("sidebarAvatar");
    const sidebarUsername = document.getElementById("sidebarUsername");
    const sidebarEmail = document.getElementById("sidebarEmail");

    const initial = (name || email).charAt(0).toUpperCase();

    if (displayEl) displayEl.textContent = name || email;
    if (avatarEl) avatarEl.textContent = initial;
    if (sidebarAvatar) sidebarAvatar.textContent = initial;
    if (sidebarUsername) sidebarUsername.textContent = name || "User";
    if (sidebarEmail) sidebarEmail.textContent = email;
}

// ===== STREAK TRACKING =====
function updateStreak() {
    const today = new Date().toDateString();
    const lastActive = localStorage.getItem("lastActiveDate");
    let streak = parseInt(localStorage.getItem("streak") || "0");

    if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastActive === yesterday.toDateString()) {
            streak++;
        } else if (lastActive !== today) {
            streak = 1; // Reset streak if missed a day
        }

        localStorage.setItem("lastActiveDate", today);
        localStorage.setItem("streak", streak.toString());
    }

    const streakEl = document.getElementById("statStreak");
    if (streakEl) streakEl.textContent = streak;
}

// ===== ADD A NEW TASK =====
function addTask() {
    const input = document.getElementById("taskInput");
    const priorityEl = document.getElementById("taskPriority");
    const dueDateEl = document.getElementById("taskDueDate");
    const categoryEl = document.getElementById("taskCategory");

    const text = input.value.trim();
    if (text === "") {
        showToast("Please enter a task description.", "error");
        return;
    }

    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        priority: priorityEl ? priorityEl.value : "medium",
        category: categoryEl ? categoryEl.value : "",
        dueDate: dueDateEl ? dueDateEl.value : "",
        createdAt: new Date().toISOString()
    };

    const tasks = getTasks();
    tasks.push(task);
    saveTasks(tasks);

    // Reset form
    input.value = "";
    if (dueDateEl) dueDateEl.value = "";
    if (priorityEl) priorityEl.value = "medium";
    if (categoryEl) categoryEl.value = "";

    showToast("Task added successfully!", "success");
    loadTasks();
    updateSidebarBadges();
    setGreeting(); // Update pending count
}

// ===== LOAD & RENDER TASKS =====
function loadTasks() {
    const list = document.getElementById("taskList");
    if (!list) return;

    list.innerHTML = "";

    let tasks = getTasks();

    // Apply search filter
    let filtered = tasks;
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(t => t.text.toLowerCase().includes(q));
    }

    // Apply category/status filter
    filtered = filterTasks(filtered, currentFilter);

    // Sort: incomplete first, then by priority weight, then by due date
    filtered.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const pDiff = (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
        if (pDiff !== 0) return pDiff;
        if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return b.id - a.id;
    });

    // Update task count label
    const countLabel = document.getElementById("taskCountLabel");
    if (countLabel) {
        const suffix = filtered.length === 1 ? "task" : "tasks";
        countLabel.textContent = `${filtered.length} ${suffix}`;
    }

    // Render empty state or tasks
    if (filtered.length === 0) {
        list.innerHTML = renderEmptyState();
    } else {
        filtered.forEach((task) => {
            list.appendChild(createTaskCard(task));
        });
    }

    updateStats(tasks);
}

// ===== CREATE A TASK CARD ELEMENT =====
function createTaskCard(task) {
    const li = document.createElement("li");
    li.className = `task-card priority-${task.priority || "medium"}`;
    if (task.completed) li.classList.add("completed");

    // Check button
    const checkBtn = document.createElement("button");
    checkBtn.className = `btn-check ${task.completed ? "checked" : ""}`;
    checkBtn.innerHTML = task.completed
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
        : "";
    checkBtn.title = task.completed ? "Mark as pending" : "Mark as complete";
    checkBtn.onclick = () => toggleComplete(task.id);

    // Content area
    const content = document.createElement("div");
    content.className = "task-content";

    const textEl = document.createElement("div");
    textEl.className = "task-text";
    textEl.textContent = task.text;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    // Priority badge
    const badge = document.createElement("span");
    badge.className = `task-badge badge-${task.priority || "medium"}`;
    const priorityIcons = { high: "\u{1F534}", medium: "\u{1F7E1}", low: "\u{1F7E2}" };
    badge.textContent = `${priorityIcons[task.priority] || "\u{1F7E1}"} ${(task.priority || "medium").charAt(0).toUpperCase() + (task.priority || "medium").slice(1)}`;
    meta.appendChild(badge);

    // Category badge
    if (task.category) {
        const catBadge = document.createElement("span");
        catBadge.className = "task-badge badge-category";
        const catIcons = { work: "\u{1F4BC}", personal: "\u{1F3E0}", health: "\u{1F4AA}", learning: "\u{1F4DA}", finance: "\u{1F4B0}" };
        catBadge.textContent = `${catIcons[task.category] || ""} ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}`;
        meta.appendChild(catBadge);
    }

    // Due date
    if (task.dueDate) {
        const due = document.createElement("span");
        due.className = "task-due";
        const isOverdue = !task.completed && new Date(task.dueDate) < new Date(new Date().toDateString());
        if (isOverdue) due.classList.add("overdue");
        due.innerHTML = `\u{1F4C5} ${formatDate(task.dueDate)}`;
        meta.appendChild(due);
    }

    content.appendChild(textEl);
    content.appendChild(meta);

    // Actions
    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-icon";
    editBtn.title = "Edit task";
    editBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    editBtn.onclick = () => editTask(task.id);

    const delBtn = document.createElement("button");
    delBtn.className = "btn-icon btn-icon-danger";
    delBtn.title = "Delete task";
    delBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
    delBtn.onclick = () => deleteTask(task.id);

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    // Assemble card
    li.appendChild(checkBtn);
    li.appendChild(content);
    li.appendChild(actions);

    return li;
}

// ===== EDIT TASK =====
function editTask(id) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt("Edit task:", task.text);
    if (newText === null) return; // cancelled
    const trimmed = newText.trim();
    if (trimmed === "") {
        showToast("Task text cannot be empty.", "error");
        return;
    }

    task.text = trimmed;
    saveTasks(tasks);
    showToast("Task updated!", "success");
    loadTasks();
}

// ===== TOGGLE TASK COMPLETE =====
function toggleComplete(id) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    saveTasks(tasks);

    showToast(
        task.completed ? "Nice work! Task completed \u{1F389}" : "Task marked as pending",
        task.completed ? "success" : "info"
    );
    loadTasks();
    updateSidebarBadges();
    setGreeting();
}

// ===== DELETE A TASK =====
function deleteTask(id) {
    if (!confirm("Delete this task? This cannot be undone.")) return;

    let tasks = getTasks();
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);

    showToast("Task deleted", "info");
    loadTasks();
    updateSidebarBadges();
    setGreeting();
}

// ===== FILTER TASKS =====
function filterTasks(tasks, filter) {
    switch (filter) {
        case "pending":    return tasks.filter(t => !t.completed);
        case "completed":  return tasks.filter(t => t.completed);
        case "high":       return tasks.filter(t => t.priority === "high");
        case "medium":     return tasks.filter(t => t.priority === "medium");
        case "low":        return tasks.filter(t => t.priority === "low");
        default:           return tasks;
    }
}

function setFilter(filter, buttonEl) {
    currentFilter = filter;

    // Update active tab style in filter bar
    document.querySelectorAll(".filter-tab").forEach(tab => tab.classList.remove("active"));
    if (buttonEl) {
        buttonEl.classList.add("active");
    } else {
        // Find the matching filter tab
        const tab = document.querySelector(`.filter-tab[data-filter="${filter}"]`);
        if (tab) tab.classList.add("active");
    }

    // Update sidebar category link active state
    document.querySelectorAll(".category-link").forEach(link => link.classList.remove("active"));

    loadTasks();
}

// ===== UPDATE STATS & PROGRESS BAR =====
function updateStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    const statTotal = document.getElementById("statTotal");
    const statCompleted = document.getElementById("statCompleted");
    const statPending = document.getElementById("statPending");

    if (statTotal) animateNumber(statTotal, parseInt(statTotal.textContent) || 0, total, 400);
    if (statCompleted) animateNumber(statCompleted, parseInt(statCompleted.textContent) || 0, completed, 400);
    if (statPending) animateNumber(statPending, parseInt(statPending.textContent) || 0, pending, 400);

    // Update progress bar
    const progressFill = document.getElementById("progressFill");
    const progressPercent = document.getElementById("progressPercent");
    const progressSubtext = document.getElementById("progressSubtext");

    if (progressFill) progressFill.style.width = percent + "%";
    if (progressPercent) progressPercent.textContent = percent + "%";

    if (progressSubtext) {
        if (total === 0) {
            progressSubtext.textContent = "Add tasks to start tracking progress";
        } else if (percent === 100) {
            progressSubtext.textContent = "All tasks completed! You are on fire today \u{1F525}";
        } else if (percent >= 75) {
            progressSubtext.textContent = `Almost there! ${pending} task${pending !== 1 ? "s" : ""} remaining`;
        } else if (percent >= 50) {
            progressSubtext.textContent = `Halfway done! Keep the momentum going`;
        } else {
            progressSubtext.textContent = `${completed} of ${total} tasks done so far`;
        }
    }
}

// Animate stat number transitions
function animateNumber(el, from, to, duration) {
    if (from === to) return;
    const start = performance.now();
    const step = (timestamp) => {
        const progress = Math.min((timestamp - start) / duration, 1);
        el.textContent = Math.round(from + (to - from) * progress);
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

// ===== SIDEBAR BADGE COUNTS =====
function updateSidebarBadges() {
    const tasks = getTasks();
    const sidebarCount = document.getElementById("sidebarTaskCount");
    const catHigh = document.getElementById("catHigh");
    const catMedium = document.getElementById("catMedium");
    const catLow = document.getElementById("catLow");

    if (sidebarCount) sidebarCount.textContent = tasks.filter(t => !t.completed).length;
    if (catHigh) catHigh.textContent = tasks.filter(t => t.priority === "high" && !t.completed).length;
    if (catMedium) catMedium.textContent = tasks.filter(t => t.priority === "medium" && !t.completed).length;
    if (catLow) catLow.textContent = tasks.filter(t => t.priority === "low" && !t.completed).length;
}

// ===== SEARCH =====
function handleSearch(value) {
    searchQuery = value.trim();
    loadTasks();
}

// ===== SIDEBAR TOGGLE =====
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainWrapper = document.getElementById("mainWrapper");
    if (!sidebar) return;

    sidebar.classList.toggle("open");
    if (mainWrapper) mainWrapper.classList.toggle("sidebar-collapsed");

    // Save sidebar state
    const isOpen = sidebar.classList.contains("open");
    localStorage.setItem("sidebarOpen", isOpen ? "true" : "false");
}

// ===== KEYBOARD SHORTCUTS =====
function handleKeyboardShortcuts(e) {
    // Skip if user is typing in an input/textarea
    const tag = document.activeElement.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") {
        if (e.key === "Escape") {
            document.activeElement.blur();
            closeShortcuts();
        }
        return;
    }

    switch (e.key.toLowerCase()) {
        case "n":
            e.preventDefault();
            const taskInput = document.getElementById("taskInput");
            if (taskInput) taskInput.focus();
            break;
        case "/":
            e.preventDefault();
            const searchInput = document.getElementById("searchInput");
            if (searchInput) searchInput.focus();
            break;
        case "p":
            e.preventDefault();
            togglePomodoro();
            break;
        case "1":
            e.preventDefault();
            setFilter("all", null);
            break;
        case "2":
            e.preventDefault();
            setFilter("pending", null);
            break;
        case "3":
            e.preventDefault();
            setFilter("completed", null);
            break;
        case "?":
            e.preventDefault();
            showShortcuts();
            break;
        case "escape":
            closeShortcuts();
            break;
    }
}

// ===== SHORTCUTS MODAL =====
function showShortcuts() {
    const modal = document.getElementById("shortcutsModal");
    if (modal) modal.style.display = "flex";
}

function closeShortcuts() {
    const modal = document.getElementById("shortcutsModal");
    if (modal) modal.style.display = "none";
}

// ===== POMODORO TIMER =====
function setPomodoroMode(mode, btn) {
    pomoMode = mode;
    pomoTimeLeft = customPomoDurations[mode];
    pomoRunning = false;
    clearInterval(pomoInterval);
    pomoInterval = null;

    updatePomodoroDisplay();
    updatePomodoroButtonState();
    closeTimeEditor();

    // Update tab active state
    document.querySelectorAll(".pomo-tab").forEach(t => t.classList.remove("active"));
    if (btn) btn.classList.add("active");
}

function togglePomodoro() {
    if (pomoRunning) {
        // Pause
        pomoRunning = false;
        clearInterval(pomoInterval);
        pomoInterval = null;
        updatePomodoroButtonState();
    } else {
        // Start
        pomoRunning = true;
        updatePomodoroButtonState();
        pomoInterval = setInterval(() => {
            pomoTimeLeft--;
            updatePomodoroDisplay();

            if (pomoTimeLeft <= 0) {
                clearInterval(pomoInterval);
                pomoInterval = null;
                pomoRunning = false;

                if (pomoMode === "work") {
                    pomoSessions++;
                    localStorage.setItem("pomoSessions", pomoSessions.toString());
                    updatePomodoroSessionDisplay();
                    showToast("Focus session complete! Take a break \u{2615}", "success");
                    // Auto-switch to short break
                    setPomodoroMode("short", document.querySelectorAll(".pomo-tab")[1]);
                } else {
                    showToast("Break is over! Ready to focus? \u{1F4AA}", "info");
                    setPomodoroMode("work", document.querySelectorAll(".pomo-tab")[0]);
                }

                updatePomodoroButtonState();
            }
        }, 1000);
    }
}

function resetPomodoro() {
    pomoRunning = false;
    clearInterval(pomoInterval);
    pomoInterval = null;
    pomoTimeLeft = customPomoDurations[pomoMode];
    updatePomodoroDisplay();
    updatePomodoroButtonState();
    closeTimeEditor();
}

function updatePomodoroDisplay() {
    const timeEl = document.getElementById("pomoTime");
    const ringEl = document.getElementById("pomoRing");

    if (timeEl) {
        const mins = Math.floor(pomoTimeLeft / 60);
        const secs = pomoTimeLeft % 60;
        timeEl.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    if (ringEl) {
        const total = customPomoDurations[pomoMode];
        const progress = 1 - (pomoTimeLeft / total);
        const offset = POMO_CIRCUMFERENCE * progress;
        ringEl.style.strokeDashoffset = -offset;
    }
}

function updatePomodoroButtonState() {
    const startBtn = document.getElementById("pomoStartBtn");
    const startText = document.getElementById("pomoStartText");
    if (!startBtn || !startText) return;

    if (pomoRunning) {
        startText.textContent = "Pause";
        startBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg><span id="pomoStartText">Pause</span>';
        startBtn.classList.add("pomo-running");
    } else {
        const label = pomoTimeLeft < customPomoDurations[pomoMode] ? "Resume" : (pomoMode === "work" ? "Start Focus" : "Start Break");
        startBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><span id="pomoStartText">' + label + "</span>";
        startBtn.classList.remove("pomo-running");
    }
}

function updatePomodoroSessionDisplay() {
    const el = document.getElementById("pomoSessions");
    if (el) el.textContent = pomoSessions;
}

// ===== EDITABLE TIMER =====
function openTimeEditor() {
    // Only allow editing when timer is NOT running
    if (pomoRunning) return;

    const timeDisplay = document.getElementById("pomoTime");
    const editor = document.getElementById("pomoTimeEditor");
    const hint = document.getElementById("pomoEditHint");
    if (!timeDisplay || !editor) return;

    const mins = Math.floor(pomoTimeLeft / 60);
    const secs = pomoTimeLeft % 60;

    document.getElementById("pomoMinsInput").value = mins;
    document.getElementById("pomoSecsInput").value = secs.toString().padStart(2, "0");

    timeDisplay.style.display = "none";
    editor.style.display = "flex";
    if (hint) hint.style.display = "none";

    // Focus the minutes input
    document.getElementById("pomoMinsInput").focus();
    document.getElementById("pomoMinsInput").select();
}

function confirmTimeEdit() {
    const minsInput = document.getElementById("pomoMinsInput");
    const secsInput = document.getElementById("pomoSecsInput");
    if (!minsInput || !secsInput) return;

    let mins = parseInt(minsInput.value) || 0;
    let secs = parseInt(secsInput.value) || 0;

    // Clamp values
    mins = Math.max(0, Math.min(99, mins));
    secs = Math.max(0, Math.min(59, secs));

    // Must be at least 1 minute
    const totalSecs = mins * 60 + secs;
    if (totalSecs < 60) {
        showToast("Timer must be at least 1 minute.", "error");
        return;
    }

    // Save as custom duration for this mode
    customPomoDurations[pomoMode] = totalSecs;
    pomoTimeLeft = totalSecs;

    closeTimeEditor();
    updatePomodoroDisplay();
    updatePomodoroButtonState();

    showToast(`Timer set to ${mins}m ${secs > 0 ? secs + "s" : ""}`.trim() + " \u2705", "success");
}

function closeTimeEditor() {
    const timeDisplay = document.getElementById("pomoTime");
    const editor = document.getElementById("pomoTimeEditor");
    const hint = document.getElementById("pomoEditHint");
    if (timeDisplay) timeDisplay.style.display = "flex";
    if (editor) editor.style.display = "none";
    if (hint) hint.style.display = "block";
}

// Handle Enter key in time editor inputs
document.addEventListener("DOMContentLoaded", function () {
    ["pomoMinsInput", "pomoSecsInput"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    confirmTimeEdit();
                } else if (e.key === "Escape") {
                    e.preventDefault();
                    closeTimeEditor();
                    updatePomodoroDisplay();
                }
            });
        }
    });
});

// ===== AI TIPS =====
function refreshTip() {
    const el = document.getElementById("aiTipText");
    if (!el) return;

    // Add animation
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";

    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * AI_TIPS.length);
        el.textContent = AI_TIPS[randomIndex];
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
    }, 200);
}

// ===== EMPTY STATE HTML =====
function renderEmptyState() {
    const messages = {
        all:       { icon: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(129,140,248,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', title: "No tasks yet", desc: "Add your first task above and start being productive!" },
        pending:   { icon: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(52,211,153,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>', title: "All caught up!", desc: "You have completed every task. Time to celebrate!" },
        completed: { icon: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', title: "Nothing completed yet", desc: "Start checking off tasks to see them here." },
        high:      { icon: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>', title: "No high priority tasks", desc: "Nothing urgent right now." },
        medium:    { icon: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>', title: "No medium priority tasks", desc: "Add some tasks with medium priority." },
        low:       { icon: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(52,211,153,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/></svg>', title: "No low priority tasks", desc: "Add some tasks with low priority." }
    };

    const msg = messages[currentFilter] || messages.all;

    return `
        <div class="empty-state">
            <div class="empty-state-icon">${msg.icon}</div>
            <h3>${msg.title}</h3>
            <p>${msg.desc}</p>
        </div>
    `;
}

// ===== HELPERS =====
function getTasks() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function formatDate(dateStr) {
    const date = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.getTime() === today.getTime()) return "Today";
    if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
    if (date.getTime() === yesterday.getTime()) return "Yesterday";

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined
    });
}

// ===== PASSWORD VISIBILITY TOGGLE =====
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    } else {
        input.type = "password";
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    }
}

// ===== PASSWORD STRENGTH METER =====
function updatePasswordStrength(password) {
    const bars = [
        document.getElementById("str1"),
        document.getElementById("str2"),
        document.getElementById("str3"),
        document.getElementById("str4")
    ];
    const textEl = document.getElementById("strengthText");
    if (!bars[0] || !textEl) return;

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
        { label: "", color: "" },
        { label: "Weak", color: "var(--danger)" },
        { label: "Fair", color: "var(--warning)" },
        { label: "Good", color: "#60a5fa" },
        { label: "Strong", color: "var(--success)" }
    ];

    bars.forEach((bar, i) => {
        if (i < score) {
            bar.style.background = levels[score].color;
        } else {
            bar.style.background = "rgba(255,255,255,0.1)";
        }
    });

    if (password.length === 0) {
        textEl.textContent = "";
    } else {
        textEl.textContent = levels[score].label;
        textEl.style.color = levels[score].color;
    }
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-msg">${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-exit");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
