require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const vacancyRoutes = require("./routes/vacancyRouter");
const employerRoutes = require("./routes/employerRoutes");
const freelancerRoutes = require("./routes/freelancerRoutes");
const applications = require("./routes/application");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");

const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/employers", employerRoutes);
app.use("/api/v1/freelancers", freelancerRoutes);
app.use("/api/v1/vacancies", vacancyRoutes);
app.use("/api/v1/applications", applications);

app.use("*", (req, res) => {
  res.status(404).json({ status: "fail", message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
