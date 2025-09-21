import { UserRole, RolePermissions } from '@/types'

// Role-based permission utilities (shared between client and server)
export function getRolePermissions(role: UserRole): RolePermissions {
  switch (role) {
    case 'student':
      return {
        canViewAllProgress: false,
        canEditProgress: false,
        canViewSchoolData: false,
        canManageUsers: false,
      }
    case 'teacher':
      return {
        canViewAllProgress: false, // Can only view their class progress
        canEditProgress: true,
        canViewSchoolData: false,
        canManageUsers: false,
      }
    case 'head_teacher':
      return {
        canViewAllProgress: true, // Can view all progress in their school
        canEditProgress: true,
        canViewSchoolData: true,
        canManageUsers: true,
      }
    default:
      return {
        canViewAllProgress: false,
        canEditProgress: false,
        canViewSchoolData: false,
        canManageUsers: false,
      }
  }
}

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  const permissions = getRolePermissions(role)
  return permissions[permission]
}

export function isAuthorizedForRoute(role: UserRole, pathname: string): boolean {
  // Define route permissions
  if (pathname.startsWith('/teacher')) {
    return ['teacher', 'head_teacher'].includes(role)
  }
  
  if (pathname.startsWith('/student')) {
    return role === 'student'
  }
  
  if (pathname.startsWith('/head-teacher')) {
    return role === 'head_teacher'
  }
  
  // Public routes
  return true
}