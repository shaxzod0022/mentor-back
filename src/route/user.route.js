const express = require("express");
const {
  createUser,
  loginUser,
  getUserProfile,
  updateUser,
  deleteUser,
  getAllUsers,
  getDashboardStats,
} = require("../controller/user.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
// const {
//   forgotPassword,
//   resetPassword,
// } = require("../controller/auth.controller");
const { ROLES } = require("../util/roles");

const router = express.Router();

// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password/:token", resetPassword);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", protect, getUserProfile);
router.get("/", protect, authorize(ROLES.OWNER, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.MENTOR), getAllUsers);
router.get("/stats", protect, authorize(ROLES.OWNER, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.MENTOR, ROLES.STUDENT), getDashboardStats);

// Creation, Update, Deletion involve hierarchy checks inside controllers
router.post("/", protect, createUser);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

router.post("/verify-token", protect, (req, res) => {
  res.status(200).json({ isValid: true, user: req.user });
});

module.exports = router;
