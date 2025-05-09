const {
  Freelancer,
  Vacancy,
  Application,
  Employer,
} = require("../../db/models/models");

const createApplication = async (req, res) => {
  const { vacancyId, coverLetter } = req.body;
  const currentUser = req.user; // Assuming user is authenticated

  const freelancer = await Freelancer.findOne({
    where: { userId: currentUser.id },
  });
  if (!freelancer) {
    return res.status(403).json({ error: "User is not a freelancer" });
  }

  const vacancy = await Vacancy.findByPk(vacancyId);
  if (!vacancy) {
    return res.status(404).json({ error: "Vacancy not found" });
  }

  const application = await Application.create({
    freelancerId: freelancer.id,
    vacancyId,
    coverLetter,
  });

  res.status(201).json(application);
};

const getVacancyApplications = async (req, res) => {
  const { vacancyId } = req.params;
  const currentUser = req.user;

  const employer = await Employer.findOne({
    where: { userId: currentUser.id },
  });
  if (!employer) {
    return res.status(403).json({ error: "User is not an employer" });
  }

  const vacancy = await Vacancy.findOne({
    where: { id: vacancyId, employerId: employer.id },
  });
  if (!vacancy) {
    return res
      .status(404)
      .json({ error: "Vacancy not found or not owned by employer" });
  }

  const applications = await Application.findAll({
    where: { vacancyId },
    include: [Freelancer],
  });

  res.json(applications);
};

const updateApplicationStatus = async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;
  const currentUser = req.user;

  const employer = await Employer.findOne({
    where: { userId: currentUser.id },
  });
  if (!employer) {
    return res.status(403).json({ error: "User is not an employer" });
  }

  const application = await Application.findByPk(applicationId, {
    include: [Vacancy],
  });
  if (!application) {
    return res.status(404).json({ error: "Application not found" });
  }

  if (application.Vacancy.employerId !== employer.id) {
    return res
      .status(403)
      .json({ error: "Not authorized to update this application" });
  }

  application.status = status;
  await application.save();

  res.json(application);
};

module.exports = {
  createApplication,
  getVacancyApplications,
  updateApplicationStatus,
};
