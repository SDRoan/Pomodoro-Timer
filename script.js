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
let themeToggleButton = document.getElementById("theme-toggle-btn");
let languageSwitcher = document.getElementById("language-switcher");

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

function displayQuote(quote) {
    const quoteElement = document.getElementById('quoteDisplay');
    quoteElement.textContent = quote;
}

function displayQuote(quote, author) {
    const quoteTextElement = document.getElementById('quoteText');
    const quoteAuthorElement = document.getElementById('quoteAuthor');
    quoteTextElement.textContent = `"${quote}"`;
    quoteAuthorElement.textContent = `- ${author}`;
}


const translations = {
    'en': {
        'focus': 'Focus',
        'shortBreak': 'Short Break',
        'longBreak': 'Long Break',
        'start': 'Start',
        'pause': 'Pause',
        'resume': 'Resume',
        'startOver': 'Start Over',
        'reset': 'Reset',
        'addTask': 'Add Task',
        
    },
    'es': {
        'focus': 'Enfocar',
        'shortBreak': 'Descanso Corto',
        'longBreak': 'Descanso Largo',
        'start': 'Empezar',
        'pause': 'Pausa',
        'resume': 'Continuar',
        'startOver': 'Empezar de Nuevo',
        'reset': 'Reiniciar',
        'addTask': 'Añadir Tarea',
        
    },
    'bn': {
        'focus': 'মনোনিবেশ',
        'shortBreak': 'স্বল্প বিরতি',
        'longBreak': 'দীর্ঘ বিরতি',
        'start': 'শুরু',
        'pause': 'বিরতি',
        'resume': 'আবার শুরু',
        'startOver': 'পুনরায় শুরু',
        'reset': 'রিসেট',
        'addTask': 'কাজ যোগ করুন',
        
    }
};

let productivityData = {
    labels: [],
    datasets: [{
        label: 'Focus Sessions',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
    }]
};

let ctx = document.getElementById('productivityChart').getContext('2d');
let productivityChart = new Chart(ctx, {
    type: 'line',
    data: productivityData,
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});


function updateChartData(date, sessionCount) {
    let labelIndex = productivityChart.data.labels.indexOf(date);

    if (labelIndex === -1) {
        productivityChart.data.labels.push(date);
        productivityChart.data.datasets[0].data.push(sessionCount);
    } else {
        productivityChart.data.datasets[0].data[labelIndex] = sessionCount;
    }
    
    productivityChart.update();
}


function recordFocusSession() {
    let today = new Date().toISOString().split('T')[0];
    let storedData = JSON.parse(localStorage.getItem('productivityData')) || {};

    storedData[today] = (storedData[today] || 0) + 1;
    localStorage.setItem('productivityData', JSON.stringify(storedData));
    updateChartData(today, storedData[today]);
}

let currentLanguage = 'en';

const updateStatsDisplay = () => {
    document.getElementById('focus-count').textContent = stats.focusCount;
    document.getElementById('short-break-count').textContent = stats.shortBreakCount;
    document.getElementById('long-break-count').textContent = stats.longBreakCount;
};


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

themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
});

languageSwitcher.addEventListener('change', (event) => {
    currentLanguage = event.target.value;
    updateTranslations();
});

const updateTranslations = () => {
    focusButton.textContent = translations[currentLanguage]['focus'];
    shortBreakButton.textContent = translations[currentLanguage]['shortBreak'];
    longBreakButton.textContent = translations[currentLanguage]['longBreak'];
    startBtn.textContent = translations[currentLanguage]['start'];
    pauseBtn.textContent = translations[currentLanguage]['pause'];
    resumeBtn.textContent = translations[currentLanguage]['resume'];
    startOverBtn.textContent = translations[currentLanguage]['startOver'];
    resetBtn.textContent = translations[currentLanguage]['reset'];
    addTaskBtn.textContent = translations[currentLanguage]['addTask'];
    
};

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
updateStatsDisplay();
updateTranslations();
