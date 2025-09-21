import { ObjectId } from 'mongodb'

/**
 * MongoDB Analytics Schema Types
 */
export interface ClassAnalytics {
  _id?: ObjectId
  schoolId: string
  classId: string
  className: string
  teacherId: string
  calculatedAt: Date
  metrics: {
    totalStudents: number
    averageScore: number
    medianScore: number
    assignments: Array<{
      name: string
      averageScore: number
      completionRate: number
    }>
  }
  trends: {
    weeklyAverage: number[]
    monthlyAverage: number[]
  }
}

export interface StudentAnalytics {
  _id?: ObjectId
  schoolId: string
  classId: string
  studentId: string
  studentName: string
  calculatedAt: Date
  metrics: {
    totalAssignments: number
    averageScore: number
    improvementTrend: number // Positive for improvement, negative for decline
    recentPerformance: Array<{
      assignmentName: string
      score: number
      maxScore: number
      date: Date
    }>
  }
}

export interface SchoolAnalytics {
  _id?: ObjectId
  schoolId: string
  schoolName: string
  calculatedAt: Date
  metrics: {
    totalClasses: number
    totalStudents: number
    totalTeachers: number
    schoolAverageScore: number
    classPerformanceDistribution: Array<{
      classId: string
      className: string
      averageScore: number
      studentCount: number
    }>
  }
}