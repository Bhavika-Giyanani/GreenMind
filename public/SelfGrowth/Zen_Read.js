const quotes = [
  '"Love and compassion are necessities, not luxuries. Without them, humanity cannot survive." – Dalai Lama',
  '"Spread love everywhere you go. Let no one ever come to you without leaving happier." – Mother Teresa',
  '"If you want others to be happy, practice compassion. If you want to be happy, practice compassion." – Dalai Lama',
  '"Charity begins at home, but should not end there." – Thomas Fuller',
  '"An eye for an eye only ends up making the whole world blind." – Mahatma Gandhi',
  "Kindness is a gift everyone can afford to give.",
  "Compassion is the foundation of humanity.",
  "True charity is the desire to be useful to others.",
];

const a = tippy(document.querySelector(".zen"), {
  allowHTML: true,
  trigger: "manual",
  arrow: true,
  size: "large",
  // delay: 3,
  duration: 500,
  animation: "scale",
  hideOnClick: true,
  interactive: true, // Make the tooltip interactive
  duration: 5,
  theme: "zen-tooltip",
});

let QuoteIndex = 0;
QuoteIndex = Math.floor(Math.random() * quotes.length);
a.setContent(`<div class="zen-tooltip">${quotes[QuoteIndex]}</div>`);
setTimeout(() => {
  a.show();
  setTimeout(()=>{
    a.hide()
  },4000)
}, 4000);
// currentQuoteIndex = Math.floor(Math.random() * quotes.length);
// a.setContent(`<div class="zen-tooltip">${quotes[currentQuoteIndex]}</div>`);

// function updateQuote() {
// currentQuoteIndex = Math.floor(Math.random() * quotes.length);
// a.setContent(`<div class="zen-tooltip">${quotes[currentQuoteIndex]}</div>`);
//   a.show();

//   setTimeout(() => {
//     a.hide();
//   }, 6000);
// }

// Show the initial tooltip after 3 seconds
// const initialTimer = setTimeout(() => {
//   updateQuote();
//   a.show();
//   setTimeout(() => {
//     a.hide();
//     clearTimeout(intervalTimer);
//   }, 4000);
// }, 3000);

// Update the content every 15 seconds
// const intervalTimer = setInterval(() => {
// updateQuote();
// }, 15000);

// document.querySelector(".zen").addEventListener("click", () => {
//   clearTimeout(intervalTimer);
// });
