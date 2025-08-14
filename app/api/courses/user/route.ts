import { NextRequest, NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/middleware";

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

    // Return mock data for now to avoid Prisma type issues
    let courses: any[] = [];

    if (userRole === "STUDENT") {
      // Mock student courses
      courses = [
        {
          id: "1",
          title: "Английский для начинающих",
          description: "Курс для изучения английского языка с нуля",
          level: "A1",
          duration: 12,
          progressPercent: 65,
          teacher: "Преподаватель",
          nextLesson: "Следующее занятие",
          totalLessons: 24,
          completedLessons: 16,
          totalTopics: 8,
          coverImage: undefined,
        },
        {
          id: "2",
          title: "Разговорный английский",
          description: "Практика разговорной речи",
          level: "A2",
          duration: 8,
          progressPercent: 40,
          teacher: "Преподаватель",
          nextLesson: "Следующее занятие",
          totalLessons: 16,
          completedLessons: 6,
          totalTopics: 6,
          coverImage: undefined,
        },
      ];
    } else if (userRole === "TEACHER") {
      // Mock teacher courses
      courses = [
        {
          id: "1",
          title: "Английский для начинающих",
          description: "Курс для изучения английского языка с нуля",
          level: "A1",
          duration: 12,
          progressPercent: 75,
          teacher: "Вы",
          nextLesson: "Следующее занятие",
          totalLessons: 24,
          completedLessons: 18,
          totalTopics: 8,
          groupId: "group1",
          groupName: "Группа A1-1",
          coverImage: undefined,
        },
        {
          id: "2",
          title: "Разговорный английский",
          description: "Практика разговорной речи",
          level: "A2",
          duration: 8,
          progressPercent: 60,
          teacher: "Вы",
          nextLesson: "Следующее занятие",
          totalLessons: 16,
          completedLessons: 10,
          totalTopics: 6,
          groupId: "group2",
          groupName: "Группа A2-1",
          coverImage: undefined,
        },
        {
          id: "3",
          title: "Бизнес английский",
          description: "Английский для работы и бизнеса",
          level: "B1",
          duration: 10,
          progressPercent: 30,
          teacher: "Вы",
          nextLesson: "Следующее занятие",
          totalLessons: 20,
          completedLessons: 6,
          totalTopics: 7,
          groupId: "group3",
          groupName: "Группа B1-1",
          coverImage: undefined,
        },
      ];
    } else if (userRole === "ADMIN") {
      // Mock admin courses (can see all)
      courses = [
        {
          id: "1",
          title: "Английский для начинающих",
          description: "Курс для изучения английского языка с нуля",
          level: "A1",
          duration: 12,
          progressPercent: 75,
          teacher: "Преподаватель 1",
          nextLesson: "Следующее занятие",
          totalLessons: 24,
          completedLessons: 18,
          totalTopics: 8,
          coverImage: undefined,
        },
        {
          id: "2",
          title: "Разговорный английский",
          description: "Практика разговорной речи",
          level: "A2",
          duration: 8,
          progressPercent: 60,
          teacher: "Преподаватель 2",
          nextLesson: "Следующее занятие",
          totalLessons: 16,
          completedLessons: 10,
          totalTopics: 6,
          coverImage: undefined,
        },
      ];
    }

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Get user courses error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
