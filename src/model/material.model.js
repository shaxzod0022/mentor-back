const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    pdfUrl: {
      type: String, // Store the path to the uploaded PDF file
    },
    videoUrl: {
      type: String, // Store YouTube video link
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);
