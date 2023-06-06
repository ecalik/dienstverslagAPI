const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

function parseJwt(token) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}

exports.isLoggedIn = (req, res, next) => {
  const token = req.get("Authorization").split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not Authenticated");
    error.statusCode = 401;
    throw error;
  }
  //console.log(decodedToken.firstName);
  //req.userId = decodedToken.userId;
  next();
};

exports.isAdmin = (req, res, next) => {
  const token = req.get("Authorization").split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.log("jwt auth dot nie");
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not Authenticated");
    error.statusCode = 401;
    throw error;
  }
  const claims = parseJwt(token);
  if (claims.role !== "admin") {
    const error = new Error("Role Not Authenticated");
    error.statusCode = 401;
    throw error;
  }

  //console.log(decodedToken.firstName);
  //req.userId = decodedToken.userId;
  next();
};
