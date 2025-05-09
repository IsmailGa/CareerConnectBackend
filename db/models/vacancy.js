"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");

module.exports = sequelize.define(
  "vacancy",
  {
    id: {
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID,
    },
    employerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "employer",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    formatOfWork: {
      type: DataTypes.ENUM(
        "internship",
        "fullTime",
        "partTime",
        "contract",
        "temporary",
        "volunteer",
        "remote"
      ),
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [2, 100], // Example length constraint
      },
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    requirements: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    workPattern: {
      type: DataTypes.ENUM("5/2", "2/2", "3/2", "6/1"),
      allowNull: false,
    },
    workStart: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    workEnd: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    workExperience: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    freezeTableName: true,
    modelName: "vacancy",
    indexes: [
      { fields: ["employerId"] }, // For quick lookup by employer
    ],
  }
);
