const ActivityLog = require("../model/activity.model");

class ActivityService {
  async log(userId, action, details) {
    try {
      await ActivityLog.create({
        userId,
        action,
        details
      });

      // Prune old logs: Keep only the latest 100
      const count = await ActivityLog.countDocuments();
      if (count > 100) {
        const oldestLogs = await ActivityLog.find()
          .sort({ createdAt: 1 })
          .limit(count - 100);
        
        const idsToDelete = oldestLogs.map(log => log._id);
        await ActivityLog.deleteMany({ _id: { $in: idsToDelete } });
      }
    } catch (error) {
      console.error("Activity logging error:", error);
    }
  }

  async getRecentActivity() {
    // Return the latest 100 (which is the max storage anyway)
    return await ActivityLog.find()
      .populate("userId", "firstName lastName email role")
      .sort({ createdAt: -1 })
      .limit(100);
  }
}

module.exports = new ActivityService();
