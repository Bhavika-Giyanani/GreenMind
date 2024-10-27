const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const { body, validationResult } = require("express-validator");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/GreenMind", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  profileImage: { type: String, default: "./Profile/imgs/user.png" },
  login_date: { type: Date },
  total_streak_points: Number,
  streak_points: Number,
  streak_days: { type: Number, default: 0 },
  water_points: Number,
  sunlight_points: Number,
  soil_points: Number,
  total_points: Number,
  levels_completed: Number,
  trees_grown:Number,
  progress:Number


});
const User = mongoose.model("Users", userSchema);

// ^ Local dailies
const dailiesSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  dayCompleted: Number,
  dateCompleted: String,
});
const Daily = mongoose.model("dailies", dailiesSchema);
// ^ Local dailies

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Handle form submission with validation for registration
app.post(
  "/submit",
  [
    body("username")
      .notEmpty()
      .withMessage("Username cannot be empty.")
      .custom(async (username) => {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          throw new Error("Username already in use.");
        }
      }),
    body("email")
      .isEmail()
      .withMessage("Invalid email address.")
      .custom(async (email) => {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error("Email already in use.");
        }
      }),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      return res.status(400).json({ errors: errorMessages });
    }

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      profileImage: "./Profile/imgs/user.png",
      total_streak_points: 0,
      streak_points: 0,
      streak_days: 0,
      water_points: 0,
      sunlight_points: 0,
      soil_points: 0,
      total_points: 0,
      levels_completed: 0,
      trees_grown:0,
      progress:0
    });

    const newDaily = new Daily({
      username: req.body.username,
      dayCompleted: 0,
      dateCompleted: "",
    });

    try {
      await newUser.save();
      await newDaily.save();
      res.status(200).send("Registered successfully!");
    } catch (err) {
      res.status(500).json({ errors: ["Error saving data."] });
    }
  }
);

// Login and streak points
// Login and streak points
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
      // Fetch user from the database
      const user = await User.findOne({ username });

      // Check if username exists
      if (!user) {
          return res.status(401).json({ message: 'Username does not exist' }); // Specific message for username not found
      }

      // Check if password matches
      if (user.password !== password) {
          return res.status(401).json({ message: 'Password is incorrect' }); // Specific message for wrong password
      }

      // Streak and point logic
      const currentDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

      if (!user.login_date) {
          // First login case
          user.login_date = currentDate;
          user.streak_days = 1;
          user.streak_points = 5;
          user.total_streak_points = 5; // Initialize total_streak_points with the first streak_points
      } else {
          const lastLoginDate = new Date(user.login_date);
          const dayDifference = Math.floor((new Date(currentDate) - lastLoginDate) / (1000 * 60 * 60 * 24));

          if (dayDifference === 1) {
              // Consecutive day login
              user.streak_days += 1;

              if (user.streak_days === 7) {
                  // On the 7th day, reward with 10 points
                  user.streak_points += 10;
                  user.total_streak_points += 10;  // Add 10 points to total_streak_points
              } else if (user.streak_days === 8) {
                  // On the 8th day, reset streak_points and streak_days
                  user.streak_days = 1;  // Reset streak_days to 1 (after 7-day streak)
                  user.streak_points = 5; // Reset streak_points to 5 on the 8th day
              } else {
                  // Add 5 points for consecutive streaks (days 1 to 6)
                  user.streak_points += 5;
                  user.total_streak_points += 5; // Add the earned points to total_streak_points
              }
          } else if (dayDifference > 1) {
              // Streak broken - reset streak but DO NOT deduct points from total_points
              user.streak_days = 1;
              user.streak_points = 5;
              user.total_streak_points += 5;  // Reset streak_points, but previously earned points stay in total_streak_points
          }

          user.login_date = currentDate; // Update login date
      }

      // Calculate total_points as the sum of individual points plus total_streak_points
      user.total_points = (user.water_points || 0) + 
                          (user.sunlight_points || 0) + 
                          (user.soil_points || 0) + 
                          (user.total_streak_points || 0);  // Total points keep previously earned streak points intact

      // Save user data to the database
      await user.save();

      console.log(`Login - Total Points: ${user.total_points}`);

      // Respond with login success
      res.json({
          message: 'Login successful',
          streak_points: user.streak_points,
          streak_days: user.streak_days,
          total_points: user.total_points,
          login_date: user.login_date
      });
  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
  }
});


// Handle password change request
app.post(
  "/change_password",
  [
    body("username").notEmpty().withMessage("Username cannot be empty."),
    body("password")
      .notEmpty()
      .withMessage("Current password cannot be empty."),
    body("new_password")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      return res.status(400).json({ errors: errorMessages });
    }

    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        return res.status(400).json({ errors: ["User does not exist."] });
      }

      if (user.password !== req.body.password) {
        return res
          .status(400)
          .json({ errors: ["Incorrect current password."] });
      }

      if (req.body.new_password !== req.body.confirm_password) {
        return res.status(400).json({
          errors: ["New password and confirm password do not match."],
        });
      }

      user.password = req.body.new_password;
      await user.save();

      res.status(200).send("Password changed successfully!");
    } catch (err) {
      res.status(500).json({ errors: ["Error changing password."] });
    }
  }
);

// Fetch content for the Self-Growth Area
const contentSchema = new mongoose.Schema({
  day: Number,
  title: String,
  body: String,
  quiz: {
    questions: [
      {
        question1: String,
        options: [String],
        correctAnswer: String,
      },
      {
        question2: String,
        options: [String],
        correctAnswer: String,
      },
    ],
  },
});

const Content = mongoose.model("Content", contentSchema, "Content");

app.get("/api/content", async (req, res) => {
  const contents = await Content.find({});
  res.json(contents);
});

// Fetch water points of a user
app.get("/api/users/:username", async (req, res) => {
  let uname = req.params.username;
  const response = await User.find({ username: uname }).select("water_points");
  res.json(response);
});

// Update water points of a user
app.patch("/api/users", async (req, res) => {
  try {
    const uname = req.body.username;
    const water = req.body.water;
    console.log(typeof water);
    // Ensure the username is provided
    if (!uname) {
      return res.status(400).json({ error: "Username is required." });
    }

    // Find the user by username
    const user = await User.findOne({ username: uname });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Debug: Check the current value of water_points
    console.log("Current water_points:", user.water_points);

    // Ensure water_points is a number before incrementing
    if (isNaN(user.water_points)) {
      return res.status(400).json({ error: "Invalid water_points value." });
    }

    if (water == "5") user.water_points += 5;
    if (water == "3") user.water_points += 3;

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: "Points updated successfully", user });
  } catch (error) {
    console.error("Error updating points:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/// Store sunlight points in the existing "User" collection
app.patch("/update_sunlight_points", async (req, res) => {
  const { username, sunlight_points } = req.body;

  if (!username || sunlight_points === undefined) {
    console.log("Invalid input:", req.body);
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    const result = await User.updateOne(
      { username },
      { $set: { sunlight_points } }
    );

    if (result.nModified === 0) {
      console.log(`No user found with username: ${username}`);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log(`Sunlight points updated for ${username}`);
    return res.json({ success: true });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update soil points of a user
app.patch("/update_soil_points", async (req, res) => {
  const { username, soil_points } = req.body;

  if (!username || soil_points === undefined) {
    console.log("Invalid input:", req.body);
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      console.log(`No user found with username: ${username}`);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update soil points and save
    user.soil_points += 5;
    await user.save();

    console.log(`Soil points updated for ${username}`);
    return res.json({
      success: true,
      message: "Soil points updated successfully!",
    });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ^ Dailies
app.patch("/api/updateDaily", async (req, res) => {
  const { username, dayCompleted, dateCompleted } = req.body;

  try {
    // Prepare the update object
    const updateFields = {};
    if (dayCompleted !== undefined) updateFields.dayCompleted = dayCompleted;
    if (dateCompleted !== undefined) updateFields.dateCompleted = dateCompleted;

    // Perform partial update using $set
    const updatedDaily = await Daily.findOneAndUpdate(
      { username }, // Find by username
      { $set: updateFields }, // Update only the provided fields
      { new: true } // Return the updated document
    );

    if (updatedDaily) {
      res.status(200).json({
        message: "Daily progress updated successfully",
        updatedDaily,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating daily progress", error });
  }
});

app.get("/getDaily/:username", async (req, res) => {
  const { username } = req.params;

  try {
    // Find the document by username
    const daily = await Daily.findOne({ username });

    if (daily) {
      res.status(200).json({
        dayCompleted: daily.dayCompleted,
        dateCompleted: daily.dateCompleted,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching daily progress", error });
  }
});

// ^ Dailies

// web socket for profile
const wss = new WebSocket.Server({ port: 8081 });
wss.on("connection", (ws) => {
  //console.log('Client connected');

  ws.on("message", async (message) => {
    const data = JSON.parse(message);
    const { username, profileImage } = data;

    try {
      const user = await User.findOne({ username });
      if (user) {
        user.profileImage = profileImage || user.profileImage;
        await user.save();
        ws.send(
          JSON.stringify({
            success: true,
            message: "Profile image updated successfully!",
          })
        );
      } else {
        ws.send(JSON.stringify({ success: false, message: "User not found." }));
      }
    } catch (err) {
      ws.send(
        JSON.stringify({
          success: false,
          message: "Error updating profile image.",
        })
      );
    }
  });

  ws.on("close", () => {
    //console.log('Client disconnected');
  });
});

//Web Socket for fetching and updating points and levels  and streak points
wss.on('connection', (ws) => {
  //console.log('Client connected');

  ws.on('message', async (message) => {
      const data = JSON.parse(message);
      const { username } = data;

      const sendUserPoints = async () => {
          try {
              const user = await User.findOne({ username });
              if (user) {
                  // Calculate total_points including total_streak_points
                  const total_points = 
                      (user.water_points || 0) + 
                      (user.sunlight_points || 0) + 
                      (user.soil_points || 0) + 
                      (user.total_streak_points || 0);

                  // Update total_points in the database (if necessary)
                  user.total_points = total_points;
                  await user.save();  // Save the updated user data to the database

                  // Prepare data to send to the client
                  const userData = {
                      water_points: user.water_points || 0,
                      sunlight_points: user.sunlight_points || 0,
                      soil_points: user.soil_points || 0,
                      total_points: total_points,
                      streak_points: user.streak_points || 0,
                      total_streak_points: user.total_streak_points || 0,
                      streak_days: user.streak_days || 0,
                      levels_completed: user.levels_completed || 0,
                      trees_grown: user.trees_grown || 0,
                      progress: user.progress || 0
                  };

                  // Send updated user data to the client
                  ws.send(JSON.stringify(userData));
              } else {
                  ws.send(JSON.stringify({ success: false, message: 'User not found.' }));
              }
          } catch (err) {
              ws.send(JSON.stringify({ success: false, message: 'Error updating data.' }));
          }
      };

      // Send initial data immediately upon connection
      sendUserPoints();

      // Set interval to update and send user points every 3 seconds
      const intervalId = setInterval(sendUserPoints, 3000);

      // Handle WebSocket close event
      ws.on('close', () => {
          //console.log('Client disconnected');
          clearInterval(intervalId);  // Clear interval when client disconnects
      });
  });
});

















//^Hiten Progress tracker

wss.on('connection', (ws) => {
  //console.log('Client connected');

  ws.on('message', async (message) => {
      const data = JSON.parse(message);
      const { username,water_points, sunlight_points, soil_points, total_points, levels_completed,trees_grown , progress } = data;
      if (username && water_points === 0 && sunlight_points === 0 && soil_points === 0 && total_points === 0 && levels_completed === 0 && progress === 0) {
          // Handle reset points request
          console.log('Reset request received for user:', username); // Debugging log
          try {
              const user = await User.findOne({ username });
              if (user) {
                  user.water_points = 0;
                  user.sunlight_points = 0;
                  user.soil_points = 0;
                  user.total_points = 0;
                  user.levels_completed = 0;
                  user.progress = 0;
                  user.total_streak_points =0;
                  user.trees_grown = Number(trees_grown);
                  console.log("trees_grown updated in databse :", Number(trees_grown));
                  

                  await user.save();
                  console.log('Points reset to zero in database for user:', username); // Debugging log
                  ws.send(JSON.stringify({ success: true, message: 'Points reset successfully!' }));
              } else {
                  ws.send(JSON.stringify({ success: false, message: 'User not found.' }));
              }
          } catch (err) {
              ws.send(JSON.stringify({ success: false, message: 'Error resetting points.' }));
          }
      }
      ws.on('close', () => {
          //console.log('Client disconnected');
      });
  });
});


wss.on('connection', (ws) => {
  //console.log('Client connected');

  ws.on('message', async (message) => {
      const data = JSON.parse(message);
      const { username, levels_completed,trees_grown , progress } = data;
      if (username && !isNaN(levels_completed) && !isNaN(progress) && !isNaN(trees_grown)) {
          // Handle reset points request
          console.log('update progress and levels for user:', username); // Debugging log
          try {
              const user = await User.findOne({ username });
              if (user) {
                  user.levels_completed = levels_completed;
                  console.log("level updated in databse :", Number(levels_completed));
                  user.progress = progress;
                  console.log("progress updated in databse :", Number(progress));
                  user.trees_grown = Number(trees_grown);
                  

                  await user.save();
                  console.log('progress and levels updated  in database for user:', username); // Debugging log
                  ws.send(JSON.stringify({ success: true, message: 'Progress updated successfully!' }));
              } else {
                  ws.send(JSON.stringify({ success: false, message: 'User not found.' }));
              }
          } catch (err) {
              ws.send(JSON.stringify({ success: false, message: 'Error updating progress.' }));
          }
      }
      ws.on('close', () => {
          //console.log('Client disconnected');
      
      });
  });
});

//^ Hiten  progress tracker updataion














// Serve the HTML forms
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "splash.html"));
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
  console.log("http://localhost:3000");
});
