const notificationService = require("../service/notification.service");

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getMyNotifications(req.user._id);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.id);
    res.status(200).json({ message: "Bildirishnoma o'qildi deb belgilandi" });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user._id);
    res.status(200).json({ message: "Barcha bildirishnomalar o'qildi deb belgilandi" });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
