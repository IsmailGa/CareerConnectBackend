"use strict";

const { Sequelize } = require("sequelize");
const sequelize = require("../../config/database.js"); // Подключение к базе данных

const User = require("./user.js");
const Freelancer = require("./freelancer.js");
const WorkExperience = require("./workExperience.js");
const Education = require("./education.js");
const SuperAdmin = require("./superadmin.js");
const Admin = require("./admin.js");
const Employer = require("./employer.js");
const Vacancy = require("./vacancy.js");
const Application = require("./application.js");

User.hasMany(SuperAdmin, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
SuperAdmin.belongsTo(User, {
  foreignKey: "userId",
});

User.hasMany(Freelancer, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
Freelancer.belongsTo(User, {
  foreignKey: "userId",
});

User.hasMany(Employer, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
Employer.belongsTo(User, {
  foreignKey: "userId",
});

Freelancer.hasMany(WorkExperience, {
  foreignKey: "freelancerId",
  onDelete: "CASCADE",
});
WorkExperience.belongsTo(Freelancer, {
  foreignKey: "freelancerId",
});

Freelancer.hasMany(Education, {
  foreignKey: "freelancerId",
  onDelete: "CASCADE",
});
Education.belongsTo(Freelancer, {
  foreignKey: "freelancerId",
});

Employer.hasMany(Vacancy, { foreignKey: "employerId" });
Vacancy.belongsTo(Employer, { foreignKey: "employerId" });

User.hasMany(Admin, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
Admin.belongsTo(User, {
  foreignKey: "userId",
});

Freelancer.hasMany(Application, { foreignKey: "freelancerId" });
Application.belongsTo(Freelancer, { foreignKey: "freelancerId" });

Vacancy.hasMany(Application, { foreignKey: "vacancyId" });
Application.belongsTo(Vacancy, { foreignKey: "vacancyId" });

module.exports = {
  sequelize,
  Sequelize,
  Freelancer,
  Education,
  WorkExperience,
  User,
  Admin,
  SuperAdmin,
  Vacancy,
  Application,
  Employer,
};
