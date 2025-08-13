import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Database Models
export interface User {
  id: string;
  email: string;
  name: string;
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
  students: User[]; // Users with STUDENT role
  _count?: {
    students: number;
  };
}

// Student is now just a User with STUDENT role
export type Student = User & { role: "STUDENT" };

export interface Recording {
  id: string;
  lessonType: "GROUP" | "INDIVIDUAL";
  date: string;
  youtubeLink: string;
  message?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  teacherId: string;
  groupId?: string;
  group?: Group;
  students: Student[];
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
  recordingId: string;
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
  lessonType: "GROUP" | "INDIVIDUAL";
  date: string;
  youtubeLink: string;
  message?: string;
  groupId?: string;
  studentIds?: string[];
}

export interface UploadFileRequest {
  recordingId: string;
  files: File[];
}

// Frontend State Types
export interface FormData {
  lessonType: string;
  groupOrStudent: string | string[];
  date: string;
  youtubeLink: string;
  attachments: File[];
  message: string;
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
