const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_KEY, {
    expiresIn: "2h",
  });
};

module.exports = generateToken;