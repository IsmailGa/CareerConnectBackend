const { sequelize } = require("../../db/models");
const { Employer } = require("../../db/models/models");

const getAllEmployers = async (req, res) => {
  try {
    const employers = await Employer.findAll();

    if (!employers) {
      return res.status(404).json({
        status: "fail",
        message: "There is no users in DB",
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

const fillInfoEmployer = async (req, res) => {
  const user = req.user;
  const transaction = await sequelize.transaction();

  try {
    const { companyName, companyDescription, website, location, industry } =
      req.body;

    if (!companyName || !companyDescription || !industry) {
      return res.status(400).json({
        status: "error",
        message:
          "Didn't provided companyName or companyDescription or industry",
      });
    }

    const employer = await Employer.findOne({
      where: { userId: user.id },
    });

    if (!employer) {
      return res.status(404).json({
        status: "error",
        message: "Employer not found",
      });
    }

    await Employer.update(
      {
        companyName: companyName,
        companyDescription: companyDescription,
        website: website,
        location: location,
        industry: industry,
      },
      {
        where: { userId: user.id },
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "The info about company filled succesfully",
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
  fillInfoEmployer,
};
