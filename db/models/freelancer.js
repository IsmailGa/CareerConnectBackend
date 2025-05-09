const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.js");

module.exports = sequelize.define(
  "freelancer",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      type: DataTypes.UUID,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: "user",
        key: "id",
      },
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [2, 100],
      },
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    salary: {
      allowNull: true,
      type: DataTypes.DECIMAL(10, 2),
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
    workPattern: {
      type: DataTypes.ENUM("5/2", "2/2", "3/2", "6/1"),
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
    modelName: "freelancer",
  }
);
