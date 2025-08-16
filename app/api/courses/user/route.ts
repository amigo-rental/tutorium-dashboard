import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";
import {
  getCourseProgressData,
  getCourseProgressAcrossGroups,
} from "@/lib/utils/course-progress";

// GET /api/courses/user - Get courses for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    let courses: any[] = [];

    if (userRole === "STUDENT") {
      // Get user's enrolled courses (admin-assigned)
      const user = (await prisma.user.findUnique({
        where: { id: userId },
        include: {
          enrolledCourses: {
            select: {
              id: true,
              name: true,
              description: true,
              level: true,
              duration: true,
              difficulty: true,
              category: true,
              tags: true,
              thumbnail: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
      })) as any;

      // Get groups where user is in the students array (many-to-many relationship)
      const userGroups = (await prisma.group.findMany({
        where: {
          isActive: true,
          students: {
            some: {
              id: userId,
            },
          },
        },
        include: {
          course: true,
          _count: {
            select: {
              students: true,
            },
          },
        },
      })) as any[];

      // Combine courses from both sources
      const groupCourses = userGroups.map((group) => (group as any).course);
      const adminCourses = (user as any)?.enrolledCourses || [];

      // Create a map to avoid duplicates
      const courseMap = new Map();

      // Add group courses first (these are the derived ones)
      for (const group of userGroups) {
        if ((group as any).course && (group as any).course.isActive) {
          // Use the new function to get course progress across all groups
          const progress = await getCourseProgressAcrossGroups(
            (group as any).course.id,
            userId,
          );

          courseMap.set((group as any).course.id, {
            ...(group as any).course,
            title: (group as any).course.name, // Map name to title for consistency
            source: "group", // Indicate this is from group enrollment
            progressPercent: progress.progressPercent,
            teacher: "Преподаватель",
            nextLesson: progress.nextTopic || "Следующее занятие",
            nextLessonTopic: progress.nextTopic,
            totalLessons: progress.totalTopics,
            completedLessons: progress.completedTopics,
            totalTopics: progress.totalTopics,
            lastStudiedTopic: progress.lastStudiedTopic,
            groupId: group.id,
            groupName: group.name,
            coverImage: (group as any).course.thumbnail,
            studentCount: (group as any)._count.students,
            groupCount: progress.groupCount, // Number of groups for this course
          });
        }
      }

      // Add admin-assigned courses (these are direct enrollments)
      for (const course of adminCourses) {
        if (course.isActive && !courseMap.has(course.id)) {
          const progress = await getCourseProgressData(course.id);

          courseMap.set(course.id, {
            ...course,
            title: course.name, // Map name to title for consistency
            source: "admin", // Indicate this is from admin assignment
            progressPercent: progress.progressPercent,
            teacher: "Преподаватель",
            nextLesson: progress.nextTopic || "Следующее занятие",
            nextLessonTopic: progress.nextTopic,
            totalLessons: progress.totalTopics,
            completedLessons: progress.completedTopics,
            totalTopics: progress.totalTopics,
            lastStudiedTopic: progress.lastStudiedTopic,
            coverImage: course.thumbnail,
            studentCount: 0, // No group association
            groupCount: 0, // No group association
          });
        }
      }

      courses = Array.from(courseMap.values());
    } else if (userRole === "TEACHER") {
      // Get groups where the user is the teacher
      const teacherGroups = (await prisma.group.findMany({
        where: {
          teacherId: userId,
          isActive: true,
        },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              description: true,
              level: true,
              duration: true,
              difficulty: true,
              category: true,
              tags: true,
              thumbnail: true,
              isActive: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              students: true,
            },
          },
        },
      })) as any[];

      // Get progress data for each group's course
      const coursesWithProgress = await Promise.all(
        teacherGroups.map(async (group) => {
          const progress = await getCourseProgressData(
            (group as any).course.id,
            group.id,
          );

          return {
            id: (group as any).course.id,
            title: (group as any).course.name,
            description: (group as any).course.description,
            level: (group as any).course.level,
            duration: (group as any).course.duration,
            progressPercent: progress.progressPercent,
            teacher: "Вы",
            nextLesson: progress.nextTopic || "Следующее занятие",
            nextLessonTopic: progress.nextTopic,
            totalLessons: progress.totalTopics,
            completedLessons: progress.completedTopics,
            totalTopics: progress.totalTopics,
            lastStudiedTopic: progress.lastStudiedTopic,
            groupId: group.id,
            groupName: group.name,
            coverImage: (group as any).course.thumbnail,
            studentCount: (group as any)._count.students,
          };
        }),
      );

      courses = coursesWithProgress;
    } else if (userRole === "ADMIN") {
      // Admins can see all courses with progress tracking
      const allCourses = await prisma.course.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          level: true,
          duration: true,
          difficulty: true,
          category: true,
          tags: true,
          thumbnail: true,
          isActive: true,
          createdAt: true,
          groups: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              groups: true,
              enrollments: true,
            },
          },
        },
      });

      // Get progress data for each course
      const coursesWithProgress = await Promise.all(
        allCourses.map(async (course) => {
          const progress = await getCourseProgressData(course.id);

          return {
            id: course.id,
            title: course.name,
            description: course.description,
            level: course.level,
            duration: course.duration,
            progressPercent: progress.progressPercent,
            teacher: "Преподаватель", // Generic teacher
            nextLesson: progress.nextTopic || "Следующее занятие",
            nextLessonTopic: progress.nextTopic,
            totalLessons: progress.totalTopics,
            completedLessons: progress.completedTopics,
            totalTopics: progress.totalTopics,
            coverImage: course.thumbnail,
            groupCount: course._count.groups,
            enrollmentCount: course._count.enrollments,
          };
        }),
      );

      courses = coursesWithProgress;
    }

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Get courses error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
