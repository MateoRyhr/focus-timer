// Timer variables
let timer;
let isRunning = false;
let timeLeft; // in seconds
let sessions = 0;
let totalFocusTime = 0;
let mode = 'work'; // 'work' or 'break'

// Custom durations (in minutes)
let workDuration = 25;
let breakDuration = 5;

// DOM elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const soundSelect = document.getElementById('soundSelect');
const natureSound = document.getElementById('natureSound');
const sessionsDisplay = document.getElementById('sessions');
const focusTimeDisplay = document.getElementById('focusTime');
const workDurationInput = document.getElementById('workDuration');
const breakDurationInput = document.getElementById('breakDuration');
const darkModeToggle = document.getElementById('darkModeToggle');

// Progress ring
const progressRing = document.querySelector('.progress-ring__progress');
const radius = progressRing.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
progressRing.style.strokeDashoffset = 0;

// Sound files
const soundFiles = {
    rain: 'sounds/rain.mp3',
    forest: 'sounds/forest.mp3',
    waves: 'sounds/waves.mp3'
};

// Load saved data
function loadData() {
    const savedSessions = localStorage.getItem('sessions');
    const savedTime = localStorage.getItem('focusTime');
    const savedWorkDuration = localStorage.getItem('workDuration');
    const savedBreakDuration = localStorage.getItem('breakDuration');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedSessions) sessions = parseInt(savedSessions);
    if (savedTime) totalFocusTime = parseInt(savedTime);
    if (savedWorkDuration) {
        workDuration = parseInt(savedWorkDuration);
        workDurationInput.value = workDuration;
    }
    if (savedBreakDuration) {
        breakDuration = parseInt(savedBreakDuration);
        breakDurationInput.value = breakDuration;
    }
    if (savedDarkMode === 'true') {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
    
    updateDashboard();
    resetTimer();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('sessions', sessions);
    localStorage.setItem('focusTime', totalFocusTime);
    localStorage.setItem('workDuration', workDuration);
    localStorage.setItem('breakDuration', breakDuration);
}

// Update dashboard
function updateDashboard() {
    sessionsDisplay.textContent = sessions;
    focusTimeDisplay.textContent = totalFocusTime;
}

// Update timer display
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

// Update progress ring
function updateProgressRing() {
    const totalTime = mode === 'work' ? workDuration * 60 : breakDuration * 60;
    const offset = circumference - (timeLeft / totalTime) * circumference;
    progressRing.style.strokeDashoffset = offset;
}

// Start timer
function startTimer() {
    if (!isRunning) {
        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        isRunning = true;
        timer = setInterval(() => {
            timeLeft--;
            updateDisplay();
            updateProgressRing();
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                isRunning = false;
                
                // Show notification
                if (Notification.permission === 'granted') {
                    const title = mode === 'work' ? 'Work session completed!' : 'Break time is over!';
                    const options = {
                        body: mode === 'work' ? 'Take a break!' : 'Back to work!',
                        icon: 'https://picsum.photos/seed/timer/64/64.jpg'
                    };
                    new Notification(title, options);
                }
                
                if (mode === 'work') {
                    sessions++;
                    totalFocusTime += workDuration;
                    saveData();
                    updateDashboard();
                    mode = 'break';
                    timeLeft = breakDuration * 60;
                } else {
                    mode = 'work';
                    timeLeft = workDuration * 60;
                }
                
                updateDisplay();
                updateProgressRing();
                
                // Auto-start next session?
                // For now, we'll just reset and let the user start manually.
                // If you want auto-start, call startTimer() again here.
            }
        }, 1000);
        
        // Play selected sound
        const selectedSound = soundSelect.value;
        if (selectedSound !== 'none') {
            natureSound.src = soundFiles[selectedSound];
            natureSound.play().catch(e => console.log('Play failed:', e));
        }
    }
}

// Pause timer
function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
    natureSound.pause();
}

// Reset timer
function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    mode = 'work';
    timeLeft = workDuration * 60;
    updateDisplay();
    updateProgressRing();
    natureSound.pause();
    natureSound.currentTime = 0;
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
soundSelect.addEventListener('change', () => {
    if (isRunning) {
        const selectedSound = soundSelect.value;
        if (selectedSound === 'none') {
            natureSound.pause();
        } else {
            natureSound.src = soundFiles[selectedSound];
            natureSound.play().catch(e => console.log('Play failed:', e));
        }
    }
});

// Work duration input
workDurationInput.addEventListener('change', (e) => {
    workDuration = parseInt(e.target.value);
    saveData();
    if (!isRunning) {
        resetTimer();
    }
});

// Break duration input
breakDurationInput.addEventListener('change', (e) => {
    breakDuration = parseInt(e.target.value);
    saveData();
    if (!isRunning && mode === 'break') {
        timeLeft = breakDuration * 60;
        updateDisplay();
        updateProgressRing();
    }
});

// Dark mode toggle
darkModeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        darkModeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        localStorage.setItem('darkMode', 'false');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        localStorage.setItem('darkMode', 'true');
    }
});

// Initialize
loadData();