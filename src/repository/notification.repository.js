const Notification = require("../model/notification.model");

class NotificationRepository {
  async create(notificationData) {
    const notification = new Notification(notificationData);
    return await notification.save();
  }

  async findByRecipient(userId) {
    return await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate("sender", "firstName lastName role")
      .limit(50);
  }

  async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  }

  async countUnread(userId) {
    return await Notification.countDocuments({ recipient: userId, isRead: false });
  }
}

module.exports = new NotificationRepository();
