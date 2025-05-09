const express = require("express");
const {
  getAllEmployers,
  fillInfoEmployer,
} = require("../controllers/employers/employerController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllEmployers);
router.patch(
  "/",
  authMiddleware(["employer", "admin", "superadmin"]),
  fillInfoEmployer
);

module.exports = router;
