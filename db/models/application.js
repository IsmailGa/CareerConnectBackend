"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");

module.exports = sequelize.define(
  "application",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      type: DataTypes.UUID,
    },
    freelancerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "freelancer",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    vacancyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "vacancy",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    coverLetter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    applicationDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
  },
  {
    freezeTableName: true,
    modelName: "application",
    indexes: [
      {
        unique: true,
        fields: ["freelancerId", "vacancyId"],
      },
    ],
  }
);
