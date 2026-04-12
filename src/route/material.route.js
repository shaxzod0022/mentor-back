const express = require("express");
const {
  getMaterialsByCourse,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require("../controller/material.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const { ROLES } = require("../util/roles");

const router = express.Router();

// Public routes (members of course)
router.get("/course/:courseId", protect, getMaterialsByCourse);
router.get("/:id", protect, getMaterialById);

// Admin only routes
router.post(
  "/",
  protect,
  authorize(ROLES.OWNER, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.MENTOR),
  createMaterial
);
router.put(
  "/:id",
  protect,
  authorize(ROLES.OWNER, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.MENTOR),
  updateMaterial
);
router.delete(
  "/:id",
  protect,
  authorize(ROLES.OWNER, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.MENTOR),
  deleteMaterial
);

module.exports = router;
