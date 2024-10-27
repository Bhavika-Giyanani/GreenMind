const quotes = [
    "Meditation is proven to improve sleep and boost your immune system.",
    "Focus on the present moment; it is all that truly exists.",
    "Let your thoughts drift away like clouds in the sky.",
    "Be still, be calm, and find your inner peace.",
    "You are centered, calm, and peaceful.",
    "Every breath you take brings you closer to serenity.",
    "Your mind is clear, your heart is open.",
    "You are in control of your thoughts, and you choose calm.",
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
  a.setContent(
    `<div class="zen-tooltip">${quotes[currentQuoteIndex]}</div>`
  );

  function updateQuote() {
    currentQuoteIndex = Math.floor(Math.random() * quotes.length);
    a.setContent(quotes[currentQuoteIndex]);
    a.setContent(
      `<div class="zen-tooltip">${quotes[currentQuoteIndex]}</div>`
    );
    a.show();

    setTimeout(() => {
      a.hide();
    }, 6000);
  }

  // Show the initial tooltip after 3 seconds
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

  // Apply the first animation
  const zenElement = document.querySelector(".zen");
  zenElement.style.animation = "meditate-first 6s steps(52) 1";

  // After the first animation ends, switch to the subsequent animation
  zenElement.addEventListener("animationend", () => {
    zenElement.style.animation = "meditate-rest 3s steps(26) infinite";
  });