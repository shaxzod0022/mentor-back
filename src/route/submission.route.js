const express = require("express");
const {
  submitHomework,
  getCourseSubmissions,
  getStudentSubmissions,
  toggleGradingPermission,
  assignGrade,
  deleteSubmission,
  rejectSubmission
} = require("../controller/submission.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const { ROLES } = require("../util/roles");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize(ROLES.STUDENT),
  submitHomework
);

router.get(
  "/my-submissions/:courseId",
  protect,
  authorize(ROLES.STUDENT),
  getStudentSubmissions
);

router.get(
  "/course/:courseId",
  protect,
  authorize(ROLES.OWNER, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.MENTOR),
  getCourseSubmissions
);

router.patch(
  "/:id/status",
  protect,
  authorize(ROLES.OWNER, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.MENTOR),
  toggleGradingPermission
);

router.patch(
  "/:id/grade",
  protect,
  authorize(ROLES.OWNER, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  assignGrade
);

router.patch(
  "/:id/reject",
  protect,
  authorize(ROLES.OWNER, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.MENTOR),
  rejectSubmission
);

router.delete(
  "/:id",
  protect,
  authorize(ROLES.OWNER, ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER),
  deleteSubmission
);

module.exports = router;
