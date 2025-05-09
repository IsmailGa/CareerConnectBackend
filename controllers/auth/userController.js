const User = require("../../db/models/user");
const { hashPassword } = require("../../utils/bcrypt/hashPassword");
const generateResumePdf = require("../../utils/pdfMaker/pdf");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    if (!users) {
      return res.status(404).json({
        status: "fail",
        message: "There is no users in DB",
      });
    }

    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "There is no such user in DB",
      });
    }

    return res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

const addUser = async (req, res) => {
  const {
    userRole,
    firstName,
    lastName,
    phoneNumber = null,
    email,
    password,
    refreshToken = null,
  } = req.body;

  if (!userRole || !email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Required fields: userRole, email, password",
    });
  }

  // Validate and normalize userRole
  const validRoles = ["freelancer", "employer", "admin"];
  const normalizedUserRole = userRole.trim().toLowerCase();
  if (!validRoles.includes(normalizedUserRole)) {
    return res.status(400).json({
      status: "error",
      message: `Invalid userRole. Must be one of: ${validRoles.join(", ")}`,
    });
  }

  try {
    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      userRole: normalizedUserRole,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      email: email,
      password: hashedPassword,
      refreshToken: refreshToken,
    });

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        id: newUser.id,
        userRole: newUser.userRole,
        firstName: newUser.firstName,
        phoneNumber: newUser.phoneNumber,
        lastName: newUser.lastName,
        email: newUser.email,
        createdAt: newUser.createdAt,
        refreshToken: null,
      },
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to create user",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userToDelete = await User.findByPk(id);
    if (!userToDelete) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (userToDelete.userRole === "superadmin") {
      return res.status(404).json({
        status: "error",
        message: "User can't be deleted",
      });
    }

    await userToDelete.destroy();
    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const generateResume = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send("Пользователь не найден");
    }

    const pdfBuffer = await generateResumePdf(user);

    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка генерации PDF");
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  addUser,
  deleteUser,
  generateResume,
};
