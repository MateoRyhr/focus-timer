// Timer variables
let timer;
let isRunning = false;
let timeLeft = 25 * 60; // 25 minutes in seconds
let sessions = 0;
let totalFocusTime = 0;

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

// Sound files
const soundFiles = {
    rain: 'sounds/rain_1.mp3',
    forest: 'sounds/forest_1.wav',
    waves: 'sounds/ocean_1.wav'
};

// Load saved data
function loadData() {
    const savedSessions = localStorage.getItem('sessions');
    const savedTime = localStorage.getItem('focusTime');
    
    if (savedSessions) sessions = parseInt(savedSessions);
    if (savedTime) totalFocusTime = parseInt(savedTime);
    
    updateDashboard();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('sessions', sessions);
    localStorage.setItem('focusTime', totalFocusTime);
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

// Start timer
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                isRunning = false;
                sessions++;
                totalFocusTime += 25;
                saveData();
                updateDashboard();
                alert('Session completed! Take a break.');
                resetTimer();
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
    timeLeft = 25 * 60;
    updateDisplay();
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

// Initialize
loadData();
updateDisplay();