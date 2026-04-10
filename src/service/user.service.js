const userRepository = require("../repository/user.repository");
const Course = require("../model/course.model");
const Material = require("../model/material.model");
const submissionRepository = require("../repository/submission.repository");
const bcrypt = require("bcrypt");
const generateToken = require("../util/generateToken");
const activityService = require("./activity.service");
const { ROLES, canCreateRole, ROLE_HIERARCHY } = require("../util/roles");

class UserService {
  async createUser(creatorRole, userData) {
    const { firstName, lastName, email, password, role } = userData;

    // 1. Role hierarchy check
    if (!canCreateRole(creatorRole, role)) {
      throw new Error(`Sizda ${role} rolini yaratish uchun huquq yo'q!`);
    }

    // 2. Check if user exists
    const existUser = await userRepository.findByEmail(email);
    if (existUser) {
      throw new Error("Bu emailga tegishli foydalanuvchi mavjud!");
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user
    const newUser = await userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || ROLES.STUDENT,
    });

    await activityService.log(
      userData.userId || arguments[1] || 'system',
      "USER_CREATED",
      `Yangi foydalanuvchi qo'shildi: ${firstName} ${lastName} (${role})`
    );

    return newUser;
  }

  async loginUser(email, password) {
    if (!email || !password) {
      throw new Error("Email va parol kiritilishi shart!");
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Bunday email mavjud emas!");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Parol noto‘g‘ri!");
    }

    const token = generateToken(user);
    
    // Update last login and Log activity
    await Promise.all([
      userRepository.update(user._id, { lastLogin: new Date() }),
      activityService.log(user._id, "LOGIN", "Tizimga kirdi")
    ]);

    return { token, user };
  }

  async getUserProfile(userId) {
    const user = await userRepository.findByIdAndSelect(userId, "-password");
    if (!user) {
      throw new Error("Foydalanuvchi topilmadi");
    }
    return user;
  }

  async updateUser(userId, updateData, modifierRole) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("Foydalanuvchi topilmadi");
    }

    const { firstName, lastName, email, newPassword, role } = updateData;
    let updatedFields = { firstName, lastName, email };

    // Hierarchy check for role update
    if (role && role !== user.role) {
      if (!canCreateRole(modifierRole, role)) {
        throw new Error("Sizda ushbu rolni o'zgartirishga ruxsat yo'q!");
      }
      updatedFields.role = role;
    }

    if (newPassword && newPassword.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updatedFields.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await userRepository.update(userId, updatedFields);
    await activityService.log(modifierRole.userId || modifierRole, "USER_UPDATED", `${user.firstName} ${user.lastName} ma'lumotlarini tahrirladi`);
    return updatedUser;
  }

  async deleteUser(targetId, initiatorId, initiatorRole) {
    if (targetId === initiatorId) {
      throw new Error("O'z-o'zingizni o'chirib yubora olmaysiz!");
    }

    const user = await userRepository.findById(targetId);
    if (!user) {
      throw new Error("Foydalanuvchi topilmadi");
    }

    if (!canCreateRole(initiatorRole, user.role)) {
      throw new Error("Ushbu foydalanuvchini o'chirishga ruxsat yo'q!");
    }

    const deletedUser = await userRepository.delete(targetId);
    await activityService.log(initiatorId, "USER_DELETED", `${user.firstName} ${user.lastName} foydalanuvchisini o'chirdi`);
    return deletedUser;
  }

  async getAllUsers(params, requesterRole) {
    const { page = 1, limit = 10, role, search } = params;
    const skip = (page - 1) * limit;
    
    let query = {};

    // Restriction: ADMIN cannot see SUPER_ADMIN
    if (requesterRole === ROLES.ADMIN) {
      query.role = { $ne: ROLES.SUPER_ADMIN };
    }

    // Restriction: TEACHER cannot see ADMIN or SUPER_ADMIN
    if (requesterRole === ROLES.TEACHER) {
      query.role = { $nin: [ROLES.SUPER_ADMIN, ROLES.ADMIN] };
    }

    if (role && role !== 'all') {
      // If filtering by role, ensure it doesn't bypass the restriction
      if (requesterRole === ROLES.ADMIN && role === ROLES.SUPER_ADMIN) {
        throw new Error("Sizda ushbu rolni ko'rish huquqi yo'q!");
      }
      if (requesterRole === ROLES.TEACHER && (role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN)) {
        throw new Error("Sizda ushbu rolni ko'rish huquqi yo'q!");
      }
      query.role = role;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ];
    }

    const [users, totalUsers] = await Promise.all([
      userRepository.listPaginated(query, skip, limit),
      userRepository.count(query)
    ]);

    return {
      users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: parseInt(page),
      totalUsers
    };
  }

  async getDashboardStats(requesterRole, userId) {
    if (requesterRole === ROLES.STUDENT) {
      return await this.getStudentDashboardStats(userId);
    }

    const isStaff = requesterRole === ROLES.MENTOR || requesterRole === ROLES.TEACHER;
    let courseQuery = {};
    if (requesterRole === ROLES.MENTOR) courseQuery.mentors = userId;
    else if (requesterRole === ROLES.TEACHER) courseQuery.teachers = userId;

    const [stats, recentUsers, courseCount, recentActivity] = await Promise.all([
      userRepository.getAggregateStats(),
      userRepository.getRecentUsers(5),
      Course.countDocuments(courseQuery),
      activityService.getRecentActivity()
    ]);

    // Fetch materials count based on filtered courses for staff
    let materialCount = 0;
    if (isStaff) {
      const assignedCourseIds = (await Course.find(courseQuery).select('_id')).map(c => c._id);
      materialCount = await Material.countDocuments({ course: { $in: assignedCourseIds } });
    } else {
      materialCount = await Material.countDocuments();
    }

    const formattedStats = {
      super_admin: 0,
      admin: 0,
      teacher: 0,
      mentor: 0,
      student: 0,
      total: 0,
      courses: courseCount,
      materials: materialCount
    };

    stats.forEach((item) => {
      // Restriction: ADMIN cannot see SUPER_ADMIN counts
      if (requesterRole === ROLES.ADMIN && item._id === ROLES.SUPER_ADMIN) {
        return;
      }
      // Restriction: TEACHER cannot see ADMIN or SUPER_ADMIN counts
      if (requesterRole === ROLES.TEACHER && (item._id === ROLES.SUPER_ADMIN || item._id === ROLES.ADMIN)) {
        return;
      }
      formattedStats[item._id] = item.count;
      formattedStats.total += item.count;
    });

    // Filter recentActivity: show own activity + activity from lower roles, limited to top 20
    const lowerRoles = ROLE_HIERARCHY[requesterRole] || [];
    const filteredActivity = recentActivity.filter(log => {
      if (!log.userId) return false;
      const isMyActivity = log.userId._id.toString() === userId.toString();
      const isLowerRoleActivity = lowerRoles.includes(log.userId.role);
      return isMyActivity || isLowerRoleActivity;
    }).slice(0, 20);

    // Filter recentUsers based on requesterRole
    const filteredRecentUsers = requesterRole === ROLES.TEACHER
      ? recentUsers.filter(u => u.role !== ROLES.SUPER_ADMIN && u.role !== ROLES.ADMIN)
      : requesterRole === ROLES.ADMIN
        ? recentUsers.filter(u => u.role !== ROLES.SUPER_ADMIN)
        : recentUsers;

    return { stats: formattedStats, recentUsers: filteredRecentUsers, recentActivity: filteredActivity };
  }

  async getStudentDashboardStats(userId) {
    const studentCourses = await Course.find({ students: userId });
    const submissions = await submissionRepository.findByStudentAndCourse(userId, null); // Get all
    
    // Calculate stats across courses
    const courseStats = await Promise.all(studentCourses.map(async (course) => {
      const avgGrade = await submissionRepository.getAverageGrade(userId, course._id);
      const allGrades = await submissionRepository.getAllGradesInCourse(course._id);
      
      // Calculate rank
      const rank = allGrades.findIndex(g => g._id.toString() === userId.toString()) + 1;
      
      return {
        courseId: course._id,
        courseName: course.name,
        avgGrade: Math.round(avgGrade * 10) / 10,
        rank: rank || 0,
        totalStudents: allGrades.length
      };
    }));

    const totalSubmissions = await submissionRepository.count({ student: userId });
    const gradedSubmissions = await submissionRepository.count({ student: userId, status: "graded" });
    
    return {
      stats: {
        activeCourses: studentCourses.length,
        totalSubmissions,
        gradedSubmissions,
        averageGrade: courseStats.length > 0 
          ? Math.round((courseStats.reduce((acc, curr) => acc + curr.avgGrade, 0) / courseStats.length) * 10) / 10 
          : 0
      },
      courseStats
    };
  }
}

module.exports = new UserService();
