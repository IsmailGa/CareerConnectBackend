const { sequelize } = require("../../db/models");
const {
  Freelancer,
  Vacancy,
  Application,
  Employer,
} = require("../../db/models/models");

const createApplication = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { vacancyId, coverLetter } = req.body;
    const currentUser = req.user;

    // Validate input
    if (!vacancyId) {
      return res.status(400).json({
        status: "error",
        message: "Vacancy ID is required",
      });
    }

    // Check if user is a freelancer
    const freelancer = await Freelancer.findOne({
      where: { userId: currentUser.id },
      transaction,
    });
    if (!freelancer) {
      await transaction.rollback();
      return res.status(403).json({
        status: "error",
        message: "User is not a freelancer",
      });
    }

    // Check if vacancy exists
    const vacancy = await Vacancy.findByPk(vacancyId, { transaction });
    if (!vacancy) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "Vacancy not found",
      });
    }

    // Check if application already exists
    const existingApplication = await Application.findOne({
      where: { freelancerId: freelancer.id, vacancyId },
      transaction,
    });
    if (existingApplication) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "You have already applied to this vacancy",
      });
    }

    // Create application
    const application = await Application.create(
      {
        freelancerId: freelancer.id,
        vacancyId,
        coverLetter: coverLetter || null,
        status: "pending",
        applicationDate: new Date(),
      },

      { transaction }
    );

    await transaction.commit();
    return res.status(201).json({
      status: "success",
      message: "Application created successfully",
      data: application,
    });
  } catch (error) {
    console.error("Apply error:", error.response?.data);
    const errorMessage =
      error.response?.data?.message || "Failed to apply for vacancy";
    store.setError(errorMessage);
    return null;
  }
};

const getVacancyApplications = async (req, res) => {
  try {
    const { vacancyId } = req.params;
    const currentUser = req.user;

    // Check if user is an employer
    const employer = await Employer.findOne({
      where: { userId: currentUser.id },
    });
    if (!employer) {
      return res.status(403).json({
        status: "error",
        message: "User is not an employer",
      });
    }

    // Check if vacancy exists and belongs to employer
    const vacancy = await Vacancy.findOne({
      where: { id: vacancyId, employerId: employer.id },
    });
    if (!vacancy) {
      return res.status(404).json({
        status: "error",
        message: "Vacancy not found or not owned by employer",
      });
    }

    // Fetch applications with freelancer details
    const applications = await Application.findAll({
      where: { vacancyId },
      include: [
        {
          model: Freelancer,
          attributes: ["id", "position", "skills", "description"],
          include: [
            {
              model: require("../../db/models/models").User,
              as: "user",
              attributes: ["firstName", "lastName", "email", "phoneNumber"],
            },
          ],
        },
      ],
    });

    return res.json({
      status: "success",
      data: applications,
    });
  } catch (error) {
    console.error("Get vacancy applications error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const updateApplicationStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const currentUser = req.user;

    // Validate input
    if (!status || !["pending", "accepted", "rejected"].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "Valid status is required (pending, accepted, rejected)",
      });
    }

    // Check if user is an employer
    const employer = await Employer.findOne({
      where: { userId: currentUser.id },
      transaction,
    });

    if (!employer) {
      await transaction.rollback();
      return res.status(403).json({
        status: "error",
        message: "User is not an employer",
      });
    }

    // Check if application exists
    const application = await Application.findByPk(applicationId, {
      include: [{ model: Vacancy }],
      transaction,
    });
    if (!application) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "Application not found",
      });
    }

    // Update status
    application.status = status;
    await application.save({ transaction });

    await transaction.commit();
    return res.json({
      status: "success",
      message: "Application status updated successfully",
      data: application,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Update application status error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const getFreelancerApplications = async (req, res) => {
  try {
    const { userId } = req.params;
    // Check if user is a freelancer
    const freelancer = await Freelancer.findOne({
      where: { userId: userId },
    });
    if (!freelancer) {
      return res.status(403).json({
        status: "error",
        message: "User is not a freelancer",
      });
    }

    // Fetch applications with vacancy and employer details
    const applications = await Application.findAll({
      where: { freelancerId: freelancer.id },
      include: [
        {
          model: Vacancy,
          attributes: ["id", "title", "salary", "description", "location"],
          include: [
            {
              model: Employer,
              attributes: ["id", "companyName"],
              include: [
                {
                  model: require("../../db/models/models").User,
                  attributes: ["firstName", "lastName", "phoneNumber", "email"],
                },
              ],
            },
          ],
        },
      ],
    });

    return res.json({
      status: "success",
      data: applications,
    });
  } catch (error) {
    console.error("Get freelancer applications error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// const countCandidatesForVacancy = async (req, res) => {
//   const { vacancyId } = req.params;

//   try {
//     const count = await Application.count({
//       where: { vacancyId },
//     });
//     return count;
//   } catch (error) {
//     console.error("Count candidates error:", error);
//     throw error;
//   }
// };

module.exports = {
  // countCandidatesForVacancy,
  createApplication,
  getVacancyApplications,
  updateApplicationStatus,
  getFreelancerApplications,
};
