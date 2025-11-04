// Timer state
let timer = null;
let timeLeft = 25 * 60; // 25 minutes in seconds
let isRunning = false;
let isPaused = false;
let currentSession = 'work'; // 'work', 'shortBreak', 'longBreak'
let sessionCount = 1;
const totalSessions = 4;

// Settings
let workDuration = 25;
let shortBreakDuration = 5;
let longBreakDuration = 15;

// Mode toggle state
let isWorkMode = true; // true for work, false for rest

// DOM elements
const timeDisplay = document.getElementById('time');
const sessionTypeDisplay = document.getElementById('sessionType');
const sessionCountDisplay = document.getElementById('sessionCount');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const modeToggleBtn = document.getElementById('modeToggleBtn');
const workDurationInput = document.getElementById('workDuration');
const shortBreakDurationInput = document.getElementById('shortBreakDuration');
const longBreakDurationInput = document.getElementById('longBreakDuration');
const saveSettingsBtn = document.getElementById('saveSettings');
const progressCircle = document.querySelector('.progress-ring-circle');

// Initialize
function init() {
    updateDisplay();
    setupEventListeners();
    updateProgress();
    updateToggleButton();
}

function setupEventListeners() {
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    modeToggleBtn.addEventListener('click', toggleMode);
    saveSettingsBtn.addEventListener('click', saveSettings);
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update session type display
    let sessionText = '';
    let sessionClass = '';
    if (currentSession === 'work') {
        sessionText = 'Work Session';
        sessionClass = 'work';
    } else if (currentSession === 'shortBreak') {
        sessionText = 'Short Break';
        sessionClass = 'break';
    } else {
        sessionText = 'Long Break';
        sessionClass = 'long-break';
    }
    
    sessionTypeDisplay.textContent = sessionText;
    sessionTypeDisplay.className = `session-type ${sessionClass}`;
    sessionCountDisplay.textContent = sessionCount;
}

function updateProgress() {
    const totalTime = getTotalTime();
    const progress = (totalTime - timeLeft) / totalTime;
    const circumference = 2 * Math.PI * 140; // radius is 140
    const offset = circumference - (progress * circumference);
    
    progressCircle.style.strokeDashoffset = offset;
    progressCircle.classList.add('progress');
}

function getTotalTime() {
    if (currentSession === 'work') {
        return workDuration * 60;
    } else if (currentSession === 'shortBreak') {
        return shortBreakDuration * 60;
    } else {
        return longBreakDuration * 60;
    }
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        isPaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        timer = setInterval(() => {
            timeLeft--;
            updateDisplay();
            updateProgress();
            
            if (timeLeft <= 0) {
                completeSession();
            }
        }, 1000);
    }
}

function pauseTimer() {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        isPaused = true;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    isPaused = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    // Reset to current session's default time
    timeLeft = getTotalTime();
    updateDisplay();
    updateProgress();
}

function completeSession() {
    clearInterval(timer);
    isRunning = false;
    isPaused = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    // Play notification sound (using Web Audio API)
    playNotificationSound();
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
        let notificationText = currentSession === 'work' 
            ? 'Work session complete! Time for a break.' 
            : 'Break complete! Time to get back to work.';
        new Notification('Pomodoro Timer', { body: notificationText });
    }
    
    // Move to next session
    if (currentSession === 'work') {
        sessionCount++;
        if (sessionCount > totalSessions) {
            // Long break after completing all sessions
            currentSession = 'longBreak';
            sessionCount = 1; // Reset session count
        } else {
            currentSession = 'shortBreak';
        }
    } else {
        currentSession = 'work';
    }
    
    timeLeft = getTotalTime();
    updateDisplay();
    updateProgress();
}

function playNotificationSound() {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function updateToggleButton() {
    // Button shows the mode you'll switch TO, not the current mode
    if (isWorkMode) {
        // Currently in work mode, button shows "Rest" (to switch to rest)
        modeToggleBtn.textContent = 'Rest';
        modeToggleBtn.classList.add('rest');
    } else {
        // Currently in rest mode, button shows "Work" (to switch to work)
        modeToggleBtn.textContent = 'Work';
        modeToggleBtn.classList.remove('rest');
    }
}

function toggleMode() {
    // Only allow toggle when timer is not running
    if (isRunning) {
        return;
    }
    
    isWorkMode = !isWorkMode;
    
    // Update session and timer
    if (isWorkMode) {
        currentSession = 'work';
        timeLeft = workDuration * 60;
    } else {
        currentSession = 'shortBreak';
        timeLeft = shortBreakDuration * 60;
    }
    
    updateToggleButton();
    updateDisplay();
    updateProgress();
}

function saveSettings() {
    workDuration = parseInt(workDurationInput.value) || 25;
    shortBreakDuration = parseInt(shortBreakDurationInput.value) || 5;
    longBreakDuration = parseInt(longBreakDurationInput.value) || 15;
    
    // Reset timer with new settings
    if (!isRunning) {
        timeLeft = getTotalTime();
        updateDisplay();
        updateProgress();
    }
    
    // Show confirmation
    saveSettingsBtn.textContent = 'Saved!';
    setTimeout(() => {
        saveSettingsBtn.textContent = 'Save Settings';
    }, 2000);
}

// Request notification permission on page load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Initialize the app
init();

