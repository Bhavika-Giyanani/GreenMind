document.addEventListener('DOMContentLoaded', () => {
    const socket = new WebSocket('ws://localhost:8081');

    socket.onopen = () => {
        console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.success) {
            console.log(response.message);
        } else {
            console.error(response.message);
        }
    };

    const profileLink = document.getElementById('profile-link');
    if (profileLink) {
        console.log('Profile link element found'); // Debugging log
        profileLink.addEventListener('click', () => {
            console.log('Profile link clicked'); // Debugging log

            // Fetch the profile.html content
            fetch('./profile.html')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(html => {
                    // Insert the fetched HTML into the document body
                    document.body.insertAdjacentHTML('beforeend', html);

                    // Get the profile card element
                    const profileCard = document.getElementById('profile-card');

                    // Retrieve user data from localStorage
                    const username = localStorage.getItem('username');
                    const levelsCompleted = localStorage.getItem('levels_completed');
                    const trees_grown = localStorage.getItem('trees_grown');
                    

                    // Update the profile card with user data
                    document.getElementById('profile-username').textContent = username || 'N/A';
                    document.getElementById('levels-completed').textContent = levelsCompleted || '0';
                    document.getElementById('trees-grown').textContent = trees_grown || '0';

                    // Display the profile card
                    profileCard.style.display = 'block';

                    // Show the overlay
                    showOverlay();

                    // Load the saved profile image or set default image
                    const savedImage = localStorage.getItem('profileImage');
                    const outputImage = document.getElementById('output');
                    if (outputImage) {
                        if (savedImage) {
                            outputImage.src = savedImage;
                        } else {
                            outputImage.src = './Profile/imgs/user.png'; // Default image
                        }
                    }

                    // Add event listener for image upload
                    document.getElementById('file').addEventListener('change', (event) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const profileImage = reader.result;
                            const username = localStorage.getItem('username');

                            socket.send(JSON.stringify({ username, profileImage }));
                            localStorage.setItem('profileImage', profileImage); // Save image in localStorage
                        };
                        reader.readAsDataURL(event.target.files[0]);
                    });

                    // Add a new state to the history
                    history.pushState(null, null, location.href);
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        });

        // Close profile card
        document.addEventListener('click', (event) => {
            if (event.target.id === 'close-profile') {
                const profileCard = document.getElementById('profile-card');
                if (profileCard) {
                    profileCard.remove();
                }
                hideOverlay(); // Hide the overlay
            }
        });

        const profileimg=localStorage.getItem('profileImage');

        // Logout functionality
        document.addEventListener('click', (event) => {
            if (event.target.id === 'logout-btn') {
                // Clear user data from localStorage
                localStorage.removeItem('username');
                localStorage.removeItem('levelsCompleted');
                localStorage.removeItem('trees_grown');
                //localStorage.removeItem('profileImage'); // Clear profile image on logout
                localStorage.clear();

                // Redirect to login page
                window.location.replace('login.html');
            }
        });
    } else {
        console.error('Profile link element not found');
    }
});

function showOverlay() {
    let overlay = document.getElementById('overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'; // 40% opacity
        overlay.style.zIndex = '900'; // Ensure it is below the profile card
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'block';
}

function hideOverlay() {
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

var loadFile = function (event) {
    var image = document.getElementById("output");
    var reader = new FileReader();
    reader.onload = function(){
        image.src = reader.result;
        localStorage.setItem('profileImage', reader.result); // Save image in localStorage
    };
    reader.readAsDataURL(event.target.files[0]);
};

// Load the saved profile image on page load, or default to user.png
window.addEventListener('load', function() {
    const savedImage = localStorage.getItem('profileImage');
    const outputImage = document.getElementById('output');
    if (outputImage) {
        if (savedImage) {
            outputImage.src = savedImage;
        } else {
            outputImage.src = './Profile/imgs/user.png'; // Default image
        }
    }

    // Check if the user is logged out and redirect to login page if true
    if (window.location.pathname !== '/login.html') {
        window.history.forward();
    }

    // Override the popstate event to prevent back navigation
    window.addEventListener('popstate', function(event) {
        if (window.location.pathname !== '/login.html') {
            window.history.forward();
        }
    });
});
