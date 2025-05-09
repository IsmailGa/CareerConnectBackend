"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");

module.exports = sequelize.define(
  "user",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      type: DataTypes.UUID,
    },
    userRole: {
      type: DataTypes.ENUM("freelancer", "employer", "admin", "superadmin"),
      defaultValue: "freelancer",
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false, // Name is required
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false, // Last name is required
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Unique email
      validate: {
        isEmail: true, // Checking format of email
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false, // Password is required
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true, // Refresh token is optional
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: true,
        len: [10, 15],
      },
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    paranoid: true,
    freezeTableName: true,
    modelName: "user",
    indexes: [
      {
        unique: true,
        fields: ["email"], // Index for email
      },
    ],
  }
);
