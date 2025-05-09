const express = require("express");
const {
  getAllFreelancers,
  fillInfoFreelancer,
  getFullFreelancerInfo,
} = require("../controllers/freelancers/freelancerController");
const authMiddleware = require("../middleware/authMiddleware");
const {
  fillWorkExperience,
  deleteWorkExperience,
  getWorkExperience,
} = require("../controllers/freelancers/workExperienceController");
const {
  fillEducation,
  deleteEducation,
  updateEducation,
} = require("../controllers/freelancers/educationController");

const router = express.Router();

// FREELANCERS
router.get(
  "/",
  // authMiddleware(["employer", "admin", "superadmin"]),
  getAllFreelancers
);
router.get(
  "/:id",
  authMiddleware(["employer", "freelancer", "admin", "superadmin"]),
  getFullFreelancerInfo
);
router.patch(
  "/",
  authMiddleware(["freelancer", "admin", "superadmin"]),
  fillInfoFreelancer
);
// EDUCATION
router.post(
  "/education",
  authMiddleware(["freelancer", "admin", "superadmin"]),
  fillEducation
);
router.delete(
  "/education",
  authMiddleware(["freelancer", "admin", "superadmin"]),
  deleteEducation
);
router.patch(
  "/education",
  authMiddleware(["freelancer", "admin", "superadmin"]),
  updateEducation
);
// WORK EXPERIENCE
router.post(
  "/work-experience",
  authMiddleware(["freelancer", "admin", "superadmin"]),
  fillWorkExperience
);
router.delete(
  "/work-experience",
  authMiddleware(["freelancer", "admin", "superadmin"]),
  deleteWorkExperience
);
router.get(
  "/work-experience/:id",
  authMiddleware(["freelancer", "admin", "superadmin"]),
  getWorkExperience
);
router.patch(
  "/work-experience",
  authMiddleware(["freelancer", "admin", "superadmin"])
);

module.exports = router;
