const Submission = require("../model/submission.model");

class SubmissionRepository {
  async create(data) {
    return await Submission.create(data);
  }

  async findById(id) {
    return await Submission.findById(id)
      .populate("student", "firstName lastName email")
      .populate("material", "name")
      .populate("course", "name")
      .populate("gradedBy", "firstName lastName");
  }

  async findByCourseId(courseId) {
    return await Submission.find({ course: courseId })
      .populate("student", "firstName lastName email")
      .populate("material", "name")
      .sort({ createdAt: -1 });
  }

  async findByStudentAndCourse(studentId, courseId) {
    return await Submission.find({ student: studentId, course: courseId })
      .populate("material", "name")
      .sort({ createdAt: -1 });
  }

  async findOneByStudentAndMaterial(studentId, materialId) {
    return await Submission.findOne({ student: studentId, material: materialId });
  }

  async update(id, data) {
    return await Submission.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Submission.findByIdAndDelete(id);
  }

  async count(query) {
    return await Submission.countDocuments(query);
  }

  async getAverageGrade(studentId, courseId) {
    const result = await Submission.aggregate([
      { $match: { student: studentId, course: courseId, status: "graded" } },
      { $group: { _id: "$student", avgGrade: { $avg: "$grade" } } }
    ]);
    return result.length > 0 ? result[0].avgGrade : 0;
  }

  async getAllGradesInCourse(courseId) {
    return await Submission.aggregate([
      { $match: { course: courseId, status: "graded" } },
      { $group: { _id: "$student", avgGrade: { $avg: "$grade" } } },
      { $sort: { avgGrade: -1 } }
    ]);
  }
}

module.exports = new SubmissionRepository();
