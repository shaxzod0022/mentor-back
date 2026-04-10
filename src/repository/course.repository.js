const Course = require("../model/course.model");

class CourseRepository {
  async findByRoleMember(userId, role) {
    const query = {};
    if (role === 'student') query.students = userId;
    else if (role === 'mentor') query.mentors = userId;
    else if (role === 'teacher') query.teachers = userId;
    
    return await Course.find(query).sort({ createdAt: 1 });
  }

  async findAll() {
    return await Course.find().sort({ createdAt: 1 });
  }

  async findById(id) {
    return await Course.findById(id);
  }

  async findByIdDetailed(id) {
    return await Course.findById(id)
      .populate("teachers", "firstName lastName email role")
      .populate("mentors", "firstName lastName email role")
      .populate("students", "firstName lastName email role");
  }

  async create(courseData) {
    const course = new Course(courseData);
    return await course.save();
  }

  async update(id, updateData) {
    return await Course.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Course.findByIdAndDelete(id);
  }

  async updateAssignments(id, assignments) {
    return await Course.findByIdAndUpdate(
      id,
      {
        $set: {
          teachers: assignments.teachers,
          mentors: assignments.mentors,
          students: assignments.students,
        },
      },
      { new: true },
    ).populate("teachers mentors students", "firstName lastName email role");
  }
}

module.exports = new CourseRepository();
