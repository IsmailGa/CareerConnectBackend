const { sequelize } = require("../../db/models");
const { WorkExperience, Freelancer } = require("../../db/models/models");

const fillWorkExperience = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { userId, company, position, startDate, endDate, description } =
      req.body;

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "Freelancer ID is required",
      });
    }

    if (!company && !position) {
      return res.status(400).json({
        status: "error",
        message: "Didn't provided company or position",
      });
    }

    const freelancer = await Freelancer.findOne({
      where: {
        userId: userId,
      },
    });

    if (!freelancer) {
      return res.status(404).json({
        status: "error",
        message: "Freelancer not found",
      });
    }

    await WorkExperience.create(
      {
        freelancerId: freelancer.id,
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

const getWorkExperiences = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "Didn't provided id",
    });
  }

  const freelancer = await Freelancer.findOne({
    where: {
      userId: id,
    },
  });

  if (!freelancer) {
    return res.status(404).json({
      status: "error",
      message: "Freelancer not found",
    });
  }

  try {
    const workExperiences = await WorkExperience.findAll({
      where: {
        freelancerId: freelancer.id,
      },
    });

    if (!workExperiences) {
      return res.status(404).json({
        status: "error",
        message: "Work experience not found",
      });
    }

    return res.status(200).json({
      success: true,
      workExperiences: workExperiences,
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
    const { company, position, startDate, endDate, description } = req.body;
    const workId = req.params.id;

    const user = req.user;

    const freelancer = await Freelancer.findOne({
      where: {
        userId: user.id,
      },
    });

    // Check if ID is provided
    if (!freelancer) {
      await transaction.rollback();
      return res.status(400).json({
        status: "error",
        message: "there is no such freelancer",
      });
    }

    // Find the education record
    const workExperience = await WorkExperience.findOne({
      where: {
        id: workId,
        freelancerId: freelancer.id,
      },
      transaction,
    });
    if (!workExperience) {
      await transaction.rollback();
      return res.status(404).json({
        status: "error",
        message: "Work experience not found",
      });
    }

    // Create an object with only the provided fields
    const updates = {};
    if (company !== undefined) updates.company = company;
    if (position !== undefined) updates.position = position;
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
    await workExperience.update(updates, { transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Work experience updated successfully",
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
  getWorkExperiences,
  updateWorkExperience,
  deleteWorkExperience,
};
