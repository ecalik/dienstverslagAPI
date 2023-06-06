const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const userController = require("../controllers/userController");
const user = require("../models/userModel");
const authCheck = require("../middleware/auth-check");

router.get("/users", authCheck.isAdmin, userController.getUsers);
router.delete(
  "/deleteUser/:userId",
  authCheck.isAdmin,
  userController.deleteUser
);

router.put(
  "/updatePw/:userId",
  [
    body("*").trim().escape(),
    body("password").isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }),
  ],
  authCheck.isAdmin,
  userController.updatePw
);

router.put(
  "/signup",
  [
    body("*").trim().escape(),
    body("firstName").isAlpha("tr-TR").isLength({
      min: 1,
    }),
    body("lastName").isAlpha("tr-TR").isLength({
      min: 1,
    }),
    body("email")
      .normalizeEmail()
      .isEmail()
      .custom(async (value) => {
        let existingUser = "";
        existingUser = await user.findOne({ email: value });
        if (existingUser) {
          throw new Error("E-mail already in use" + existingUser);
        }
      }),
    body("password").isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }),
  ],
  authCheck.isAdmin,
  userController.signup
);

router.post("/login", userController.login);

module.exports = router;
