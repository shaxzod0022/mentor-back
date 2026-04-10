const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  TEACHER: "teacher",
  MENTOR: "mentor",
  STUDENT: "student",
};

const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.MENTOR, ROLES.STUDENT],
  [ROLES.ADMIN]: [ROLES.TEACHER, ROLES.MENTOR, ROLES.STUDENT],
  [ROLES.TEACHER]: [ROLES.MENTOR, ROLES.STUDENT],
  [ROLES.MENTOR]: [ROLES.STUDENT],
  [ROLES.STUDENT]: [],
};

const canCreateRole = (creatorRole, targetRole) => {
  return ROLE_HIERARCHY[creatorRole]?.includes(targetRole) || false;
};

module.exports = { ROLES, canCreateRole, ROLE_HIERARCHY };
