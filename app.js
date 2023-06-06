const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const User = require("./models/userModel");
const ph = require("argon2");
require("dotenv").config();

const app = express();

async function checkAndCreateAdminUser() {
  try {
    const user = await User.findOne({ role: "admin" });
    if (!user) {
      const password = await ph.hash("Password1!");
      const newUser = new User({
        firstName: "Admin",
        lastName: "Admin",
        email: "admin@morssinkhofplastics.nl",
        shift: "DD",
        role: "admin",
        password: password,
      });
      await newUser.save();
      console.log("Admin user created successfully");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

const authenticatedUsers = {};

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/report", reportRoutes);
app.use("/user", userRoutes);

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    checkAndCreateAdminUser().then(() => {
      console.log("DB connection succesfull");
      const server = app.listen(3000);
      const io = require("./socket").init(server);
      io.on("connection", (socket) => {
        // Handle new socket connections
        console.log("client connected to socket");
        // Listen for authentication event
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
