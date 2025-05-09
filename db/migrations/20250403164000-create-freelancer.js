"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create freelancer table
    await queryInterface.createTable("freelancer", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID,
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: "user",
          key: "id",
        },
      },
      position: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          len: [2, 100],
        },
      },
      skills: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      salary: {
        allowNull: true,
        type: Sequelize.DECIMAL(10, 2),
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
        allowNull: true,
      },
      workPattern: {
        type: Sequelize.ENUM("5/2", "2/2", "3/2", "6/1"),
        allowNull: true,
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
    await queryInterface.dropTable("work_experience");
    await queryInterface.dropTable("freelancer");
  },
};
