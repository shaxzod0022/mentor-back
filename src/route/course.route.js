const express = require("express");
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  assignUsers,
} = require("../controller/course.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const { ROLES } = require("../util/roles");

const router = express.Router();

// Protected routes for members or public?
router.get("/", protect, getAllCourses);
router.get("/:id", protect, getCourseById);

// Admin only routes
router.post(
  "/",
  protect,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  createCourse
);
router.put(
  "/:id",
  protect,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  updateCourse
);
router.delete(
  "/:id",
  protect,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  deleteCourse
);

// Course assignments
router.post(
  "/:id/assign",
  protect,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.MENTOR),
  assignUsers
);

module.exports = router;
