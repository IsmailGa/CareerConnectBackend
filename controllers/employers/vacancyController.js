const Vacancy = require("../../db/models/vacancy"); // убедись что модель у тебя подключена
const sequelize = require("../../config/database");
const Employer = require("../../db/models/employer");
const { User } = require("../../db/models/models");
const { Op } = require("sequelize");
const { literal } = require('sequelize');

// GET ALL VACANCIES
const getVacancies = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    let whereClause = {};

    // If user is an employer, only show their vacancies
    if (req.user && req.user.userRole === "employer") {
      // Find employer by user ID
      const employer = await Employer.findOne({ where: { userId: req.user.id } });
      if (employer) {
        whereClause.employerId = employer.id;
      }
    }

    const vacancies = await Vacancy.findAndCountAll({
      where: whereClause,
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

    // Return empty array with success status if no vacancies found
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

    const vacancy = await Vacancy.findOne({
      where: { id },
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

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: "Vacancy not found",
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
    const {
      title,
      description,
      salary,
      formatOfWork,
      requirements,
      workPattern,
      workStart,
      workEnd,
      workExperience,
      location,
    } = req.body;

    // Find employer by user id
    const EmployerModel = require("../../db/models/employer");
    const employer = await EmployerModel.findOne({ where: { userId: req.user.id } });
    if (!employer) {
      return res.status(403).json({
        success: false,
        message: "Employer not found"
      });
    }

    if (!title || !description || !workPattern) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, description, and workPattern are required",
      });
    }

    const newVacancy = await Vacancy.create({
      employerId: employer.id,
      title,
      description,
      salary,
      formatOfWork,
      requirements,
      workPattern,
      workStart,
      workEnd,
      workExperience,
      location,
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
    // Find employer by user id
    const EmployerModel = require("../../db/models/employer");
    const employer = await EmployerModel.findOne({ where: { userId: req.user.id } });
    if (!employer) {
      return res.status(403).json({
        success: false,
        message: "Employer not found"
      });
    }
    // Only delete if the vacancy belongs to this employer
    const deleted = await Vacancy.destroy({
      where: {
        id,
        employerId: employer.id
      },
      force: true
    });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Vacancy not found or you don't have permission to delete it"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Vacancy deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting vacancy:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// UPDATE VACANCY
const updateVacancy = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const updateData = req.body;

    await Vacancy.update(updateData, {
      where: { id },
      transaction,
    });

    const updatedVacancy = await Vacancy.findByPk(id, { transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      data: updatedVacancy,
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

// GET MY VACANCIES (for employer)
const getMyVacancies = async (req, res) => {
  try {
    const EmployerModel = require("../../db/models/employer");
    const employer = await EmployerModel.findOne({
      where: { userId: req.user.id },
    });
    if (!employer) {
      return res.status(403).json({
        success: false,
        message: "Employer not found",
      });
    }
    const vacancies = await Vacancy.findAll({
      where: { employerId: employer.id },
      order: [["createdAt", "DESC"]],
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
    return res.status(200).json({
      success: true,
      data: vacancies,
    });
  } catch (error) {
    console.error("Error fetching employer's vacancies:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Search vacancies by keyword (title or description)
const searchVacancies = async (req, res) => {
  try {
    const { query, suggest } = req.query;
    if (!query || query.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Query is required" });
    }
    
    const { Vacancy, Employer } = require("../../db/models/models");
    
    // Define conditions for text fields (using ILIKE)
    const textSearchConditions = [
      { title: { [Op.iLike]: `%${query}%` } },
      { description: { [Op.iLike]: `%${query}%` } },
    ];
    
    // Define conditions for enum values (using exact matching)
    // Only include these if the query exactly matches one of the enum values
    const enumSearchConditions = [];
    
    // For formatOfWork enum
    const formatOfWorkValues = [
      "internship", "fullTime", "partTime", "contract", 
      "temporary", "volunteer", "remote"
    ];
    
    // For workPattern enum
    const workPatternValues = ["5/2", "2/2", "3/2", "6/1"];
    
    // Check if the query matches or partially matches any formatOfWork value
    const normalizedQuery = query.toLowerCase().trim();
    
    // Common search terms variations mapping
    const formatVariations = {
      'full': 'fullTime',
      'part': 'partTime',
      'intern': 'internship',
      'temp': 'temporary',
      'remote': 'remote',
      'volunteer': 'volunteer',
      'contract': 'contract'
    };
    
    // Check for exact matches in formats
    const exactFormatMatch = formatOfWorkValues.find(
      format => format.toLowerCase() === normalizedQuery
    );
    if (exactFormatMatch) {
      enumSearchConditions.push({ formatOfWork: exactFormatMatch });
    } 
    // Check for variation matches like "full" for "fullTime"
    else if (formatVariations[normalizedQuery]) {
      enumSearchConditions.push({ formatOfWork: formatVariations[normalizedQuery] });
    }
    
    // Check for pattern matches
    const matchingWorkPattern = workPatternValues.find(
      pattern => pattern === normalizedQuery
    );
    if (matchingWorkPattern) {
      enumSearchConditions.push({ workPattern: matchingWorkPattern });
    }
    
    // If suggest=true, return minimal data for suggestions
    if (suggest === 'true') {
      const suggestions = await Vacancy.findAll({
        where: {
          [Op.or]: [...textSearchConditions, ...enumSearchConditions],
        },
        attributes: ['id', 'title', 'formatOfWork'],
        limit: 10,
        order: [["title", "ASC"]],
      });
      
      return res.status(200).json({ 
        success: true, 
        data: suggestions 
      });
    }
    
    // For full search
    const vacancies = await Vacancy.findAll({
      where: {
        [Op.or]: [...textSearchConditions, ...enumSearchConditions],
      },
      include: [
        {
          model: Employer,
          as: "employer",
          attributes: ["id", "companyName", "location"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    
    return res.status(200).json({ success: true, data: vacancies });
  } catch (error) {
    console.error("Error searching vacancies:", error);
    return res
      .status(500)
      .json({ 
        success: false, 
        message: "Internal server error",
        error: error.message 
      });
  }
};

module.exports = {
  getVacancies,
  getVacancyById,
  createVacancy,
  deleteVacancy,
  updateVacancy,
  getMyVacancies,
  searchVacancies,
};
