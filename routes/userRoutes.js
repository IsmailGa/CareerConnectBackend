const express = require("express");
const {
  getAllUsers,
  deleteUser,
  getUserById,
  addUser,
  generateResume,
} = require("../controllers/auth/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const admins = authMiddleware(["admin", "superadmin"]);
const superAdmin = authMiddleware(["superadmin"]);
const freelancer = authMiddleware(["freelancer"]);

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.get("/download-resume/:id", freelancer ,generateResume);
router.delete("/:id", superAdmin, deleteUser);
router.post("/", admins, addUser);

module.exports = router;