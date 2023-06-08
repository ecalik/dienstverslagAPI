const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");
const ph = require("argon2");
const morgan = require("morgan");
require("dotenv").config();

const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const User = require("./models/userModel");

const privateKey = fs.readFileSync("server.key");
const certificate = fs.readFileSync("server.cert");

const app = express();
const logStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});

async function checkAndCreateAdminUser() {
  try {
    const user = await User.findOne({ role: "admin" });
    if (!user) {
      const password = await ph.hash(process.env.DEFAULT_USER_PW);
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

app.use(morgan("combined", { stream: logStream }));
app.use(helmet());

app.use("/report", reportRoutes);
app.use("/user", userRoutes);

mongoose
  .connect("mongodb://127.0.0.1:27017")
  .then(() => {
    checkAndCreateAdminUser().then(() => {
      console.log("DB connection succesfull");
      const server =
        //https.createServer({ key: privateKey, cert: certificate }, app)
        app.listen(process.env.PORT || 3000);
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
