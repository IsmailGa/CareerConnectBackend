const express = require("express");
const {
  getAllEmployers,
  fillInfoEmployer,
  getEmployerById,
  deleteEmployer,
} = require("../controllers/employers/employerController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllEmployers);
router.patch(
  "/",
  authMiddleware(["employer", "admin", "superadmin"]),
  fillInfoEmployer
);
router.get("/:id", getEmployerById);
router.delete(
  "/:id",
  authMiddleware(["employer", "admin", "superadmin"]),
  deleteEmployer
);

module.exports = router;
