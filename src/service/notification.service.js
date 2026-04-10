const notificationRepository = require("../repository/notification.repository");
const courseRepository = require("../repository/course.repository");
const userRepository = require("../repository/user.repository");
const socketManager = require("../util/socket.manager");
const { ROLES } = require("../util/roles");

class NotificationService {
  async notifyCourseMembers(courseId, senderId, type, message, link, excludeSenderId = true) {
    const course = await courseRepository.findByIdDetailed(courseId);
    if (!course) return;

    let recipients = [];
    const admins = await userRepository.find({ role: { $in: [ROLES.SUPER_ADMIN, ROLES.ADMIN] } });

    if (type === "NEW_MATERIAL") {
      // All course members + admins
      recipients = [...course.students, ...course.mentors, ...course.teachers, ...admins];
    } else if (type === "NEW_SUBMISSION") {
      // Mentors, teachers of the course + admins
      recipients = [...course.mentors, ...course.teachers, ...admins];
    }

    // Deduplicate recipients by ID
    const recipientMap = new Map();
    recipients.forEach(r => {
      if (r && r._id) {
        recipientMap.set(r._id.toString(), r);
      }
    });

    for (const [recipientId, recipient] of recipientMap.entries()) {
      if (excludeSenderId && recipientId === senderId.toString()) continue;

      // Determine dynamic link based on role
      let dynamicLink = `/admin/courses/${courseId}`;
      if (recipient.role === ROLES.STUDENT) {
        dynamicLink = `/dashboard/courses/${courseId}`;
      }

      console.log(`Generating notification for ${recipientId} (${recipient.role}): ${dynamicLink}`);

      const notification = await notificationRepository.create({
        recipient: recipientId,
        sender: senderId,
        type,
        message,
        link: dynamicLink
      });

      // Emit real-time
      socketManager.sendToUser(recipientId, "NOTIFICATION_RECEIVED", notification);
    }
  }

  async notifyUser(recipientId, senderId, type, message, courseId) {
    const user = await userRepository.findByIdAndSelect(recipientId, "role");
    
    let dynamicLink = `/admin/courses/${courseId}`;
    if (user.role === ROLES.STUDENT) {
      dynamicLink = `/dashboard/courses/${courseId}`;
    }

    const notification = await notificationRepository.create({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      link: dynamicLink
    });

    socketManager.sendToUser(recipientId, "NOTIFICATION_RECEIVED", notification);
    return notification;
  }

  async getMyNotifications(userId) {
    return await notificationRepository.findByRecipient(userId);
  }

  async markAsRead(notificationId) {
    return await notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId) {
    return await notificationRepository.markAllAsRead(userId);
  }

  async getUnreadCount(userId) {
    return await notificationRepository.countUnread(userId);
  }
}

module.exports = new NotificationService();
