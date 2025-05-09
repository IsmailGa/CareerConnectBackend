const { sequelize } = require("../../db/models");
const { WorkExperience } = require("../../db/models/models");

const fillWorkExperience = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id, company, position, startDate, endDate, description } = req.body;

    if (!company && !position) {
      return res.status(400).json({
        status: "error",
        message: "Didn't provided company or position",
      });
    }

    await WorkExperience.create(
      {
        freelancerId: id,
        company: company,
        position: position,
        startDate: startDate,
        endDate: endDate,
        description: description,
      },
      {
        transaction,
      }
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

const getWorkExperience = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "Didn't provided id",
    });
  }

  try {
    const workExperience = await WorkExperience.findAll({
      where: {
        freelancerId: id,
      },
    });

    if (!workExperience) {
      return res.status(404).json({
        status: "error",
        message: "Work experience not found",
      });
    }

    return res.status(200).json({
      success: true,
      workExperience,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const updateWorkExperience = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { workId, fId, company, position, startDate, endDate, description } =
      req.body;

    // Check if ID is provided
    if (!id && !fId) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "IDs is required",
      });
    }

    // Find the education record
    const education = await WorkExperience.findByPk(
      workId,
      {
        where: {
          freelancerId: fId,
        },
      },
      { transaction }
    );
    if (!education) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "Education not found",
      });
    }

    // Create an object with only the provided fields
    const updates = {};
    if (company !== undefined) updates.company = company;
    if (position !== undefined) updates.position = position;
    if (degree !== undefined) updates.degree = degree;
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (description !== undefined) updates.description = description;

    // Check if there are any fields to update
    if (Object.keys(updates).length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "No valid fields provided for update",
      });
    }

    // Perform the partial update
    await education.update(updates, { transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Education updated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const deleteWorkExperience = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "Didn't provided id",
    });
  }

  try {
    const workExperience = await WorkExperience.findByPk(id);
    if (!workExperience) {
      return res.status(404).json({
        status: "error",
        message: "Work experience not found",
      });
    }

    await workExperience.destroy({ force: true });

    return res.status(200).json({
      success: true,
      message: "Work experience deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  fillWorkExperience,
  getWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
};
