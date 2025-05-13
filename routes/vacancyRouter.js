const express = require("express");
const {
  getVacancies,
  getVacancyById,
  createVacancy,
  deleteVacancy,
  updateVacancy,
  getMyVacancies,
  searchVacancies,
} = require("../controllers/employers/vacancyController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateToken } = require("../utils/jwt/jwtGenerate");

const router = express.Router();

// Define role-based middleware
const userRoles = authMiddleware(["employer", "freelancer", "admin", "superadmin"]);
const employer = authMiddleware(["employer"]);
const admins = authMiddleware(["admin", "superadmin"]);

// Public routes (no authentication required)
router.get("/", getVacancies);
router.get("/search", searchVacancies);

// Authenticated routes - IMPORTANT: Specific routes need to come before generic routes with params
router.get("/my-vacancies", validateToken, employer, getMyVacancies);

// This generic route with :id parameter needs to come AFTER specific routes
router.get("/:id", getVacancyById);

// Employer-only routes
router.post("/", validateToken, employer, createVacancy);
router.delete("/:id", validateToken, employer, deleteVacancy);

// Admin routes
router.patch("/:id", validateToken, admins, updateVacancy);

module.exports = router;
