const { sequelize } = require("../../db/models");
const { Education } = require("../../db/models/models");

const fillEducation = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id, placeName, fieldOfStudy, degree, startDate, endDate } =
      req.body;

    if (!placeName && !fieldOfStudy && !degree) {
      return res.status(400).json({
        status: "error",
        message: "Didn't provided placeName or fieldOfStudy or degree",
      });
    }

    await Education.create(
      {
        employerId: id,
        placeName: placeName,
        fieldOfStudy: fieldOfStudy,
        degree: degree,
        startDate: startDate,
        endDate: endDate,
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

const updateEducation = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id, placeName, fieldOfStudy, degree, startDate, endDate } =
      req.body;

    if (!id) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "Education ID is required",
      });
    }

    const education = await Education.findByPk(id, { transaction });
    if (!education) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "Education not found",
      });
    }

    const updates = {};
    if (placeName !== undefined) updates.placeName = placeName;
    if (fieldOfStudy !== undefined) updates.fieldOfStudy = fieldOfStudy;
    if (degree !== undefined) updates.degree = degree;
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;

    if (Object.keys(updates).length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "No valid fields provided for update",
      });
    }

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

const deleteEducation = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    if (!id) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "Education ID is required",
      });
    }

    const education = await Education.findByPk(id, { transaction });
    if (!education) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "Education not found",
      });
    }

    await education.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Education deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  fillEducation,
  updateEducation,
  deleteEducation,
};
