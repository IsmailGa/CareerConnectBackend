const { sequelize } = require("../../db/models");
const { Employer, User } = require("../../db/models/models");

// GET all employers
const getAllEmployers = async (req, res) => {
  try {
    const employers = await Employer.findAll();

    if (!employers.length) {
      return res.status(404).json({
        status: "fail",
        message: "There are no users in the DB",
      });
    }

    res.status(200).json({
      status: "success",
      data: employers,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// GET single employer by ID
const getEmployerById = async (req, res) => {
  const { id } = req.params;

  try {
    const employer = await Employer.findOne({
      where: { userId: id },
      include: [
        {
          model: User,
          attributes: ["firstName", "lastName", "email", "phoneNumber"],
        },
      ],
    });

    if (!employer) {
      return res.status(404).json({
        status: "fail",
        message: "Employer not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: employer,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// PATCH - update employer info (existing function, slightly improved)
const fillInfoEmployer = async (req, res) => {
  const user = req.user;
  const transaction = await sequelize.transaction();

  try {
    const { companyName, companyDescription, website, location, industry } =
      req.body;

    if (!companyName || !companyDescription || !industry) {
      return res.status(400).json({
        status: "error",
        message: "companyName, companyDescription, or industry is missing",
      });
    }

    const employer = await Employer.findOne({ where: { userId: user.id } });

    if (!employer) {
      return res.status(404).json({
        status: "error",
        message: "Employer not found",
      });
    }

    await Employer.update(
      {
        companyName,
        companyDescription,
        website,
        location,
        industry,
      },
      {
        where: { userId: user.id },
        transaction,
      }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Company info updated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// DELETE employer
const deleteEmployer = async (req, res) => {
  const { id } = req.params;

  try {
    const employer = await Employer.findByPk(id);

    if (!employer) {
      return res.status(404).json({
        status: "fail",
        message: "Employer not found",
      });
    }

    await Employer.destroy({ where: { id } });

    res.status(200).json({
      status: "success",
      message: "Employer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  getAllEmployers,
  getEmployerById,
  fillInfoEmployer,
  deleteEmployer,
};
