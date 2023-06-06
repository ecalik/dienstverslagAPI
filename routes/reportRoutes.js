const express = require("express");

const router = express.Router();

const reportController = require("../controllers/reportController");
const authCheck = require("../middleware/auth-check");

router.post("/post", authCheck.isLoggedIn, reportController.postReport);
router.delete(
  "/deleteReport/:reportId",
  authCheck.isAdmin,
  reportController.deleteReport
);
router.put(
  "/post/:reportId",
  authCheck.isAdmin,
  reportController.archiveReport
);
router.get("/post", authCheck.isLoggedIn, reportController.getReports);

module.exports = router;
