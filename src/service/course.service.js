const courseRepository = require("../repository/course.repository");
const path = require("path");
const fs = require("fs");
const activityService = require("./activity.service");

class CourseService {
  async getCoursesByRoleMember(userId, role) {
    return await courseRepository.findByRoleMember(userId, role);
  }

  async getAllCourses() {
    return await courseRepository.findAll();
  }

  async getCourseById(id) {
    const course = await courseRepository.findByIdDetailed(id);
    if (!course) {
      throw new Error("Kurs topilmadi!");
    }
    return course;
  }

  async createCourse(courseData, imageFile) {
    const { name, description } = courseData;

    let imagePath = "";
    if (imageFile) {
      const uploadDir = path.join(__dirname, "../upload/courses");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${imageFile.name}`;
      imagePath = `/upload/courses/${fileName}`;
      const fullPath = path.join(uploadDir, fileName);
      
      await imageFile.mv(fullPath);
    } else {
      throw new Error("Kurs rasmi yuklanishi shart!");
    }

    const course = await courseRepository.create({
      name,
      description,
      image: imagePath,
    });

    await activityService.log(courseData.userId, "COURSE_CREATED", `"${name}" kursini yaratdi`);
    return course;
  }

  async updateCourse(id, courseData, imageFile) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new Error("Kurs topilmadi!");
    }

    const { name, description } = courseData;
    let updateData = { name, description };

    if (imageFile) {
      const uploadDir = path.join(__dirname, "../upload/courses");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Delete old image if exists
      if (course.image) {
        const oldImagePath = path.join(__dirname, "..", course.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      const fileName = `${Date.now()}-${imageFile.name}`;
      updateData.image = `/upload/courses/${fileName}`;
      const fullPath = path.join(uploadDir, fileName);
      
      await imageFile.mv(fullPath);
    }

    const updatedCourse = await courseRepository.update(id, updateData);
    await activityService.log(courseData.userId, "COURSE_UPDATED", `"${updatedCourse.name}" kursini tahrirladi`);
    return updatedCourse;
  }

  async deleteCourse(id, userId) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new Error("Kurs topilmadi!");
    }

    // Delete image file
    if (course.image) {
      const imagePath = path.join(__dirname, "..", course.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    const deletedCourse = await courseRepository.delete(id);
    await activityService.log(arguments[1] || id, "COURSE_DELETED", `"${course.name}" kursini o'chirdi`);
    return deletedCourse;
  }

  async assignUsers(id, assignments) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new Error("Kurs topilmadi!");
    }

    // Assignments should be an object: { teachers: [], mentors: [], students: [] }
    const updatedCourse = await courseRepository.updateAssignments(id, assignments);
    await activityService.log(assignments.userId, "COURSE_ASSIGNED", `"${updatedCourse.name}" kursiga foydalanuvchilarni biriktirdi`);
    return updatedCourse;
  }
}

module.exports = new CourseService();
