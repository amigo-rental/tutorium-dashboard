import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";
import { getGroupProgressData } from "@/lib/utils/course-progress";

// GET /api/groups/user - Get groups that the authenticated user is enrolled in
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["STUDENT", "TEACHER", "ADMIN"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    let groups;

    if (userRole === "STUDENT") {
      // For students, get groups they are enrolled in
      // Check both the many-to-many relationship and the groupId field
      groups = await prisma.group.findMany({
        where: {
          isActive: true,
          OR: [
            {
              students: {
                some: {
                  id: userId,
                },
              },
            },
            {
              id: {
                in: await prisma.user
                  .findUnique({
                    where: { id: userId },
                    select: { groupId: true },
                  })
                  .then((user) => (user?.groupId ? [user.groupId] : [])),
              },
            },
          ],
        },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              name: true,
              level: true,
              description: true,
            },
          },
          students: {
            select: {
              id: true,
              name: true,
              email: true,
              level: true,
              avatar: true,
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
        orderBy: {
          createdAt: "desc",
        },
      });
    } else if (userRole === "TEACHER") {
      // For teachers, get groups they teach
      groups = await prisma.group.findMany({
        where: {
          isActive: true,
          teacherId: userId,
        },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              name: true,
              level: true,
              description: true,
            },
          },
          students: {
            select: {
              id: true,
              name: true,
              email: true,
              level: true,
              avatar: true,
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
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // For admins, get all groups
      groups = await prisma.group.findMany({
        where: {
          isActive: true,
        },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              name: true,
              level: true,
              description: true,
            },
          },
          students: {
            select: {
              id: true,
              name: true,
              email: true,
              level: true,
              avatar: true,
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
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // Enhance groups with progress data
    const groupsWithProgress = await Promise.all(
      groups.map(async (group) => {
        try {
          // Get progress data for this specific group using the new function
          const progressData = await getGroupProgressData(group.id);

          return {
            ...group,
            progress: progressData,
          };
        } catch (error) {
          console.error(`Error getting progress for group ${group.id}:`, error);

          // Return group without progress data if there's an error
          return {
            ...group,
            progress: {
              progressPercent: 0,
              completedTopics: 0,
              totalTopics: 0,
              lastStudiedTopic: null,
              nextTopic: null,
              nextTopicId: null,
            },
          };
        }
      }),
    );

    console.log(
      "User Groups API: Returning",
      groupsWithProgress.length,
      "groups with progress data for",
      userRole,
      "user:",
      userId,
    );

    return NextResponse.json(groupsWithProgress);
  } catch (error) {
    console.error("Get user groups error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
