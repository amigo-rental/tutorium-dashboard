import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";
import { getCourseProgressData } from "@/lib/utils/course-progress";

// Helper function to format date in Russian without year
function formatDateRussian(date: Date): string {
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];

  return `${day} ${month}`;
}

// GET /api/lessons/upcoming - Get upcoming lessons for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["STUDENT", "TEACHER", "ADMIN"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    let lessons;
    let upcomingLessons;

    if (userRole === "STUDENT") {
      // Students see both individual lessons directly linked to them AND group lessons from groups they're enrolled in
      lessons = await prisma.lesson.findMany({
        where: {
          date: {
            gte: new Date(),
          },
          OR: [
            // Individual lessons where student is directly assigned
            {
              students: {
                some: {
                  id: userId,
                },
              },
              groupId: null, // Ensure it's an individual lesson
            },
            // Group lessons where student is enrolled in the group
            {
              group: {
                students: {
                  some: {
                    id: userId,
                  },
                },
              },
              groupId: { not: null }, // Ensure it's a group lesson
            },
          ],
          status: "SCHEDULED",
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
              courseId: true,
              _count: {
                select: {
                  students: true,
                },
              },
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
            },
          },
          students: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      // For each lesson, get the next topic from the group's progress data (for group lessons)
      upcomingLessons = await Promise.all(
        lessons.map(async (lesson: any) => {
          try {
            let title = "Следующий урок";
            let description = "";
            let topic = null;

            if (lesson.groupId) {
              // This is a group lesson - get next topic from group progress
              const progressData = await getCourseProgressData(
                lesson.group.courseId,
                lesson.group.id,
              );

              title = progressData.nextTopic || "Следующий урок";
              topic = progressData.nextTopic;
              description = `Урок для группы ${lesson.group.name}`;
            } else {
              // This is an individual lesson - use lesson title and description
              title = lesson.title || "Индивидуальный урок";
              description = lesson.description || "Персональный урок";
            }

            return {
              id: lesson.id,
              date: formatDateRussian(lesson.date),
              time: lesson.startTime,
              title: title,
              description: description,
              teacher: lesson.teacher?.name || "Преподаватель",
              duration: `${lesson.duration} минут`,
              meetingLink: lesson.meetingLink,
              type: lesson.lessonType.toLowerCase(),
              topic: topic,
              groupName: lesson.group?.name,
              studentCount:
                lesson.group?._count?.students || lesson.students?.length || 0,
              isIndividual: !lesson.groupId,
            };
          } catch (error) {
            console.error(`Error processing lesson ${lesson.id}:`, error);

            // Return lesson with fallback data if progress calculation fails
            return {
              id: lesson.id,
              date: formatDateRussian(lesson.date),
              time: lesson.startTime,
              title: lesson.groupId
                ? `${lesson.group?.name}: занятие`
                : lesson.title ||
                  `${lesson.teacher?.name || "Преподаватель"}: занятие`,
              description: lesson.groupId
                ? `Урок для группы ${lesson.group?.name}`
                : lesson.description || "Персональный урок",
              teacher: lesson.teacher?.name || "Преподаватель",
              duration: `${lesson.duration} минут`,
              meetingLink: lesson.meetingLink,
              type: lesson.lessonType.toLowerCase(),
              topic: null,
              groupName: lesson.group?.name,
              studentCount:
                lesson.group?._count?.students || lesson.students?.length || 0,
              isIndividual: !lesson.groupId,
            };
          }
        }),
      );
    } else if (userRole === "TEACHER") {
      // Teachers see both individual lessons they teach AND group lessons from groups they teach
      lessons = await prisma.lesson.findMany({
        where: {
          teacherId: userId, // Teacher is set per lesson, not per group
          date: {
            gte: new Date(),
          },
          status: "SCHEDULED",
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
              courseId: true,
              _count: {
                select: {
                  students: true,
                },
              },
            },
          },
          students: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      // For each lesson, get the next topic from the group's progress data (for group lessons)
      upcomingLessons = await Promise.all(
        lessons.map(async (lesson: any) => {
          try {
            let title = "Следующий урок";
            let description = "";
            let topic = null;

            if (lesson.groupId) {
              // This is a group lesson - get next topic from group progress
              const progressData = await getCourseProgressData(
                lesson.group.courseId,
                lesson.group.id,
              );

              title = progressData.nextTopic || "Следующий урок";
              topic = progressData.nextTopic;
              description = `Урок для группы ${lesson.group.name}`;
            } else {
              // This is an individual lesson - use lesson title and description
              title = lesson.title || "Индивидуальный урок";
              description = lesson.description || "Персональный урок";
            }

            return {
              id: lesson.id,
              date: formatDateRussian(lesson.date),
              time: lesson.startTime,
              title: title,
              description: description,
              teacher: "Вы", // Show "Вы" (You) for the current teacher
              duration: `${lesson.duration} минут`,
              meetingLink: lesson.meetingLink,
              type: lesson.lessonType.toLowerCase(),
              topic: topic,
              groupName: lesson.group?.name,
              studentCount:
                lesson.group?._count?.students || lesson.students?.length || 0,
              isIndividual: !lesson.groupId,
              studentNames: lesson.students?.map((s: any) => s.name).join(", "),
            };
          } catch (error) {
            console.error(`Error processing lesson ${lesson.id}:`, error);

            // Return lesson with fallback data if progress calculation fails
            return {
              id: lesson.id,
              date: formatDateRussian(lesson.date),
              time: lesson.startTime,
              title: lesson.groupId
                ? `${lesson.group?.name}: занятие`
                : lesson.title ||
                  `${lesson.students?.map((s: any) => s.name).join(", ") || "Студент"}: занятие`,
              description: lesson.groupId
                ? `Урок для группы ${lesson.group?.name}`
                : lesson.description || "Персональный урок",
              teacher: "Вы", // Show "Вы" (You) for the current teacher
              duration: `${lesson.duration} минут`,
              meetingLink: lesson.meetingLink,
              type: lesson.lessonType.toLowerCase(),
              topic: null,
              groupName: lesson.group?.name,
              studentCount:
                lesson.group?._count?.students || lesson.students?.length || 0,
              isIndividual: !lesson.groupId,
              studentNames: lesson.students?.map((s: any) => s.name).join(", "),
            };
          }
        }),
      );
    } else {
      // Admins see all lessons
      lessons = await prisma.lesson.findMany({
        where: {
          date: {
            gte: new Date(),
          },
          status: "SCHEDULED",
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
              courseId: true,
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
            },
          },
          students: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      // For each lesson, get the next topic from the group's progress data (for group lessons)
      upcomingLessons = await Promise.all(
        lessons.map(async (lesson: any) => {
          try {
            let title = "Следующий урок";
            let description = "";
            let topic = null;

            if (lesson.groupId) {
              // This is a group lesson - get next topic from group progress
              const progressData = await getCourseProgressData(
                lesson.group.courseId,
                lesson.group.id,
              );

              title = progressData.nextTopic || "Следующий урок";
              topic = progressData.nextTopic;
              description = `Урок для группы ${lesson.group.name}`;
            } else {
              // This is an individual lesson - use lesson title and description
              title = lesson.title || "Индивидуальный урок";
              description = lesson.description || "Персональный урок";
            }

            return {
              id: lesson.id,
              date: formatDateRussian(lesson.date),
              time: lesson.startTime,
              title: title,
              description: description,
              teacher: lesson.teacher?.name || "Преподаватель",
              duration: `${lesson.duration} минут`,
              meetingLink: lesson.meetingLink,
              type: lesson.lessonType.toLowerCase(),
              topic: topic,
              groupName: lesson.group?.name,
              isIndividual: !lesson.groupId,
            };
          } catch (error) {
            console.error(`Error processing lesson ${lesson.id}:`, error);

            // Return lesson with fallback data if progress calculation fails
            return {
              id: lesson.id,
              date: formatDateRussian(lesson.date),
              time: lesson.startTime,
              title: lesson.groupId
                ? `${lesson.group?.name}: занятие`
                : lesson.title ||
                  `${lesson.teacher?.name || "Преподаватель"}: занятие`,
              description: lesson.groupId
                ? `Урок для группы ${lesson.group?.name}`
                : lesson.description || "Персональный урок",
              teacher: lesson.teacher?.name || "Преподаватель",
              duration: `${lesson.duration} минут`,
              meetingLink: lesson.meetingLink,
              type: lesson.lessonType.toLowerCase(),
              topic: null,
              groupName: lesson.group?.name,
              isIndividual: !lesson.groupId,
            };
          }
        }),
      );
    }

    console.log(
      "Upcoming lessons API: Found",
      lessons.length,
      "raw lessons for",
      userRole,
      "user:",
      userId,
    );

    console.log(
      "Upcoming lessons API: Returning",
      upcomingLessons.length,
      "processed lessons for",
      userRole,
      "user:",
      userId,
    );

    return NextResponse.json(upcomingLessons);
  } catch (error) {
    console.error("Get upcoming lessons error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
