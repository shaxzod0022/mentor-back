const submissionRepository = require("../repository/submission.repository");
const path = require("path");
const fs = require("fs");
const activityService = require("./activity.service");
const { ROLES } = require("../util/roles");
const notificationService = require("./notification.service");

class SubmissionService {
  async submitHomework(studentId, materialId, courseId, pdfFile) {
    if (!pdfFile || pdfFile.mimetype !== 'application/pdf') {
      throw new Error("Faqat PDF fayllarni yuklash mumkin!");
    }

    // Check if already submitted
    const existing = await submissionRepository.findOneByStudentAndMaterial(studentId, materialId);
    
    const uploadDir = path.join(__dirname, "../upload/submissions");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${pdfFile.name}`;
    const pdfPath = `/upload/submissions/${fileName}`;
    const fullPath = path.join(uploadDir, fileName);
    
    await pdfFile.mv(fullPath);

    let submission;
    if (existing) {
      // Cleanup old file
      const oldPath = path.join(__dirname, "..", existing.submissionUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      submission = await submissionRepository.update(existing._id, {
        submissionUrl: pdfPath,
        status: "pending",
        isGradeable: false,
        grade: null
      });
      await activityService.log(studentId, "HOMEWORK_RESUBMITTED", `Vazifani qayta yukladi`);
    } else {
      submission = await submissionRepository.create({
        student: studentId,
        material: materialId,
        course: courseId,
        submissionUrl: pdfPath
      });
      await activityService.log(studentId, "HOMEWORK_SUBMITTED", `Vazifani yukladi`);
    }

    // Notify mentors and admins
    await notificationService.notifyCourseMembers(
      courseId,
      studentId,
      "NEW_SUBMISSION",
      `Yangi vazifa topshirildi`,
      courseId
    );

    return submission;
  }

  async getCourseSubmissions(courseId) {
    return await submissionRepository.findByCourseId(courseId);
  }

  async getStudentSubmissions(studentId, courseId) {
    return await submissionRepository.findByStudentAndCourse(studentId, courseId);
  }

  async toggleGradingPermission(submissionId, mentorId) {
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) throw new Error("Vazifa topilmadi");

    const updated = await submissionRepository.update(submissionId, {
      isGradeable: !submission.isGradeable,
      status: submission.isGradeable ? "pending" : "reviewed"
    });

    await activityService.log(mentorId, "HOMEWORK_REVIEWED", `Vazifani baholash uchun ruxsatni ${updated.isGradeable ? 'ochdi' : 'yopdi'}`);

    // Notify student
    if (updated.isGradeable) {
      await notificationService.notifyUser(
        updated.student,
        mentorId,
        "SUBMISSION_REVIEWED",
        `Vazifangiz mentor tomonidan tekshirildi va baholashga yuborildi`,
        updated.course
      );
    }

    return updated;
  }

  async assignGrade(submissionId, gradeData, graderId, userRole) {
    const { grade, feedback } = gradeData;
    if (grade < 0 || grade > 10) throw new Error("Baho 0 va 10 oralig'ida bo'lishi kerak");

    const submission = await submissionRepository.findById(submissionId);
    if (!submission) throw new Error("Vazifa topilmadi");
    
    const isAdmin = userRole === ROLES.ADMIN || userRole === ROLES.SUPER_ADMIN;

    // 1. Restriction: Mentor must open permission first
    if (!submission.isGradeable && !isAdmin) {
      throw new Error("Vazifa hali mentor tomonidan tasdiqlanmagan!");
    }

    // 2. Immutability: Once graded, only Admin/SuperAdmin can change
    if (submission.status === 'graded' && !isAdmin) {
      throw new Error("Baho qo'yilgan. Uni faqat admin tahrirlashi mumkin!");
    }

    const updated = await submissionRepository.update(submissionId, {
      grade,
      feedback,
      gradedBy: graderId,
      status: "graded"
    });

    await activityService.log(graderId, "HOMEWORK_GRADED", `"${updated.grade}" baho qo'ydi`);

    // Notify student
    await notificationService.notifyUser(
      updated.student,
      graderId,
      "SUBMISSION_GRADED",
      `Vazifangiz baholandi: ${grade} ball`,
      updated.course
    );

    return updated;
  }
}

module.exports = new SubmissionService();
