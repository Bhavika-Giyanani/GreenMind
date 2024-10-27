let d = new Date();
document.addEventListener("DOMContentLoaded", () => {
  let day = 0;
  const storedDayCompleted = localStorage.getItem("dayCompleted");
  const storedDateCompleted = localStorage.getItem("dateCompleted");

  // Check if today's task has already been completed
  if (storedDateCompleted === d.toDateString()) {
    day = storedDayCompleted ? parseInt(storedDayCompleted, 10) : 0;
    // Display message if today's task is already done
    document.querySelector(".content").innerHTML =
      '<p style="font-size:30px; padding-top:100px">You are done with Today\'s task✅<br>Visit again tomorrow!</p>';
    document.querySelector(
      ".button-container .button-19:nth-child(2)"
    ).style.display = "none";
    document.querySelector(
      ".button-container .button-19:nth-child(1)"
    ).style.display = "none";
    return;
  } else if (storedDayCompleted) {
    day = parseInt(storedDayCompleted, 10);
  }

  fetch("http://localhost:3000/api/content")
    .then((response) => response.json())
    .then((data) => {
      if (!data[day] || !data[day].body || !data[day].quiz) {
        console.error("No content available");
        return;
      }

      var content = data[day].body;
      const words = content.split(" ");
      let currentIndex = 0;
      const wordsPerPage = 110;
      const contentElement = document.querySelector(".content");
      var h3Element = document.querySelector("h3");
      const nextButton = document.querySelector(
        ".button-container .button-19:nth-child(2)"
      );
      const prevButton = document.querySelector(
        ".button-container .button-19:nth-child(1)"
      );

      // Function to update content based on the current index
      function updateContent() {
        h3Element.textContent = data[day].title; // Use fetched title from API
        if (currentIndex + wordsPerPage < words.length) {
          const visibleWords = words.slice(
            currentIndex,
            currentIndex + wordsPerPage
          );
          contentElement.textContent = visibleWords.join(" ");
        } else {
          const remainingWords = words.slice(currentIndex);
          contentElement.textContent = remainingWords.join(" ");
          nextButton.textContent = "Start Quiz";
        }
      }

      // Function to start the quiz
      function startQuiz() {
        h3Element.textContent = "Quiz";
        contentElement.innerHTML = `
          <div class="quiz-question">Question 1: ${
            data[day].quiz.questions[0].question1
          }</div>
          <div class="quiz-options" data-question="1">
            ${data[day].quiz.questions[0].options
              .map((option) => `<div class="option">${option}</div>`)
              .join("")}
          </div>
          <div class="quiz-question">Question 2: ${
            data[day].quiz.questions[1].question2
          }</div>
          <div class="quiz-options" data-question="2">
            ${data[day].quiz.questions[1].options
              .map((option) => `<div class="option">${option}</div>`)
              .join("")}
          </div>
        `;
        nextButton.textContent = "Submit";
        prevButton.textContent = "Reset";
        nextButton.disabled = true;

        const options = document.querySelectorAll(".option");
        options.forEach((option) => {
          option.addEventListener("click", handleOptionClick);
        });

        prevButton.addEventListener("click", resetQuiz);

        // Track the day and date completion after starting the quiz
        localStorage.setItem("dayCompleted", day + 1); // Increment for next day
        localStorage.setItem("dateCompleted", d.toDateString());

        // Prevent refresh after starting the quiz
        // window.addEventListener("beforeunload", function (event) {
        //   const confirmationMessage =
        //     "You cannot attempt the quiz after you hit refresh. Do you still want to refresh?";

        //   if (!window.confirm(confirmationMessage)) {
        //     event.preventDefault();
        // }
        // });
      }

      // Handle option selection
      function handleOptionClick(e) {
        const selectedOption = e.target;
        const question = selectedOption.closest(".quiz-options");
        const options = question.querySelectorAll(".option");
        options.forEach((option) => option.classList.remove("selected"));
        selectedOption.classList.add("selected");
        checkQuizCompletion();
      }

      function checkQuizCompletion() {
        const questions = document.querySelectorAll(".quiz-options");
        let allAnswered = true;
        questions.forEach((question) => {
          const selectedOption = question.querySelector(".option.selected");
          if (!selectedOption) {
            allAnswered = false;
          }
        });
        nextButton.disabled = !allAnswered;
      }

      function resetQuiz() {
        const options = document.querySelectorAll(".option");
        options.forEach((option) =>
          option.classList.remove("selected", "correct", "incorrect")
        );
        nextButton.disabled = true;
      }

      // function submitQuiz() {
      //   const correctAnswers = {
      //     1: data[day].quiz.questions[0].correctAnswer,
      //     2: data[day].quiz.questions[1].correctAnswer,
      //   };
      //   const questions = document.querySelectorAll(".quiz-options");
      //   let correctCount = 0;

      //   questions.forEach((question) => {
      //     const selectedOption = question.querySelector(".option.selected");
      //     const questionNumber = question.getAttribute("data-question");
      //     const correctAnswer = correctAnswers[questionNumber];

      //     if (selectedOption) {
      //       selectedOption.classList.remove("selected");
      //       if (selectedOption.textContent === correctAnswer) {
      //         selectedOption.classList.add("correct");
      //         correctCount++;
      //       } else {
      //         selectedOption.classList.add("incorrect");
      //         const correctOption = Array.from(
      //           question.querySelectorAll(".option")
      //         ).find((option) => option.textContent === correctAnswer);
      //         correctOption.classList.add("correct");
      //       }
      //     }
      //   });

      //   const buttonContainer = document.querySelector(".button-container");
      //   if (correctCount === 2) {
      //     contentElement.innerHTML =
      //       '<p style="font-size:30px; padding-top:100px">You\'ve earned 💧 5 water points!</p>';
      //   } else if (correctCount === 1) {
      //     buttonContainer.innerHTML =
      //       '<p style="padding-left:180px;font-size:16px;text-align: center; font-family: Hobo Std Medium; color:white; padding-top:10px">You\'ve earned 💧 3 water points!</p>';
      //   } else {
      //     buttonContainer.innerHTML =
      //       '<p style="padding-left:15px;font-size:16px;text-align: center; font-family: Hobo Std Medium; color:white; padding-top:10px">Every great tree started as a 🌱seed—keep growing and try again tomorrow!</p>';
      //   }

      //   nextButton.style.display = "none";
      //   prevButton.style.display = "none";
      // }

      // ^ Dailies Updation

      async function updateDailyProgress() {
        try {
          // Fetch data from localStorage
          const username = localStorage.getItem("username");
          const dayCompleted = localStorage.getItem("dayCompleted");
          const dateCompleted = localStorage.getItem("dateCompleted");

          // Create a payload object for the request
          const payload = {
            username: localStorage.getItem("username"), // Make sure to include username as it's required for the update
          };

          // Optionally include dayCompleted and dateCompleted only if they exist in localStorage
          if (dayCompleted) payload.dayCompleted = parseInt(dayCompleted);
          if (dateCompleted) payload.dateCompleted = dateCompleted;

          // Perform the fetch request to update the daily progress
          const response = await fetch("/api/updateDaily", {
            method: "PATCH", // Using PATCH for partial update
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          // Handle the response from the server
          const data = await response.json();
          if (response.ok) {
            console.log("Daily progress updated successfully:", data);
          } else {
            console.error("Error updating daily progress:", data);
          }
        } catch (error) {
          console.error("Fetch error:", error);
        }
      }

      // ^ Dailies Updation






      function submitQuiz() {
        updateDailyProgress()
        const correctAnswers = {
          1: data[day].quiz.questions[0].correctAnswer,
          2: data[day].quiz.questions[1].correctAnswer,
        };
        const questions = document.querySelectorAll(".quiz-options");
        let correctCount = 0;

        questions.forEach((question) => {
          const selectedOption = question.querySelector(".option.selected");
          const questionNumber = question.getAttribute("data-question");
          const correctAnswer = correctAnswers[questionNumber];

          if (selectedOption) {
            selectedOption.classList.remove("selected");
            if (selectedOption.textContent === correctAnswer) {
              selectedOption.classList.add("correct");
              correctCount++;
            } else {
              selectedOption.classList.add("incorrect");
              const correctOption = Array.from(
                question.querySelectorAll(".option")
              ).find((option) => option.textContent === correctAnswer);
              correctOption.classList.add("correct");
            }
          }
        });

        const buttonContainer = document.querySelector(".button-container");
        let waterPoints = 0;

        if (correctCount === 2) {
          contentElement.innerHTML =
            '<p style="font-size:30px; padding-top:100px">You\'ve earned 💧 5 water points!</p>';
          localStorage.setItem("water", 5);
          showPopup1(5);
        } else if (correctCount === 1) {
          buttonContainer.innerHTML =
            '<p style="padding-left:180px;font-size:16px;text-align: center; font-family: Hobo Std Medium; color:white; padding-top:10px">You\'ve earned 💧 3 water points!</p>';
          localStorage.setItem("water", 3);
          showPopup2(3);
        } else {
          buttonContainer.innerHTML =
            '<p style="padding-left:15px;font-size:16px;text-align: center; font-family: Hobo Std Medium; color:white; padding-top:10px">Every great tree started as a 🌱seed—keep growing and try again tomorrow!</p>';
        }

        nextButton.style.display = "none";
        prevButton.style.display = "none";

        // Fetch API to update progress in the database with water points
        fetch("/api/users", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: localStorage.getItem("username"), // Points earned (5, 3, or 0)
            water: localStorage.getItem("water"),
          }),
        })
          .then((res) => res.json())
          .then(console.log(data.water_points));
      }

      nextButton.addEventListener("click", () => {
        if (nextButton.textContent === "Submit") {
          submitQuiz();
        } else if (nextButton.textContent === "Start Quiz") {
          startQuiz();
        } else {
          currentIndex += wordsPerPage;
          updateContent();
        }
      });

      prevButton.addEventListener("click", () => {
        if (prevButton.textContent === "Reset") {
          resetQuiz();
        } else if (currentIndex - wordsPerPage >= 0) {
          currentIndex -= wordsPerPage;
          updateContent();
        }
      });

      updateContent();
    })
    .catch((error) => console.error("Error fetching content:", error));
});


   // Function to show the popup
   function showPopup1(points) {
    const popup = document.getElementById('streak-popup1');
    //const message = document.getElementById('streak-message');
    //message.textContent = `You earned ${points} streak points!`;
    popup.style.display = 'block';
  
    // Set a timeout to close the popup after 3 seconds
    setTimeout(() => {
        closePopup1();
    }, 3000); // 3000 milliseconds = 3 seconds
  }
  
  function closePopup1() {
    document.getElementById('streak-popup1').style.display = 'none';
  }


  function showPopup2(points) {
    const popup = document.getElementById('streak-popup2');
    //const message = document.getElementById('streak-message');
    //message.textContent = `You earned ${points} streak points!`;
    popup.style.display = 'block';
  
    // Set a timeout to close the popup after 3 seconds
    setTimeout(() => {
        closePopup2();
    }, 3000); // 3000 milliseconds = 3 seconds
  }

  // Function to close the popup
  function closePopup2() {
    document.getElementById('streak-popup2').style.display = 'none';
  }
