const { sequelize } = require("../../db/models");
const { isUUID } = require("validator");
const {
  User,
  Freelancer,
  WorkExperience,
  Education,
} = require("../../db/models/models");

const getAllFreelancers = async (req, res) => {
  try {
    const { open = false, limit = 10, offset = 0 } = req.query;
    const openFreelancers = open === "true" ? true : false;
    const includeOptions = openFreelancers
      ? [
          {
            model: User,
            attributes: ["firstName", "lastName", "email"],
          },
          {
            model: WorkExperience,
            attributes: [
              "id",
              "company",
              "position",
              "startDate",
              "endDate",
              "description",
            ],
          },
          {
            model: Education,
            attributes: [
              "id",
              "placeName",
              "fieldOfStudy",
              "degree",
              "startDate",
              "endDate",
            ],
          },
        ]
      : [];

    const freelancers = await Freelancer.findAll({
      include: includeOptions,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    if (freelancers.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No freelancers found",
      });
    }

    res.status(200).json({
      status: "success",
      data: freelancers,
    });
  } catch (error) {
    console.error("Error fetching freelancers:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const fillInfoFreelancer = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      position,
      skills = [],
      salary = null,
      formatOfWork = "remote",
      description = null,
      workPattern = null,
    } = req.body;

    const user = req.user;

    const freelancer = await Freelancer.findOne({
      where: { userId: user.id },
      transaction,
    });

    if (!freelancer) {
      return res.status(404).json({
        status: "error",
        message: "Freelancer not found",
      });
    }

    if (!position && !user.id) {
      return res.status(400).json({
        status: "error",
        message: "Didn't provided position and id",
      });
    }

    await Freelancer.update(
      {
        position: position,
        skills: skills,
        salary: salary,
        formatOfWork: formatOfWork,
        description: description,
        workPattern: workPattern,
      },
      {
        where: { userId: user.id },
        transaction,
      }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "The info about freelancer filled succesfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const deleteFreelancer = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    if (!isUUID(id)) {
      return res.status(400).json({ error: "Invalid freelancer ID" });
    }

    const freelancer = await Freelancer.findByPk(id, { transaction });

    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer not found" });
    }

    await freelancer.destroy({ transaction });
    await transaction.commit();

    res.json({
      status: "success",
      message: "Freelancer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting freelancer:", error);
    res.status(500).json({ error: error.message });
  }
};

const getFullFreelancerInfo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isUUID(id)) {
      return res.status(400).json({ error: "Invalid freelancer ID" });
    }

    const freelancer = await Freelancer.findOne({
      where: { userId: id },
      include: [
        {
          model: User,
          attributes: ["firstName", "lastName", "email", "phoneNumber"],
        },
        {
          model: WorkExperience,
          as: "workExperiences",
          attributes: [
            "id",
            "company",
            "position",
            "startDate",
            "endDate",
            "description",
          ],
        },
        {
          model: Education,
          as: "education",
          attributes: [
            "id",
            "placeName",
            "fieldOfStudy",
            "degree",
            "startDate",
            "endDate",
          ],
        },
      ],
    });

    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer not found" });
    }

    res.json({
      status: "success",
      data: freelancer,
    });
  } catch (error) {
    console.error("Error fetching freelancer info:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllFreelancers,
  fillInfoFreelancer,
  getFullFreelancerInfo,
  deleteFreelancer,
};
