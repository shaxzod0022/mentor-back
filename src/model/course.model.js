const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, // Store the path to the uploaded image
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
