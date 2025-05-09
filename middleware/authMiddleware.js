require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../db/models/user");

const authMiddleware = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Неавторизованный доступ" });
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findOne({
        where: { id: decoded.id, deletedAt: null },
      });

      if (!user) {
        return res.status(403).json({ message: "Пользователь не найден" });
      }

      // Проверка ролей
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.userRole)) {
        return res.status(403).json({ message: "Недостаточно прав" });
      }

      req.user = user;
      next();
    } catch (error) {
      res
        .status(401)
        .json({ message: "Ошибка авторизации", error: error.message });
    }
  };
};

module.exports = authMiddleware;
