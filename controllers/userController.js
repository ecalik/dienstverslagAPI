const ph = require("argon2");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { validationResult } = require("express-validator");
const io = require("../socket");
require("dotenv").config();

exports.getUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      //console.log(JSON.stringify(reports));
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).json({
      message: "Ongeldige invoer",
      errors: errors.array(),
    });
  }
  let hpw;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const shift = req.body.shift;
  const role = req.body.role;
  ph.hash(password)
    .then((result) => {
      hpw = result;
    })
    .then(() => {
      const user = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hpw,
        shift: shift,
        role: role,
      });
      user.save().then((result) => {
        io.getIO().emit("user", { action: "signUp" });
        res.status(201).json({
          message: "User created succesfully",
          report: result,
        });
      });
    })
    .catch((err) => console.log(err));
};

exports.updatePw = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).json({
      message: "Ongeldige invoer",
      errors: errors.array(),
    });
  }
  //console.log("In de functie controller");
  const uid = req.params.userId;
  User.findOne({ _id: uid }).then((user) => {
    if (!user) {
      const error = new Error("This uid does not exist");
      throw error;
    }
    console.log(user);
    let password = req.body.password;
    ph.hash(password)
      .then((result) => {
        return (user.password = result);
      })
      .then(() => {
        user.save().then((result) => {
          //console.log(result);
          io.getIO().emit("user", { action: "updatePw" });
          res.status(201).json({
            message: "Adjustment success",
            user: result,
          });
        });
      });
  });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("Verification error");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return ph.verify(user.password, password);
    })
    .then((equal) => {
      if (!equal) {
        const error = new Error("Verification error");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          _id: loadedUser._id.toString(),
          email: loadedUser.email,
          firstName: loadedUser.firstName,
          lastName: loadedUser.lastName,
          role: loadedUser.role,
          shift: loadedUser.shift,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res.status(200).json({
        message: "login succesful",
        token: token,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteUser = (req, res, next) => {
  const uid = req.params.userId;
  User.findOne({ _id: uid }).then((user) => {
    if (!user) {
      const error = new Error("This uid does not exist");
      throw error;
    }
    user
      .deleteOne({ _id: uid })
      .then((result) => {
        io.getIO().emit("user", { action: "deleteUser" });
        res.status(202).json({
          message: "Delete success",
          user: result,
        });
      })
      .catch((err) => console.log(err));
  });
};
