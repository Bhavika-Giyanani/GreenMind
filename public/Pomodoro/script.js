// Constants for localStorage keys
const SUNLIGHT_POINTS_KEY = 'sunlight_points'; // Key for storing sunlight points
let sunlight_points = parseInt(localStorage.getItem(SUNLIGHT_POINTS_KEY)) || 0;
const LAST_AWARD_DATE_KEY = 'last_award_date'; // Key for storing the last award date
const TIMER_STATE_KEY = 'timer_state'; // Key for storing timer state
const USERNAME_KEY = 'username'; // Key for storing username

let timers = {
    focus: { default: 1, current: 1, remaining: 1/10 * 60, interval: null, running: false },
    shortBreak: { default: 5, current: 5, remaining: 5 * 60, interval: null, running: false },
    longBreak: { default: 15, current: 15, remaining: 15 * 60, interval: null, running: false }
};

// Load saved sunlight points from localStorage
sunlight_points = parseInt(localStorage.getItem(SUNLIGHT_POINTS_KEY)) || 0;
updateSunlightPointsDisplay(); // Function to update the displayed points

// Load the timer state from localStorage on page load

function toggleTimer(type) {
    if (timers[type].running) {
        pauseTimer(type);
    } else {
        resumeTimer(type);
    }
}

function startTimer(type) {
    if (timers[type].interval) return; // Prevent starting multiple intervals

    timers[type].running = true;
    document.getElementById(`${type}Control`).textContent = 'Pause'; // Change button to "Pause"

    timers[type].interval = setInterval(() => {
        if (timers[type].remaining <= 0) {
            clearInterval(timers[type].interval);
            timers[type].interval = null;
            timers[type].running = false;
            document.getElementById(`${type}Control`).textContent = 'Start';
            document.title = `${type.charAt(0).toUpperCase() + type.slice(1)} Timer - Time's up!`;
            document.getElementById('timeoutSound').play(); // Play timeout sound
            resetTimer(type);
            if (type === 'focus') {
                awardSunlightPointsOncePerDay(); // Attempt to award 5 sunlight points once per day
            }
            return;
        }

        timers[type].remaining--; // Countdown in seconds
        const minutes = Math.floor(timers[type].remaining / 60);
        const seconds = timers[type].remaining % 60;
        document.getElementById(`${type}Timer`).textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Update the tab title with the current countdown
        updateTabTitle(type);
    }, 1000);
}

function pauseTimer(type) {
    clearInterval(timers[type].interval); // Stop the timer
    timers[type].interval = null;
    timers[type].running = false;
    document.getElementById(`${type}Control`).textContent = 'Resume'; // Change button to "Resume"
}

function resumeTimer(type) {
    timers[type].running = true;
    document.getElementById(`${type}Control`).textContent = 'Pause'; // Change button to "Pause"
    startTimer(type); // Resume the timer from where it was paused
}

function resetTimer(type) {
    pauseTimer(type); // Ensure timer is paused
    timers[type].remaining = timers[type].default * 60; // Reset remaining time
    document.getElementById(`${type}Timer`).textContent = `${String(timers[type].default).padStart(2, '0')}:00`;
    document.getElementById(`${type}Control`).textContent = 'Start'; // Reset button text to "Start"
}



// Handling tab activation and status updates
function setActiveTab(type) {
    document.querySelectorAll('.timer').forEach(timer => timer.classList.remove('active'));
    document.getElementById(type).classList.add('active');

    const statusText = {
        focus: 'Time To Focus!',
        shortBreak: 'Take a Short Break!',
        longBreak: 'Take a Long Break!'
    };
    document.querySelector('.status').textContent = statusText[type]; // Update the status text
}

// Update time based on slider input
function updateTime(type, value) {
    timers[type].current = value;
    timers[type].remaining = value * 60; // Update remaining time
    document.getElementById(`${type}Timer`).textContent = `${String(value).padStart(2, '0')}:00`;
    updateTabTitle(type); // Update tab title with new time
}



// WEB PAGE TAB TIMER
function updateTabTitle(type) {
    const minutes = Math.floor(timers[type].remaining / 60);
    const seconds = timers[type].remaining % 60;
    document.title = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} - ${type.charAt(0).toUpperCase() + type.slice(1)} Timer`;
}
// Function to update the displayed sunlight points
function updateSunlightPointsDisplay() {
    document.getElementById('sunlightPoints').textContent = `Sunlight Points: ${sunlight_points}`;
}




/// Award sunlight points but only once per day
async function awardSunlightPointsOncePerDay() {
    console.log('Checking if sunlight points can be awarded...');
    
    const today = new Date().toLocaleDateString();
    const lastAwardDate = localStorage.getItem(LAST_AWARD_DATE_KEY);
    
    // Check if points were already awarded today
    if (lastAwardDate !== today) {
        const username = localStorage.getItem(USERNAME_KEY);
        if (!username) {
            console.log("User is not logged in.");
            return;
        }

        // Update sunlight points locally
        sunlight_points += 5;
        localStorage.setItem(SUNLIGHT_POINTS_KEY, sunlight_points);
        localStorage.setItem(LAST_AWARD_DATE_KEY, today); // Save today's date to local storage

        updateSunlightPointsDisplay(); // Update the display to show new points
        
        showPopup(5);


        // Send the updated sunlight points to the database
        try {
            await updateSunlightPointsInDatabase(username, sunlight_points);
            console.log("Sunlight points successfully updated in the database.");
        } catch (error) {
            console.error('Error updating sunlight points in the database:', error);
        }
    } else {
        console.log("Sunlight points already awarded for today.");
    }
}

// Function to send sunlight points to the server
async function updateSunlightPointsInDatabase(username, sunlight_points) {
    try {
        const response = await fetch('/update_sunlight_points', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, sunlight_points })
        });

        const data = await response.json();
        if (data.success) {
            console.log('Sunlight points successfully updated in the database.');
        } else {
            console.error('Failed to update sunlight points:', data.message);
        }
    } catch (error) {
        console.error('Error in updateSunlightPointsInDatabase:', error);
    }
}

// Function to update the displayed sunlight points on the page
function updateSunlightPointsDisplay() {
    //document.getElementById('sunlightPoints').textContent = `Sunlight Points: ${sunlight_points}`;
}










// Function to update the displayed sunlight points
function updateSunlightPointsDisplay() {
    //document.getElementById('sunlightPoints').textContent = `Sunlight Points: ${sunlight_points}`;
}



   // Function to show the popup
   function showPopup(points) {
    const popup = document.getElementById('streak-popup');
    //const message = document.getElementById('streak-message');
    //message.textContent = `You earned ${points} streak points!`;
    popup.style.display = 'block';
  
    // Set a timeout to close the popup after 3 seconds
    setTimeout(() => {
        closePopup();
    }, 3000); // 3000 milliseconds = 3 seconds
  }
  
  // Function to close the popup
  function closePopup() {
    document.getElementById('streak-popup').style.display = 'none';
  }
  