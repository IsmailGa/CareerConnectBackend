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
  getWorkExperiences,
  updateWorkExperience,
} = require("../controllers/freelancers/workExperienceController");
const {
  fillEducation,
  deleteEducation,
  updateEducation,
  getEducation,
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
router.get(
  "/educations/:id",
  // authMiddleware(["freelancer", "admin", "superadmin"]),
  getEducation
);
router.post(
  "/educations",
  authMiddleware(["freelancer", "admin", "superadmin"]),
  fillEducation
);
router.delete(
  "/educations/:id",
  authMiddleware(["freelancer", "admin", "superadmin"]),
  deleteEducation
);
router.patch(
  "/educations",
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
  "/work-experience/:id",
  authMiddleware(["freelancer", "admin", "superadmin"]),
  deleteWorkExperience
);
router.patch(
  "/work-experience/:id",
  authMiddleware(["freelancer", "admin", "superadmin"]),
  updateWorkExperience
);
router.get(
  "/work-experience/:id",
  authMiddleware(["freelancer", "admin", "superadmin"]),
  getWorkExperiences
);
router.patch(
  "/work-experience",
  authMiddleware(["freelancer", "admin", "superadmin"])
);

module.exports = router;
