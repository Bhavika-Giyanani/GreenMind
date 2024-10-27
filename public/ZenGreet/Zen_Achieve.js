const zenElement = document.querySelector(".zen");
const tooltipInstance = tippy(zenElement, {
  content: "<h2>Congratulation! we did it!</h2>",
  placement: "top",
  theme: "light-border",
  allowHTML: true,
  hideOnClick: true,
  trigger:"manual",
  interactive: true, // Allows interaction with the button
});

tooltipInstance.show();

setTimeout(()=>{
    tooltipInstance.hide()
},5000)
