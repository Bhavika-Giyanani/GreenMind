const zenElement = document.querySelector(".zen");
const tooltipInstance = tippy(zenElement, {
  content: "<h2>Yay! Progress on the way</h2>",
  placement: "top",
  theme: "light-border",
  allowHTML: true,
  hideOnClick: true,
  trigger: "manual",
  interactive: true, // Allows interaction with the button
});
console.log("inside zen dance script")
setTimeout(() => {
  tooltipInstance.show();
}, 5000);

setTimeout(() => {
  tooltipInstance.hide();
}, 10000);
