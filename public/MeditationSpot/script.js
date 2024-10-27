document.addEventListener("DOMContentLoaded", function () {
    setActiveTab('guided');
});

function setActiveTab(tabId) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    document.getElementById(tabId + 'Tab').classList.add('active');

    const timers = document.querySelectorAll('.timer');
    timers.forEach(timer => timer.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

let audioElement = document.getElementById('audioTask');

// Function to hide player and show card list
function showCardList() {
    document.getElementById('meditationPlayer').style.display = 'none';
    document.querySelectorAll('.meditation-card').forEach(card => card.style.display = 'inline-block');
}

// Handle Back button functionality
document.getElementById('backBtn').addEventListener('click', function () {
    showCardList();
});

// Handle ESC key to go back to the list of songs
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        showCardList();
    }
});

// Handle card clicks to display the music player and hide other cards
document.querySelectorAll('.meditation-card').forEach(card => {
    card.addEventListener('click', function () {
        // Hide all meditation cards except the selected one
        document.querySelectorAll('.meditation-card').forEach(otherCard => {
            otherCard.style.display = 'none';
        });

        // Show the selected meditation player
        const sound = this.dataset.sound;
        const imageSrc = this.querySelector('img').src;

        const selectedImage = document.getElementById('selectedMeditationImage');
        selectedImage.src = imageSrc;

        // Center the selected image
        const player = document.getElementById('meditationPlayer');
        player.style.display = 'block';
        player.style.position = 'fixed';
        player.style.top = '70%';
        player.style.left = '50%';
        player.style.transform = 'translate(-50%, -50%)';

        // Set and play the audio file
        audioElement.src = sound;
        audioElement.currentTime = 0;
        audioElement.muted = false; // Ensure audio is not muted
        audioElement.play().catch(error => {
            console.error('Audio playback failed:', error);
        });

        // Set the play button to pause icon
        document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
    });
});

// Handle Play/Pause functionality
document.getElementById('playPauseBtn').addEventListener('click', function () {
    const playIcon = '<i class="fas fa-play"></i>';
    const pauseIcon = '<i class="fas fa-pause"></i>';

    if (audioElement.paused) {
        audioElement.play().catch(error => {
            console.error('Audio playback failed:', error);
        });
        this.innerHTML = pauseIcon;
    } else {
        audioElement.pause();
        this.innerHTML = playIcon;
    }
});

// Handle Forward functionality
document.getElementById('forwardBtn').addEventListener('click', function () {
    audioElement.currentTime += 10;
});

// Handle Backward functionality
document.getElementById('backwardBtn').addEventListener('click', function () {
    audioElement.currentTime -= 10;
});

// Update progress bar and handle clicks
audioElement.addEventListener('timeupdate', function () {
    const progress = (audioElement.currentTime / audioElement.duration) * 100;
    const progressBar = document.getElementById('progressBar');
    progressBar.value = progress;
    progressBar.style.background = `linear-gradient(to right, green ${progress}%, white ${progress}%)`;
});

document.getElementById('progressBar').addEventListener('input', function () {  
    const newTime = (this.value / 100) * audioElement.duration;
    audioElement.currentTime = newTime;
});

// Daily task limit
const SOIL_POINTS_KEY = 'soil_points'; // Key for storing soil points
let soil_points = parseInt(localStorage.getItem(SOIL_POINTS_KEY)) || 0;
const USERNAME_KEY = 'username'; // Key for storing username

// Get today's date as a string (YYYY-MM-DD)
function getTodayDate() {
    const today = new Date().toLocaleDateString();
    return today; // Returns date in YYYY-MM-DD format
}

// Function to check if user has earned soil_points today
function checksoilpointsStatus() {
    const today = getTodayDate();

    // Get the date the user last earned soil_points
    const lastCompletedDate = localStorage.getItem('lastCompletedDate');

    // If there's no lastCompletedDate or it's a new day, allow the user to earn soil_points
    if (lastCompletedDate !== today) {
        //document.getElementById('status').textContent = 'Listen to the Meditation to earn 5 soil_points!';
    } else {
        //document.getElementById('status').textContent = 'You have already earned soil_points today. Come back tomorrow!';
    }

    // Display the user's current total soil_points
    const soil_points = localStorage.getItem(SOIL_POINTS_KEY) || 0;
    //document.getElementById('soilpoints').textContent = `Total soil_points: ${soil_points}`;
}

// Function to award soil_points when the task is completed (audio ends)
async function awardsoilpoints() {
    const today = getTodayDate();

    // Check if the user has already earned soil_points today
    const lastCompletedDate = localStorage.getItem('lastCompletedDate');
    if (lastCompletedDate !== today) {
        // Award 5 soil_points if the task is completed for the first time today

        const soil_points = parseInt(localStorage.getItem(SOIL_POINTS_KEY) || '0', 10);
        localStorage.setItem(SOIL_POINTS_KEY, soil_points + 5);  // Increment soil_points by 5
        localStorage.setItem('lastCompletedDate', today);  // Update the date when soil_points were last earned
        await updateSoilPointsInDatabase();  // Call the function to update in database
        //document.getElementById('status').textContent = 'You have earned 5 soil points today!';
        //document.getElementById('soilpoints').textContent = `Total soil points: ${soil_points + 5}`;
        
        showPopup(5);

    } else {
        document.getElementById('status').textContent = 'You have already earned soil_points today. Come back tomorrow!';
    }
}

// Add event listener for audio completion
const audioTask = document.getElementById('audioTask');

// When the audio ends, award soil_points
audioTask.addEventListener('ended', awardsoilpoints);

// Check task status and soil_points on page load
checksoilpointsStatus();

// Update soil points in the database using Fetch API
async function updateSoilPointsInDatabase() {
    const username = localStorage.getItem(USERNAME_KEY);
    const soil_points = parseInt(localStorage.getItem(SOIL_POINTS_KEY)) || 0;

    if (!username) {
        console.log("User is not logged in.");
        return;
    }

    try {
        const response = await fetch('/update_soil_points', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                soil_points: soil_points
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Soil points updated successfully in the database.');
        } else {
            console.error('Error updating soil points:', data.message);
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

// Handle login and store username in localStorage
async function loginUser(username, password) {
    try {
        const response = await fetch('/login', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Login successful:', data);
            soil_points = data.soil_points;
            console.log('Fetched soil points:', soil_points);

            // Store the points and username in localStorage
            localStorage.setItem(SOIL_POINTS_KEY, soil_points);
            localStorage.setItem(USERNAME_KEY, username); // Store username
        } else {
            console.log("Login failed:", data);
        }
    } catch (err) {
        console.error('Error in loginUser:', err);
    }
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