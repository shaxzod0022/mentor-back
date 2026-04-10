const jwt = require("jsonwebtoken");
const User = require("../model/user.model");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_KEY);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res
          .status(401)
          .json({ message: "Sizning hisobingiz topilmadi!" });
      }

      req.user = user;
      req.admin = user; // keeping for backward compatibility if needed
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Token yaroqsiz!" });
    }
  }
  if (!token) {
    return res
      .status(401)
      .json({ message: "Token mavjud emas. Ruxsat yo'q!" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Sizning rolingiz (${req.user.role}) ushbu amalni bajarish uchun ruxsat bermaydi!`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
