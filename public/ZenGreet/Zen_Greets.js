const messages = [
    "Hello! I’m Zen. Welcome to GreenMind!",
    "GreenMind nurtures you and the environment.",
    "Grow this virtual tree to Level 7 and we'll plant a real one!",
    "Read, quiz, and earn water points in Self-Growth.",
    "Feed your mind with self-growth content—what you absorb shapes your growth.",
    "Complete a 25-min Pomodoro and gain sunlight points.",
    "Use the Pomodoro technique to harness your time and dedication, just like the unstoppable sun.",
    "Meditate for inner growth and earn soil points.",
    "Meditate to stay rooted in morals and humanity, fostering growth like deep roots in soil.",
    "Visit daily to collect streak points!",
    "Use your points here to help your tree grow.",
    "Let's start your journey!",
    "Grow Ethically, Plant Sustainably."
];

let currentMessageIndex = 0;
const zenElement = document.querySelector('.zen');

// Function to create the tooltip content with a next button
function getTooltipContent(message) {
    return `
        <div class="zen-tooltip">
            <p>${message}</p>
            <button id="tooltip-next-button">Next</button>
        </div>
    `;
}

// Initialize Tippy with the first message
const tooltipInstance = tippy(zenElement, {
    content: getTooltipContent(messages[currentMessageIndex]),
    trigger: 'manual',
    placement: 'top',
    theme: 'light-border',
    allowHTML: true,
    interactive: true,  // Allows interaction with the button
});

// Show the tooltip initially
tooltipInstance.show();

// Listen for clicks on the document level
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'tooltip-next-button') {
        // Update the message index
        currentMessageIndex++;
        
        if (currentMessageIndex < messages.length) {
            // Update the tooltip content
            tooltipInstance.setContent(getTooltipContent(messages[currentMessageIndex]));
        } else {
            // Hide the tooltip when all messages are shown
            tooltipInstance.hide();
        }
    }
});
