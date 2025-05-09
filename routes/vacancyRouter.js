const express = require("express");
const {
  getVacancies,
  getVacancyById,
  createVacancy,
  deleteVacancy,
  updateVacancy,
} = require("../controllers/employers/vacancyController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateToken } = require("../utils/jwt/jwtGenerate");

const router = express.Router();

const admins = authMiddleware(["admin", "superadmin", "employer"]);
const employer = authMiddleware(["employer"]);

router.get("/", getVacancies);
router.get("/:id", getVacancyById);
router.post("/", validateToken, employer, createVacancy);
router.delete("/:id", validateToken, employer, deleteVacancy);
router.patch("/:id", validateToken, admins, updateVacancy);

module.exports = router;
