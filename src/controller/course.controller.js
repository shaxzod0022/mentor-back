const courseService = require("../service/course.service");

const getAllCourses = async (req, res) => {
  try {
    const role = req.user?.role;
    const userId = req.user?._id;
    
    let courses;
    if (role === 'student' || role === 'mentor' || role === 'teacher') {
      courses = await courseService.getCoursesByRoleMember(userId, role);
    } else {
      courses = await courseService.getAllCourses();
    }
    
    res.status(200).json(courses.reverse());
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const role = req.user?.role;
    const userId = req.user?._id;
    const course = await courseService.getCourseById(req.params.id);

    // Permission check for staff/students
    if (role === 'student' || role === 'mentor' || role === 'teacher') {
      const isMember = 
        (role === 'student' && course.students.some(s => s._id.toString() === userId.toString())) ||
        (role === 'mentor' && course.mentors.some(m => m._id.toString() === userId.toString())) ||
        (role === 'teacher' && course.teachers.some(t => t._id.toString() === userId.toString()));
      
      if (!isMember) {
        return res.status(403).json({ message: "Sizda ushbu kursga kirish huquqi yo'q!" });
      }
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const course = await courseService.createCourse({ ...req.body, userId: req.user._id }, req.files?.image);
    res.status(201).json({
      message: "Kurs muvaffaqiyatli yaratildi",
      course,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await courseService.updateCourse(
      req.params.id,
      { ...req.body, userId: req.user._id },
      req.files?.image
    );
    res.status(200).json({
      message: "Kurs muvaffaqiyatli yangilandi",
      course,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    await courseService.deleteCourse(req.params.id, req.user._id);
    res.status(200).json({ message: "Kurs muvaffaqiyatli o'chirildi" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const assignUsers = async (req, res) => {
  try {
    const role = req.user.role;
    let assignments = { ...req.body, userId: req.user._id };

    // Restriction: Mentors and Teachers can only change students and mentors
    if (role === 'mentor' || role === 'teacher') {
      const course = await courseService.getCourseById(req.params.id);
      assignments.teachers = course.teachers.map(t => t._id); // Protect teachers
      
      if (role === 'mentor') {
        assignments.mentors = course.mentors.map(m => m._id); // Protect mentors for mentor role
      }
      // Students (for both) and mentors (for teacher) from req.body remains
    }

    const updatedCourse = await courseService.assignUsers(req.params.id, assignments);
    res.status(200).json({
      message: "Foydalanuvchilar muvaffaqiyatli biriktirildi",
      course: updatedCourse,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  assignUsers,
};
