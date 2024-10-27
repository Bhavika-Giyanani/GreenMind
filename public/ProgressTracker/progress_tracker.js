document.addEventListener("DOMContentLoaded", function () {
  // ^Tree Image

  // Fetch the levelsCompleted value from localStorage
  // const levelsCompleted = Number(localStorage.getItem("levels_completed")) || 0;

  // mapping levels to images
  // const treeImages = [
  //   "./ProgressTracker/Stage1.png",
  //   "./ProgressTracker/Stage2.png",
  //   "./ProgressTracker/Stage3.png",
  //   "./ProgressTracker/Stage4.png",
  //   "./ProgressTracker/Stage5.png",
  // ];

  // // Select the tree image element
  // const treeImage = document.querySelector(".tree");
  // treeImage.style.backgroundImage = `url(${
  //   treeImages[levelsCompleted] || treeImages[0]
  // })`;
  // treeImage.style.backgroundPosition = "bottom center";
  // if (levelsCompleted == 1) treeImage.classList.add("stage2");
  // if (levelsCompleted == 2) treeImage.classList.add("stage3");
  // if (levelsCompleted == 3) treeImage.classList.add("stage4");
  // if (levelsCompleted == 4) treeImage.classList.add("stage5");
  // console.log("h");
  const socket = new WebSocket("ws://localhost:8081");
  let initialLoad = true; // Track if it's the first load

  socket.onopen = () => {
    console.log("Connected to WebSocket server");
    const username = localStorage.getItem("username");
    if (username) {
      socket.send(JSON.stringify({ username }));
      requestUserPoints(username);
      setInterval(() => requestUserPoints(username), 3000);
    }
  };

  // Function to show the popup
  function showPopup1(points) {
    const popup = document.getElementById("streak-popup1");
    //const message = document.getElementById('streak-message');
    //message.textContent = `You earned ${points} streak points!`;
    popup.style.display = "block";

    // Set a timeout to close the popup after 3 seconds
    setTimeout(() => {
      closePopup1();
    }, 3000); // 3000 milliseconds = 3 seconds
  }

  function closePopup1() {
    document.getElementById("streak-popup1").style.display = "none";
  }

  function showPopup2(points) {
    const popup = document.getElementById("streak-popup2");
    //const message = document.getElementById('streak-message');
    //message.textContent = `You earned ${points} streak points!`;
    popup.style.display = "block";

    // Set a timeout to close the popup after 3 seconds
    setTimeout(() => {
      closePopup2();
    }, 3000); // 3000 milliseconds = 3 seconds
  }

  // Function to close the popup
  function closePopup2() {
    document.getElementById("streak-popup2").style.display = "none";
  }

  function showPopup3() {
    const popup = document.getElementById("final-popup1");
    //const message = document.getElementById('streak-message');
    //message.textContent = `You earned ${points} streak points!`;
    popup.style.display = "block";

    // Set a timeout to close the popup after 3 seconds
    setTimeout(() => {
      closePopup3();
    }, 5000); // 3000 milliseconds = 3 seconds
  }

  function closePopup3() {
    document.getElementById("final-popup1").style.display = "none";
  }

  // Function to update tree image based on levelsCompleted
  function updateTreeImage() {
    // Fetch the levelsCompleted value from localStorage
    const levelsCompleted = Number(localStorage.getItem("levels_completed"));

    // Mapping levels to images
    const treeImages = [
      "./ProgressTracker/Stage1.png",
      "./ProgressTracker/Stage2.png",
      "./ProgressTracker/Stage3.png",
      "./ProgressTracker/Stage4.png",
      "./ProgressTracker/Stage5.png",
    ];

    // Select the tree image element
    const treeImage = document.querySelector(".tree");
    treeImage.style.backgroundImage = `url(${
      treeImages[levelsCompleted] || treeImages[0]
    })`;
    treeImage.style.backgroundPosition = "bottom center";
    console.log("inside update tree image")
    // Adjusting the class based on levelsCompleted
    treeImage.className = "tree"; // Reset any previous classes
    if (levelsCompleted === 1) treeImage.classList.add("stage2");
    if (levelsCompleted === 2) treeImage.classList.add("stage3");
    if (levelsCompleted === 3) treeImage.classList.add("stage4");
    if (levelsCompleted === 4) treeImage.classList.add("stage5");
  }

  // Initial load of the tree image based on stored level
  // updateTreeImage();

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.success === false) {
      console.error(data.message);
    } else {
      localStorage.setItem("water_points", Number(data.water_points));
      localStorage.setItem("sunlight_points", Number(data.sunlight_points));
      localStorage.setItem("soil_points", Number(data.soil_points));
      localStorage.setItem("total_points", Number(data.total_points));
      localStorage.setItem("streak_points", Number(data.streak_points));
      localStorage.setItem("streak_days", Number(data.streak_days));
      localStorage.setItem("levels_completed", Number(data.levels_completed));
      localStorage.setItem("trees_grown", Number(data.trees_grown));
      localStorage.setItem("progress", Number(data.progress));

      // Initial update on page load
      loadprogress();

      if (initialLoad) {
        // Update the tree image only on the first load
        updateTreeImage();
        console.log("inside initial load");
        initialLoad = false; // Ensure it won't update dynamically after the first load
      }

      // localStorage.clear();  //^hiten

      // console.log("Local storage updated with new points data");

      const today = new Date().toISOString().split("T")[0];
      const dateCompleted = localStorage.getItem("lastLoginDate");
      // Check if today is a new login day
      if (today !== dateCompleted) {
        if (data.streak_points === 5) {
          showPopup1(5);
        } else if (data.streak_points === 10) {
          showPopup2(10);
        }

        // Update dateCompleted in localStorage
        localStorage.setItem("lastLoginDate", today);
      }
    }
  };

  socket.onclose = () => {
    console.log("Disconnected from WebSocket server");
  };
  // updateTreeImage();

  function requestUserPoints(username) {
    socket.send(JSON.stringify({ username }));
  }

  // // Function to update tree image based on levelsCompleted
  // function updateTreeImage() {
  //   // Fetch the levelsCompleted value from localStorage
  //   const levelsCompleted = Number(localStorage.getItem("levels_completed"));

  //   // Mapping levels to images
  //   const treeImages = [
  //     "./ProgressTracker/Stage1.png",
  //     "./ProgressTracker/Stage2.png",
  //     "./ProgressTracker/Stage3.png",
  //     "./ProgressTracker/Stage4.png",
  //     "./ProgressTracker/Stage5.png",
  //   ];

  //   // Select the tree image element
  //   const treeImage = document.querySelector(".tree");
  //   treeImage.style.backgroundImage = `url(${
  //     treeImages[levelsCompleted] || treeImages[0]
  //   })`;
  //   treeImage.style.backgroundPosition = "bottom center";

  //   // Adjusting the class based on levelsCompleted
  //   treeImage.className = 'tree'; // Reset any previous classes
  //   if (levelsCompleted === 1) treeImage.classList.add("stage2");
  //   if (levelsCompleted === 2) treeImage.classList.add("stage3");
  //   if (levelsCompleted === 3) treeImage.classList.add("stage4");
  //   if (levelsCompleted === 4) treeImage.classList.add("stage5");
  // }

  // // Initial load of the tree image based on stored level
  // updateTreeImage();

  //^Hiten progress update
  const levelText = document.querySelector(".level-text");
  const button = document.querySelector(".use-points");
  let levelProgress = document.querySelector(".level-progress");
  let progress = 0;
  let total_points = parseInt(localStorage.getItem("total_points")) || 0; // Default initial points
  let levels_completed =
    parseInt(localStorage.getItem("levels_completed")) || 0;
  let trees_grown = parseInt(localStorage.getItem("trees_grown")) || 0;

  // Function to update the levelProgress bar and level text

  function loadprogress() {
    // console.log("running loadProgress function to show screen");

    let level = parseInt(Number(localStorage.getItem("levels_completed"))) || 0;
    let pro = parseInt(Number(localStorage.getItem("progress"))) || 0;
    let levelProgress = document.querySelector(".level-progress");
    // console.log("levels :", level);
    // console.log("progress :", pro);

    if (level == 0) {
      // levelUp(1); // Trigger level-up animation
      document.getElementById("tree").src = `./imgs/Stage${level + 1}.png`; // tree image stage change
      const per = (pro / 20) * 100;
      levelProgress.style.width = `${Math.min(per, 100)}%`; // Ensure it never exceeds 100%
      levelText.textContent = `Level 1 - ${Math.floor(Math.min(per, 100))}%`;
    } else if (level == 1) {
      // levelUp(2); // Trigger level-up animation
      document.getElementById("tree").src = `./imgs/Stage${level + 1}.png`; // tree image stage change
      const per = (pro / 40) * 100;
      levelProgress.style.width = `${Math.min(per, 100)}%`; // Ensure it never exceeds 100%
      levelText.textContent = `Level 2 - ${Math.floor(Math.min(per, 100))}%`;
    } else if (level == 2) {
      // levelUp(3); // Trigger level-up animation
      document.getElementById("tree").src = `./imgs/Stage${level + 1}.png`; // tree image stage change
      const per = (pro / 80) * 100;
      levelProgress.style.width = `${Math.min(per, 100)}%`; // Ensure it never exceeds 100%
      levelText.textContent = `Level 3 - ${Math.floor(Math.min(per, 100))}%`;
    } else if (level == 3) {
      // levelUp(4); // Trigger level-up animation
      document.getElementById("tree").src = `./imgs/Stage${level + 1}.png`; // tree image stage change
      const per = (pro / 120) * 100;
      levelProgress.style.width = `${Math.min(per, 100)}%`; // Ensure it never exceeds 100%
      levelText.textContent = `Level 4 - ${Math.floor(Math.min(per, 100))}%`;
    } else if (level == 4) {
      // levelUp(5); // Trigger level-up animation
      document.getElementById("tree").src = `./imgs/Stage${level + 1}.png`; // tree image stage change
      const per = (pro / 160) * 100;
      levelProgress.style.width = `${Math.min(per, 100)}%`; // Ensure it never exceeds 100%
      levelText.textContent = `Level 5 - ${Math.floor(Math.min(per, 100))}%`;
    }
  }
  button.addEventListener("click", updatelevelProgress);

  let once_done_1 = false;
  let once_done_2 = false;
  let once_done_3 = false;
  let once_done_4 = false;
  let once_done_5 = false;
  function updatelevelProgress() {
    let total_points = parseInt(localStorage.getItem("total_points")) || 0; // Default initial points
    let levels_completed =
      parseInt(localStorage.getItem("levels_completed")) || 0;
    let trees_grown = parseInt(localStorage.getItem("trees_grown")) || 0;
    let previous_level = levels_completed; // Store the previous level

    console.log("Total Points :", total_points);
    console.log("Level Completed :", levels_completed);

    if (total_points > 0 && total_points < 20) {
      levels_completed = 0;
      progress = total_points;
      
      const percentage = (progress / 20) * 100;
      levelProgress.style.width = `${Math.min(percentage, 100)}%`; // Ensure it never exceeds 100%
      levelText.textContent = `Level 1 - ${Math.floor(Math.min(percentage, 100))}%`;
    } else if (total_points >= 20 && total_points < 60) {
      total_points = total_points - 20;
      levels_completed = 1;
      progress = total_points;

      const percentage = (progress / 40) * 100;
      levelProgress.style.width = `${Math.min(percentage, 100)}%`; // Ensure it never exceeds 100%
      levelText.textContent = `Level 2 - ${Math.floor(Math.min(percentage, 100))}%`;

      // Only trigger animation if level has changed
      if (levels_completed > previous_level) {
        levelUp(2); // Trigger level-up animation for level 2
      }
    } else if (total_points >= 60 && total_points < 140) {
      total_points = total_points - 60;
      levels_completed = 2;
      progress = total_points;

      const percentage = (progress / 80) * 100;
      levelProgress.style.width = `${Math.min(percentage, 100)}%`;
      levelText.textContent = `Level 3 - ${Math.floor(Math.min(percentage, 100))}%`;

      if (levels_completed > previous_level) {
        levelUp(3); // Trigger level-up animation for level 3
      }
    } else if (total_points >= 140 && total_points < 260) {
      total_points = total_points - 140;
      levels_completed = 3;
      progress = total_points;

      const percentage = (progress / 120) * 100;
      levelProgress.style.width = `${Math.min(percentage, 100)}%`;
      levelText.textContent = `Level 4 - ${Math.floor(Math.min(percentage, 100))}%`;

      if (levels_completed > previous_level) {
        levelUp(4); // Trigger level-up animation for level 4
      }
    } else if (total_points >= 260 && total_points < 420) {
      total_points = total_points - 260;
      levels_completed = 4;
      progress = total_points;

      const percentage = (progress / 160) * 100;
      levelProgress.style.width = `${Math.min(percentage, 100)}%`;
      levelText.textContent = `Level 5 - ${Math.floor(Math.min(percentage, 100))}%`;

      if (levels_completed > previous_level) {
        levelUp(5); // Trigger level-up animation for level 5
      }
    } else if (total_points >= 420) {
      progress = 160;
      const percentage = (progress / 160) * 100;
      levelProgress.style.width = `${Math.min(percentage, 100)}%`;
      levelText.textContent = `Level 1 - ${Math.floor(Math.min(percentage, 100))}%`;

      // tree grown achievement animation
      achievementAnimation();

      trees_grown += 1;
      total_points = 0;
      levels_completed = 0;
      progress = 0;

      const username = localStorage.getItem("username");
      if (username) {
        localStorage.setItem("water_points", 0);
        localStorage.setItem("sunlight_points", 0);
        localStorage.setItem("soil_points", 0);
        localStorage.setItem("total_streak_points", 0);
        localStorage.setItem("total_points", 0);
        localStorage.setItem("levels_completed", 0);
        localStorage.setItem("progress", 0);
        localStorage.setItem("trees_grown", Number(trees_grown));

        socket.send(
          JSON.stringify({
            username: username,
            water_points: 0,
            sunlight_points: 0,
            soil_points: 0,
            total_steak_points: 0,
            total_points: 0,
            levels_completed: 0,
            progress: 0,
            trees_grown: Number(trees_grown),
          })
        );

        console.log("Points reset to 0");
      }

      const percent = (progress / 20) * 100;
      levelProgress.style.width = `${Math.min(percent, 100)}%`;
      levelText.textContent = `Level 1 - ${Math.floor(Math.min(percent, 100))}%`;
    }

    const username = localStorage.getItem("username");
    if (username) {
      localStorage.setItem("levels_completed", Number(levels_completed));
      localStorage.setItem("progress", Number(progress));
      localStorage.setItem("trees_grown", Number(trees_grown));

      // Send points update to the server
      socket.send(
        JSON.stringify({
          username: username,
          levels_completed: levels_completed,
          progress: progress,
          trees_grown: trees_grown,
        })
      );
    }
}


  // Function to handle the level-up animation
  function levelUp(num) {
    const container = document.querySelector(".game-container");

    // treeGrowLevelCheck();
    // document.getElementById("tree").src = `./imgs/Stage${num}.png`; // tree image stage change
    levelCompletionAnimation(num); //^Bhavika

    setTimeout(() => {
      updateTreeImage();
    }, 7000);

    container.style.animation = "pulse 0.5s";
    setTimeout(() => {
      container.style.animation = "";
    }, 1500);
  }

  //^ Hiten Progress update

  //^ rain.js

  let makeItRain = function (durationInSeconds) {
    // Generate the rain once
    $(".rain").empty();

    let increment = 0;
    let drops = "";
    let backDrops = "";

    while (increment < 100) {
      // Random number between 98 and 1
      let randoHundo = Math.floor(Math.random() * (98 - 1 + 1) + 1);
      // Random number between 5 and 2
      let randoFiver = Math.floor(Math.random() * (5 - 2 + 1) + 2);
      // Increment
      increment += randoFiver;

      // Add in a new raindrop with various randomizations to certain CSS properties
      drops +=
        '<div class="drop" style="left: ' +
        increment +
        "%; bottom: " +
        (randoFiver + randoFiver - 1 + 100) +
        "%; animation-delay: 0." +
        randoHundo +
        "s; animation-duration: 0.5" +
        randoHundo +
        's;"><div class="stem" style="animation-delay: 0.' +
        randoHundo +
        "s; animation-duration: 0.5" +
        randoHundo +
        's;"></div><div class="splat" style="animation-delay: 0.' +
        randoHundo +
        "s; animation-duration: 0.5" +
        randoHundo +
        's;"></div></div>';

      backDrops +=
        '<div class="drop" style="right: ' +
        increment +
        "%; bottom: " +
        (randoFiver + randoFiver - 1 + 100) +
        "%; animation-delay: 0." +
        randoHundo +
        "s; animation-duration: 0.5" +
        randoHundo +
        's;"><div class="stem" style="animation-delay: 0.' +
        randoHundo +
        "s; animation-duration: 0.5" +
        randoHundo +
        's;"></div><div class="splat" style="animation-delay: 0.' +
        randoHundo +
        "s; animation-duration: 0.5" +
        randoHundo +
        's;"></div></div>';
    }

    $(".rain.front-row").append(drops);
    $(".rain.back-row").append(backDrops);

    // Stop the rain after the specified duration
    setTimeout(function () {
      $(".rain").empty(); // Clear the rain after the duration
    }, durationInSeconds * 1000); // Convert seconds to milliseconds
  };

  //^ Tree Animation based on level completition

  function levelCompletionAnimation(newLevel) {
    let treeElement = document.querySelector(".tree");
    treeElement.classList.add(`treeTransition_to_${newLevel}`);
    setTimeout(() => {
      treeElement.classList.remove(`treeTransition_to_${newLevel}`);
    }, 7000);

    setTimeout(() => {
      updateTreeImage()
    }, 8000);

    // level_animation_flag = false;

    let zen_stylesheet = document.querySelector("#zen_stylesheet");
    zen_stylesheet.href = "./ZenGreet/Zen_Dance.css";
    setTimeout(() => {
      zen_stylesheet.href = "./ZenGreet/Zen_Greets.css";
    }, 9000);

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

    tooltipInstance.show();

    setTimeout(() => {
      tooltipInstance.hide();
    }, 5000);
    //   let zen_script = document.querySelector("#zen_script");
    //   zen_script.src = "./ZenGreet/Zen_Dance.js";
    let cloudContainer = document.querySelector(".cloud-container");
    cloudContainer.classList.add("triggered-cloud-container"); // cloud move upwards
    let darkOverlay = document.querySelector("#background-overlay");
    setTimeout(() => {
      darkOverlay.classList.add("background-overlay"); // dark background
    }, 500);

    setTimeout(() => {
      makeItRain(5); // rain begins after 1s and stops after 5s
    }, 1000);
    setTimeout(() => {
      darkOverlay.classList.remove("background-overlay"); // brightness comeback after 1s
      darkOverlay.classList.add("background-overlay-light"); // light background
      // rain begins after 1s and stops after 5s
    }, 7000);
    setTimeout(() => {
      cloudContainer.classList.remove("triggered-cloud-container"); //removing cloud moment upwards
      cloudContainer.classList.add("triggered-cloud-container-reverse"); // bringing cloud downwards takes 10s
      // setTimeout(() => {
      // }, 1000);
    }, 6000);
    setTimeout(() => {
      darkOverlay.classList.remove("background-overlay-light"); // light background
      cloudContainer.classList.remove("triggered-cloud-container-reverse");
    }, 10000);
  }

  function achievementAnimation() {
    let zen_stylesheet = document.querySelector("#zen_stylesheet");
    zen_stylesheet.href = "./ZenGreet/Zen_Achieve.css";
    setTimeout(() => {
      zen_stylesheet.href = "./ZenGreet/Zen_Greets.css";
    }, 9000);

    setTimeout(() => {
      showPopup3();
    }, 10000);
    const zenElement = document.querySelector(".zen");
    const tooltipInstance = tippy(zenElement, {
      content: "<h2>Congratulation! we did it!</h2>",
      placement: "top",
      theme: "light-border",
      allowHTML: true,
      hideOnClick: true,
      trigger: "manual",
      interactive: true, // Allows interaction with the button
    });

    tooltipInstance.show();

    setTimeout(() => {
      tooltipInstance.hide();
    }, 5000);
  }

  // function for checking level for tree growth
  // function treeGrowLevelCheck() {
  //   // achievementAnimation();
  //   //   levelCompletionAnimation();
  //   // ^ To Be provided before database updation
  //   //   let level_before = Number(localStorage.getItem("levels_completed"));
  //   let level_before = Number(localStorage.getItem("level_before"));
  //   let level_after = Number(localStorage.getItem("levels_completed"));
  //   if (level_before !== level_after && level_after != NaN) {
  //     // console.log("in");
  //     let treeElement = document.querySelector(".tree");
  //     treeElement.classList.remove(
  //       `treeTransition_from_${level_before - 1}_to_${level_before}`
  //     );
  //     treeElement.classList.add(
  //       `treeTransition_from_${level_before}_to_${level_after}`
  //     );
  //     levelCompletionAnimation();
  //   }
  // }

  // document.querySelector(".use-points").addEventListener("click", treeGrowLevelCheck);

  // ^ localStorage Dailies Work

  async function fetchDailyProgress() {
    try {
      // Fetch username from localStorage (assuming it's stored there)
      const username = localStorage.getItem("username");
      if (!username) {
        console.error("Username not found in localStorage.");
        return;
      }

      // Make the GET request to fetch daily progress from the server
      const response = await fetch(
        `http://localhost:3000/getDaily/${username}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Store dayCompleted and dateCompleted in localStorage
        if (data.dayCompleted !== undefined) {
          localStorage.setItem("dayCompleted", data.dayCompleted);
        }
        if (data.dateCompleted !== undefined) {
          localStorage.setItem("dateCompleted", data.dateCompleted);
        }

        console.log("Daily progress fetched and stored in localStorage:", data);
      } else {
        const errorData = await response.json();
        console.error("Error fetching daily progress:", errorData);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  fetchDailyProgress();
});
