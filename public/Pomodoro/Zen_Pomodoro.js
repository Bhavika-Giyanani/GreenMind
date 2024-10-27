const quotes = [
  "Let's improve concentration and productivity together.",
  "You're on the right track.",
  "Keep going, you're doing great!",
  "Every step counts, keep moving forward.",
  "You're growing stronger every day.",
  "Believe in your journey.",
  "You're capable of achieving great things.",
  "Unstoppable today!",
];

const a = tippy(document.querySelector(".zen"), {
  content: quotes[0], // Initial content
  allowHTML: true,
  trigger: "manual",
  arrow: true,
  size: "large",
  duration: 500,
  animation: "scale",
  hideOnClick: true,
  interactive: true, // Make the tooltip interactive
  duration: 5,
});

let currentQuoteIndex = 0;
a.setContent(`<div class="zen-tooltip">${quotes[currentQuoteIndex]}</div>`);

function updateQuote() {
  currentQuoteIndex = Math.floor(Math.random() * quotes.length);
  a.setContent(`<div class="zen-tooltip">${quotes[currentQuoteIndex]}</div>`);
  a.show();

  setTimeout(() => {
    a.hide();
  }, 6000);
}

// Show the initial tooltip after 5 seconds
const initialTimer = setTimeout(() => {
  a.show();
  setTimeout(() => {
    a.hide();
  }, 4000);
}, 3000);

// Update the content every 15 seconds
const intervalTimer = setInterval(() => {
  updateQuote();
}, 15000);

document.querySelector(".zen").addEventListener("click", () => {
  clearTimeout(intervalTimer);
});
