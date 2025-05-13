const User = require("../../db/models/user"); // Fixed import
const Freelancer = require("../../db/models/freelancer");
const Employer = require("../../db/models/employer");
const Admin = require("../../db/models/admin");
const SuperAdmin = require("../../db/models/superadmin");
const { hashPassword } = require("../../utils/bcrypt/hashPassword");
const { generateTokens } = require("../../utils/jwt/jwtGenerate");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  const {
    userRole = "freelancer",
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

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(409).json({
      status: "error",
      message: "User with this email already exists",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      status: "error",
      message: "Password must be at least 8 characters long",
    });
  }

  const validRoles = ["freelancer", "employer", "admin", "superadmin"];
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

    switch (newUser.userRole) {
      case "freelancer":
        await Freelancer.create({ userId: newUser.id });
        break;
      case "employer":
        await Employer.create({ userId: newUser.id });
        break;
      case "superadmin":
        await SuperAdmin.create({ userId: newUser.id });
        break;
      case "admin":
        await Admin.create({ userId: newUser.id });
        break;
    }

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

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Required fields: email, password",
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error("Login failed: User not found");
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error("Login failed: Invalid password");
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const tokenResult = await generateTokens(user.id);
    if (!tokenResult.success) {
      console.error("Login failed: Token generation error");
      return res.status(500).json({
        status: "error",
        message: tokenResult.message || "Failed to generate tokens",
      });
    }

    const { accessToken, refreshToken } = tokenResult;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      user: {
        userId: user.id,
        userRole: user.userRole,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken: accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(204).json({ message: "No active session" });
    }

    await User.update({ refreshToken: null }, { where: { refreshToken } });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict", // Для кросс-доменных запросов
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

module.exports = { register, login, logout };
