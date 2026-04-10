const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notification.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, notificationController.getMyNotifications);
router.get("/unread-count", protect, notificationController.getUnreadCount);
router.put("/mark-all-read", protect, notificationController.markAllAsRead);
router.put("/:id/read", protect, notificationController.markAsRead);

module.exports = router;
