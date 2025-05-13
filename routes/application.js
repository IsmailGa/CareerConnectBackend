const express = require("express");
const {
  createApplication,
  getVacancyApplications,
  updateApplicationStatus,
  getFreelancerApplications,
  // countCandidatesForVacancy,
} = require("../controllers/application/applicationControllers");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new application (freelancer only)
router.post("/", authMiddleware(["freelancer"]), createApplication);

// Get applications for a vacancy (employer superadmin admin only)
router.get(
  "/vacancy/:vacancyId",
  authMiddleware(["employer", "admin", "superadmin"]),
  getVacancyApplications
);

// Update application status (employer superadmin admin only)
router.patch(
  "/:applicationId",
  authMiddleware(["employer", "admin", "superadmin"]),
  updateApplicationStatus
);

// router.get(
//   "/:vacancyId",
//   authMiddleware(["employer", "admin", "superadmin"]),
//   countCandidatesForVacancy
// );

// Get freelancer's applications (freelancer superadmin admin only)
router.get(
  "/freelancer/:userId",
  authMiddleware(["freelancer", "admin", "superadmin"]),
  getFreelancerApplications
);

module.exports = router;
