import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Database Models
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Optional, only needed for creation/auth
  firstName?: string; // Computed from name for display
  lastName?: string; // Computed from name for display
  role: "ADMIN" | "TEACHER" | "STUDENT";
  avatar?: string;
  level?: string; // Language level for students
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  groups?: Group[]; // For TEACHER role
  groupId?: string; // For STUDENT role
  group?: Group; // For STUDENT role
  enrolledCourses?: Course[]; // New: Users can be enrolled in multiple courses
  // Product system
  products?: StudentProduct[];
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  level: string;
  maxStudents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  teacherId: string;
  courseId: string; // New: Every group belongs to a course
  students: User[]; // Users with STUDENT role
  course?: Course; // New: Course relationship
  _count?: {
    students: number;
  };
  // Progress tracking
  progress?: {
    progressPercent: number;
    completedTopics: number;
    totalTopics: number;
    lastStudiedTopic: string | null;
    nextTopic: string | null;
    nextTopicId: string | null;
  };
}

// Extended Group interface for teacher dashboard with additional stats
export interface TeacherGroup extends Group {
  studentCount: number; // Number of students in the group
  lessonCount: number;
  lastLesson?: {
    id: string;
    title: string;
    date: string;
    averageRating?: number;
  } | null;
  // Note: progress is now inherited from Group interface
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  level: string; // A1, A2, B1, B2, C1, C2
  duration: number; // Duration in weeks
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  groups?: Group[];
  topics?: Topic[];
  enrollments?: User[];
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  order: number; // Order within the course
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  courseId: string;
  course?: Course;
}

// Student is now just a User with STUDENT role
export type Student = User & { role: "STUDENT" };

export interface Recording {
  id: string;
  title: string;
  description?: string;
  date: string;
  lessonType: "GROUP" | "INDIVIDUAL";
  youtubeLink: string;
  message?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  duration: number;
  viewCount: number;
  averageRating?: number;
  totalFeedback: number;
  teacherId: string;
  groupId?: string;
  group?: Group;
  teacher?: User;
  topic?: Topic;
  students?: Student[];
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: string;
  lessonId: string;
}

// API Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: "ADMIN" | "TEACHER" | "STUDENT";
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  level: string;
  maxStudents?: number;
}

export interface CreateStudentRequest {
  name: string;
  email: string;
  level: string;
  groupId?: string;
  avatar?: string;
}

export interface CreateRecordingRequest {
  title: string;
  description?: string;
  date: string;
  lessonType: "GROUP" | "INDIVIDUAL";
  youtubeLink: string;
  message?: string;
  groupId?: string;
  studentIds?: string[];
  topicId?: string;
  materials?: string[];
}

export interface UploadFileRequest {
  recordingId: string;
  files: File[];
}

// Frontend State Types
export interface FormData {
  title: string;
  description?: string;
  lessonType: string;
  groupOrStudent: string | string[];
  date: string;
  youtubeLink: string;
  attachments: File[];
  message: string;
  topicId?: string;
  materials?: string[];
}

// Lesson Feedback Types
export interface LessonFeedback {
  id: string;
  rating: number; // 1-5 star rating
  comment?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  recordingId: string;
  student: User;
  recording: Recording;
}

export interface CreateFeedbackRequest {
  rating: number;
  comment?: string;
  isAnonymous?: boolean;
  recordingId: string;
}

export interface CreateAttendanceRequest {
  lessonId: string;
  attendance: {
    studentId: string;
    status: AttendanceStatus;
    notes?: string;
  }[];
}

export interface UpdateAttendanceRequest {
  attendanceId: string;
  status: AttendanceStatus;
  notes?: string;
}

// Enhanced lesson interface for dashboard
export interface DashboardLesson {
  id: string;
  title: string;
  date: string;
  time: string;
  teacher: string;
  message: string;
  filesCount: number;
  hasRecording: boolean;
  recordingUrl?: string;
  feedback?: LessonFeedback;
}

// Comprehensive Lesson Model
export interface Lesson {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  lessonType: "GROUP" | "INDIVIDUAL";
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  teacherId: string;
  teacher: User;
  groupId?: string;
  group?: Group;
  studentIds: string[];
  students: User[];

  // Content
  materials: LessonMaterial[];
  recording?: LessonRecording;

  // Feedback & Reactions
  reactions: LessonReaction[];
  feedback: LessonFeedback[];

  // Statistics
  _count?: {
    students: number;
    reactions: number;
    feedback: number;
  };
}

// Lesson Materials
export interface LessonMaterial {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  fileType: "PDF" | "VIDEO" | "AUDIO" | "IMAGE" | "DOCUMENT" | "OTHER";
  filePath: string;
  fileSize: number;
  isDownloadable: boolean;
  createdAt: string;
}

// Lesson Recording
export interface LessonRecording {
  id: string;
  lessonId: string;
  recordingUrl: string;
  duration: number; // in seconds
  quality: "LOW" | "MEDIUM" | "HIGH" | "HD";
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Comprehensive Reaction System
export interface LessonReaction {
  id: string;
  lessonId: string;
  studentId: string;
  reactionType: ReactionType;
  emoji?: string;
  createdAt: string;

  // Relations
  lesson: Lesson;
  student: User;
}

// Reaction Types
export type ReactionType =
  | "LIKE"
  | "LOVE"
  | "HELPFUL"
  | "CONFUSED"
  | "EXCITED"
  | "THUMBS_UP"
  | "THUMBS_DOWN"
  | "CLAP"
  | "CELEBRATE"
  | "QUESTION";

// Enhanced Feedback System
export interface LessonFeedback {
  id: string;
  lessonId: string;
  studentId: string;
  rating: number; // 1-5 star rating
  comment?: string;
  feedbackType:
    | "GENERAL"
    | "CONTENT"
    | "TEACHING_STYLE"
    | "MATERIALS"
    | "PACING";
  isAnonymous: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  lesson: Lesson;
  student: User;
}

// Teacher Performance Metrics
export interface TeacherMetrics {
  teacherId: string;
  totalLessons: number;
  totalStudents: number;
  averageRating: number;
  totalReactions: number;
  positiveReactions: number;
  engagementRate: number; // percentage
  lessonsThisMonth: number;
  studentsThisMonth: number;
  totalFeedback: number; // Total number of feedback received

  // Relations
  teacher: User;
  groups: Group[];
  lessons: Lesson[];
}

// Dashboard Statistics
export interface DashboardStats {
  totalLessons: number;
  totalStudents: number;
  averageRating: number;
  totalReactions: number;
  positiveReactions: number;
  engagementRate: number;
  lessonsThisMonth: number;
  studentsThisMonth: number;
  topReactions: ReactionType[];
  recentFeedback: LessonFeedback[];
}

// Attendance System
export interface LessonAttendance {
  id: string;
  lessonId: string;
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  lesson: Lesson;
  student: User;
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

// Enhanced Lesson with Attendance
export interface LessonWithAttendance extends Lesson {
  attendance: LessonAttendance[];
  _count?: {
    students: number;
    reactions: number;
    feedback: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
}

// Attendance Summary for Statistics
export interface AttendanceSummary {
  lessonId: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number; // percentage
  lesson: Lesson;
}

// Legacy types for backward compatibility
export interface LegacyRecording {
  id: string;
  lessonType: "group" | "individual";
  groupOrStudent: string | string[];
  date: string;
  youtubeLink: string;
  attachments: string[];
  message: string;
  createdAt: string;
}

// Product System Types
export interface Product {
  id: string;
  type: "GROUP" | "COURSE" | "INDIVIDUAL";
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Product-specific data
  groupProduct?: GroupProduct;
  courseProduct?: CourseProduct;
  individualProduct?: IndividualProduct;
}

export interface GroupProduct {
  groupId: string;
  group: Group;
  teacherId: string;
  teacher: User;
  courseId: string;
  course: Course;
}

export interface CourseProduct {
  courseId: string;
  course: Course;
}

export interface IndividualProduct {
  teacherId: string;
  teacher: User;
  courseId: string;
  course: Course;
}

export interface StudentProduct {
  id: string;
  studentId: string;
  productId: string;
  product: Product;
  enrolledAt: string;
  isActive: boolean;
  expiresAt?: string;
  progress?: {
    completedLessons: number;
    totalLessons: number;
    progressPercent: number;
  };
}


