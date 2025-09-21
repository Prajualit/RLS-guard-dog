import clientPromise from './connection'
import { ClassAnalytics, StudentAnalytics, SchoolAnalytics } from './types'

/**
 * Get the MongoDB database instance
 */
export async function getDatabase() {
  const client = await clientPromise
  return client.db('rls_guard_dogtech')
}

/**
 * Get analytics collections
 */
export async function getAnalyticsCollections() {
  const db = await getDatabase()
  
  return {
    classAnalytics: db.collection<ClassAnalytics>('class_analytics'),
    studentAnalytics: db.collection<StudentAnalytics>('student_analytics'),
    schoolAnalytics: db.collection<SchoolAnalytics>('school_analytics')
  }
}

/**
 * Save or update class analytics
 */
export async function saveClassAnalytics(analytics: Omit<ClassAnalytics, '_id'>) {
  const { classAnalytics } = await getAnalyticsCollections()
  
  const result = await classAnalytics.updateOne(
    { 
      classId: analytics.classId,
      schoolId: analytics.schoolId 
    },
    { 
      $set: {
        ...analytics,
        calculatedAt: new Date()
      }
    },
    { upsert: true }
  )
  
  return result
}

/**
 * Get class analytics
 */
export async function getClassAnalytics(
  schoolId: string,
  classId?: string
): Promise<ClassAnalytics[]> {
  const { classAnalytics } = await getAnalyticsCollections()
  
  const filter: Record<string, string> = { schoolId }
  if (classId) {
    filter.classId = classId
  }
  
  const results = await classAnalytics
    .find(filter)
    .sort({ calculatedAt: -1 })
    .toArray()
  
  return results
}

/**
 * Save or update student analytics
 */
export async function saveStudentAnalytics(analytics: Omit<StudentAnalytics, '_id'>) {
  const { studentAnalytics } = await getAnalyticsCollections()
  
  const result = await studentAnalytics.updateOne(
    { 
      studentId: analytics.studentId,
      classId: analytics.classId 
    },
    { 
      $set: {
        ...analytics,
        calculatedAt: new Date()
      }
    },
    { upsert: true }
  )
  
  return result
}

/**
 * Get student analytics
 */
export async function getStudentAnalytics(
  schoolId: string,
  classId?: string,
  studentId?: string
): Promise<StudentAnalytics[]> {
  const { studentAnalytics } = await getAnalyticsCollections()
  
  const filter: Record<string, string> = { schoolId }
  if (classId) {
    filter.classId = classId
  }
  if (studentId) {
    filter.studentId = studentId
  }
  
  const results = await studentAnalytics
    .find(filter)
    .sort({ calculatedAt: -1 })
    .toArray()
  
  return results
}

/**
 * Save or update school analytics
 */
export async function saveSchoolAnalytics(analytics: Omit<SchoolAnalytics, '_id'>) {
  const { schoolAnalytics } = await getAnalyticsCollections()
  
  const result = await schoolAnalytics.updateOne(
    { schoolId: analytics.schoolId },
    { 
      $set: {
        ...analytics,
        calculatedAt: new Date()
      }
    },
    { upsert: true }
  )
  
  return result
}

/**
 * Get school analytics
 */
export async function getSchoolAnalytics(schoolId: string): Promise<SchoolAnalytics | null> {
  const { schoolAnalytics } = await getAnalyticsCollections()
  
  const result = await schoolAnalytics
    .findOne({ schoolId })
  
  return result
}

/**
 * Delete old analytics data (cleanup function)
 */
export async function cleanupOldAnalytics(daysToKeep: number = 90) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
  
  const { classAnalytics, studentAnalytics, schoolAnalytics } = await getAnalyticsCollections()
  
  const results = await Promise.all([
    classAnalytics.deleteMany({ calculatedAt: { $lt: cutoffDate } }),
    studentAnalytics.deleteMany({ calculatedAt: { $lt: cutoffDate } }),
    schoolAnalytics.deleteMany({ calculatedAt: { $lt: cutoffDate } })
  ])
  
  return {
    classAnalyticsDeleted: results[0].deletedCount,
    studentAnalyticsDeleted: results[1].deletedCount,
    schoolAnalyticsDeleted: results[2].deletedCount
  }
}