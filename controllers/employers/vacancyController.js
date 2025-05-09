const Vacancy = require("../../db/models/vacancy"); // убедись что модель у тебя подключена
const sequelize = require("../../config/database");
const Employer = require("../../db/models/employer");
const { User } = require("../../db/models/models");

// GET ALL VACANCIES
const getVacancies = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const vacancies = await Vacancy.findAndCountAll({
      where: {},
      limit: limitNumber,
      offset: offset,
      order: [["createdAt", "DESC"]],
      distinct: true,
      include: [
        {
          model: Employer,
          as: "employer",
          attributes: [
            "id",
            "companyName",
            "companyDescription",
            "website",
            "location",
            "industry",
          ],
        },
      ],
    });

    if (!vacancies.rows.length) {
      return res.status(404).json({
        success: false,
        message: "No vacancies found",
      });
    }

    return res.status(200).json({
      success: true,
      data: vacancies.rows,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: vacancies.count,
        totalPages: Math.ceil(vacancies.count / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching vacancies:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET VACANCY BY ID
const getVacancyById = async (req, res) => {
  try {
    const { id } = req.params;

    const vacancy = await Vacancy.findByPk(id);

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: `No vacancy found with ID ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: vacancy,
    });
  } catch (error) {
    console.error("Error fetching vacancy:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// CREATE VACANCY
const createVacancy = async (req, res) => {
  try {
    const user = req.user;

    const {
      title,
      description,
      salary,
      formatOfWork,
      schedule,
      requirements,
      workPattern,
      workStart,
      workEnd,
      workExperience,
      location,
    } = req.body;

    if (!user.id || !title) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: employerId and title",
      });
    }

    const employer = await Employer.findOne({
      where: { userId: user.id },
    });

    if (!employer) {
      throw new Error("Cannot create vacancy: Employer does not exist");
    }

    const newVacancy = await Vacancy.create({
      employerId: employer.id,
      title: title,
      description: description,
      salary: salary,
      schedule: schedule,
      formatOfWork: formatOfWork,
      requirements: requirements,
      workPattern: workPattern,
      workStart: workStart,
      workEnd: workEnd,
      workExperience: workExperience,
      location: location,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      data: newVacancy,
    });
  } catch (error) {
    console.error("Error creating vacancy:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// DELETE VACANCY
const deleteVacancy = async (req, res) => {
  try {
    const { id } = req.params;

    const vacancy = await Vacancy.findByPk(id);
    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: "Vacancy not found",
      });
    }

    await vacancy.destroy({ force: true });

    return res.status(200).json({
      success: true,
      message: "Vacancy deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vacancy:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE VACANCY
const updateVacancy = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id, employerId } = req.params;
    const updateData = req.body;

    const vacancy = await Vacancy.findByPk(
      id,
      { where: { employerId } },
      { transaction }
    );
    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: "Vacancy not found",
      });
    }

    await vacancy.update(updateData, { transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      data: vacancy,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating vacancy:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getVacancies,
  getVacancyById,
  createVacancy,
  deleteVacancy,
  updateVacancy,
};
