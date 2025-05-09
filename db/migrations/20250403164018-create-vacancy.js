"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("vacancy", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID,
      },
      employerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "employer",
          key: "id",
        },
        onDelete: "CASCADE", // Delete vacancies if employer is deleted
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [2, 100],
        },
      },
      salary: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      requirements: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      workPattern: {
        type: Sequelize.ENUM("5/2", "2/2", "3/2", "6/1"),
        allowNull: false,
      },
      workStart: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      workEnd: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      workExperience: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      formatOfWork: {
        type: Sequelize.ENUM(
          "internship",
          "fullTime",
          "partTime",
          "contract",
          "temporary",
          "volunteer",
          "remote"
        ),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("vacancy");
  },
};
