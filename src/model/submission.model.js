const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    submissionUrl: {
      type: String, // Path to the uploaded PDF
      required: true,
    },
    grade: {
      type: Number,
      min: 0,
      max: 10,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isGradeable: {
      type: Boolean,
      default: false, // Set to true by Mentor after review
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "graded"],
      default: "pending",
    },
    feedback: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
