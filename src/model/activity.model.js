const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g., "LOGIN", "COURSE_CREATED", "MATERIAL_DELETED"
    },
    details: {
      type: String, // Simplified details like "Matematika kursini yaratdi"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
