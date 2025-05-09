const express = require("express");
const { login, register, logout } = require("../controllers/auth/authControllers");
const {
  refreshAccessToken,
  validateRefreshToken,
  validateToken,
} = require("../utils/jwt/jwtGenerate");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", validateRefreshToken, logout);
router.post("/refresh", refreshAccessToken);
router.post("/validate", validateToken, (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      userRole: req.user.userRole,
    },
  });
});

module.exports = router;
