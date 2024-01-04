let focusButton = document.getElementById("focus");
let shortBreakButton = document.getElementById("shortbreak");
let longBreakButton = document.getElementById("longbreak");
let startBtn = document.getElementById("btn-start");
let pauseBtn = document.getElementById("btn-pause");
let resumeBtn = document.getElementById("btn-resume");
let startOverBtn = document.getElementById("btn-start-over");
let resetBtn = document.getElementById("btn-reset");
let timeDisplay = document.getElementById("time");
let taskInput = document.getElementById("new-task-input");
let addTaskBtn = document.getElementById("add-task-btn");
let taskList = document.getElementById("task-list");
let modal = document.getElementById("activity-summary-modal");
let closeModal = document.getElementById("close-modal");

let timer, endTime;
let isTimerPaused = false;
let remainingTime;

const sessionTypes = {
    focus: { minutes: 25, countKey: 'focusCount' },
    shortBreak: { minutes: 5, countKey: 'shortBreakCount' },
    longBreak: { minutes: 15, countKey: 'longBreakCount' }
};

let currentSessionType = 'focus';
let isTimerRunning = false;

let stats = {
    focusCount: parseInt(localStorage.getItem('focusCount') || 0),
    shortBreakCount: parseInt(localStorage.getItem('shortBreakCount') || 0),
    longBreakCount: parseInt(localStorage.getItem('longBreakCount') || 0)
};

const updateStatsDisplay = () => {
    document.getElementById('focus-count').textContent = stats.focusCount;
    document.getElementById('short-break-count').textContent = stats.shortBreakCount;
    document.getElementById('long-break-count').textContent = stats.longBreakCount;
};

updateStatsDisplay();

const toggleButtonVisibility = () => {
    startBtn.classList.toggle("hide", isTimerRunning || isTimerPaused);
    pauseBtn.classList.toggle("hide", !isTimerRunning || isTimerPaused);
    resumeBtn.classList.toggle("hide", !isTimerPaused);
    startOverBtn.classList.toggle("hide", !isTimerPaused && !isTimerRunning);
    resetBtn.classList.toggle("hide", isTimerRunning || isTimerPaused);
};

const displayTime = (milliseconds) => {
    let totalSeconds = Math.round(milliseconds / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const startTimer = (duration) => {
    let startTime = isTimerPaused ? Date.now() + remainingTime : Date.now();
    endTime = startTime + duration * 60000;
    isTimerRunning = true;
    isTimerPaused = false;

    timer = setInterval(() => {
        let remaining = endTime - Date.now();
        if (remaining <= 0) {
            clearInterval(timer);
            isTimerRunning = false;
            incrementSessionCount();
            updateStatsDisplay();
            resetTimer();
            return;
        }
        displayTime(remaining);
    }, 1000);

    toggleButtonVisibility();
};

const resetTimer = () => {
    clearInterval(timer);
    isTimerRunning = false;
    isTimerPaused = false;
    setTimer(sessionTypes[currentSessionType].minutes);
    toggleButtonVisibility();
};

const setTimer = (minutes) => {
    timeDisplay.textContent = `${minutes}:00`;
};

const incrementSessionCount = () => {
    stats[sessionTypes[currentSessionType].countKey]++;
    localStorage.setItem(sessionTypes[currentSessionType].countKey, stats[sessionTypes[currentSessionType].countKey]);
    updateStatsDisplay();
};

focusButton.addEventListener("click", () => {
    currentSessionType = 'focus';
    resetTimer();
});

shortBreakButton.addEventListener("click", () => {
    currentSessionType = 'shortBreak';
    resetTimer();
});

longBreakButton.addEventListener("click", () => {
    currentSessionType = 'longBreak';
    resetTimer();
});

startBtn.addEventListener("click", () => {
    if (!isTimerRunning) {
        startTimer(sessionTypes[currentSessionType].minutes);
    }
});

pauseBtn.addEventListener("click", () => {
    if (isTimerRunning) {
        clearInterval(timer);
        isTimerPaused = true;
        remainingTime = endTime - Date.now();
        toggleButtonVisibility();
    }
});

resumeBtn.addEventListener("click", () => {
    if (isTimerPaused) {
        startTimer(remainingTime / 60000);
    }
});

startOverBtn.addEventListener("click", () => {
    setTimer(sessionTypes[currentSessionType].minutes);
    startTimer(sessionTypes[currentSessionType].minutes);
});

resetBtn.addEventListener("click", () => {
    resetTimer();
});

closeModal.addEventListener("click", () => {
    modal.classList.add("hide");
});

// Function to open modal
function openActivitySummary() {
    modal.classList.remove("hide");
    // Populate the summary data and render the graph
    // This would be fetched from a server or database in a full application
    document.getElementById("hours-focused").textContent = "10";
    document.getElementById("days-accessed").textContent = "5";
    document.getElementById("day-streak").textContent = "3";
    // renderGraph(); // Placeholder for graph rendering logic
}

addTaskBtn.addEventListener("click", () => {
    let taskText = taskInput.value.trim();
    if (taskText) {
        addTask(taskText);
        taskInput.value = '';
    }
});

const addTask = (taskText) => {
    let li = document.createElement("li");
    li.textContent = taskText;
    li.addEventListener("click", () => {
        taskList.removeChild(li);
    });
    taskList.appendChild(li);
};

setTimer(sessionTypes[currentSessionType].minutes);
