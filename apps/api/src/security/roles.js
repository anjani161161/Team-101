export const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  INSTRUCTOR: "INSTRUCTOR",
  STUDENT: "STUDENT",
});

export const ROLE_PERMISSIONS = Object.freeze({
  "users:manage": [ROLES.ADMIN, ROLES.INSTRUCTOR],
  "users:administer": [ROLES.ADMIN],
  "users:create-student": [ROLES.ADMIN, ROLES.INSTRUCTOR],
  "institutions:administer": [ROLES.ADMIN],
  "preparedness:read": [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.STUDENT],
  "preparedness:write": [ROLES.ADMIN, ROLES.INSTRUCTOR],
  "analytics:read": [ROLES.ADMIN],
  "audit:read": [ROLES.ADMIN],
  "personal-checklist:manage": [ROLES.STUDENT],
});

const legacyRoleMap = Object.freeze({
  student: ROLES.STUDENT,
  STUDENT: ROLES.STUDENT,
  educator: ROLES.INSTRUCTOR,
  "institution-admin": ROLES.INSTRUCTOR,
  "safety-coordinator": ROLES.INSTRUCTOR,
  GOVERNMENT_OFFICER: ROLES.INSTRUCTOR,
  INSTRUCTOR: ROLES.INSTRUCTOR,
  "platform-admin": ROLES.ADMIN,
  ADMIN: ROLES.ADMIN,
});

export function normalizeLegacyRole(role) {
  return Object.hasOwn(legacyRoleMap, role) ? legacyRoleMap[role] : null;
}

export function roleHasPermission(role, permission) {
  return ROLE_PERMISSIONS[permission]?.includes(role) ?? false;
}
