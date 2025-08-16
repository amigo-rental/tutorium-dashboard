import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/teachers/[id]/stats - Get teacher statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    // Only allow teachers to see their own stats, or admins to see any teacher's stats
    if (userRole === "TEACHER" && userId !== id) {
      return NextResponse.json(
        { error: "Unauthorized to view other teacher stats" },
        { status: 403 },
      );
    }

    const teacherId = id;

    // Get current date for month calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get teacher's total lessons
    const totalLessons = await prisma.lesson.count({
      where: {
        teacherId: teacherId,
        isActive: true,
      },
    });

    // Get lessons this month
    const lessonsThisMonth = await prisma.lesson.count({
      where: {
        teacherId: teacherId,
        isActive: true,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Get teacher's groups
    const teacherGroups = await prisma.group.findMany({
      where: {
        teacherId: teacherId,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    // Calculate total students across all groups
    const totalStudents = teacherGroups.reduce(
      (sum, group) => sum + group._count.students,
      0,
    );

    // Get students this month (students in groups that have lessons this month)
    const groupsWithLessonsThisMonth = await prisma.group.findMany({
      where: {
        teacherId: teacherId,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    // Get lessons this month for the teacher
    const lessonsThisMonthForTeacher = await prisma.lesson.findMany({
      where: {
        teacherId: teacherId,
        isActive: true,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        groupId: true,
      },
    });

    // Calculate students this month based on groups that have lessons this month
    const groupIdsWithLessons = Array.from(
      new Set(
        lessonsThisMonthForTeacher.map((l: any) => l.groupId).filter(Boolean),
      ),
    );
    const studentsThisMonth = groupsWithLessonsThisMonth
      .filter((group) => groupIdsWithLessons.includes(group.id))
      .reduce((sum, group) => sum + group._count.students, 0);

    // Get average rating from lesson feedback
    const feedbackStats = await prisma.lessonFeedback.aggregate({
      where: {
        lesson: {
          teacherId: teacherId,
          isActive: true,
        },
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    const averageRating = feedbackStats._avg.rating || 0;
    const totalFeedback = feedbackStats._count.rating || 0;

    // Calculate engagement based on actual lesson attendance
    const attendanceStats = await prisma.lessonAttendance.aggregate({
      where: {
        lesson: {
          teacherId: teacherId,
          isActive: true,
          status: "COMPLETED",
        },
      },
      _count: {
        id: true,
      },
    });

    const totalAttendanceRecords = attendanceStats._count.id || 0;

    // Get attendance records with status to calculate engagement
    const attendanceRecords = await prisma.lessonAttendance.findMany({
      where: {
        lesson: {
          teacherId: teacherId,
          isActive: true,
          status: "COMPLETED",
        },
      },
      select: {
        status: true,
        participation: true,
      },
    });

    // Calculate engagement rate based on attendance status and participation
    let totalEngagementScore = 0;
    let validAttendanceCount = 0;

    attendanceRecords.forEach((record: any) => {
      let score = 0;

      switch (record.status) {
        case "PRESENT":
          score = 100;
          break;
        case "PARTIAL":
          score = 75;
          break;
        case "LATE":
          score = 60;
          break;
        case "EXCUSED":
          score = 50;
          break;
        case "ABSENT":
          score = 0;
          break;
      }

      // Add participation bonus if available
      if (record.participation !== null && record.participation > 0) {
        score += Math.min(20, record.participation); // Max 20 points for participation
      }

      totalEngagementScore += score;
      validAttendanceCount++;
    });

    const averageEngagement =
      validAttendanceCount > 0
        ? totalEngagementScore / validAttendanceCount
        : 0;
    const engagementRate = Math.round(averageEngagement);

    // Calculate total reactions from lessons (if you have a reactions system)
    // For now, we'll use feedback count as a proxy for engagement
    const totalReactions = totalFeedback;
    const positiveReactions = Math.round(totalFeedback * 0.8); // Assume 80% positive

    // Get recent lessons for additional context
    const recentLessons = await prisma.lesson.findMany({
      where: {
        teacherId: teacherId,
        isActive: true,
        status: "COMPLETED",
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
      include: {
        group: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    // Calculate study time (total lesson duration in hours)
    const totalStudyTime = await prisma.lesson.aggregate({
      where: {
        teacherId: teacherId,
        isActive: true,
        status: "COMPLETED",
      },
      _sum: {
        duration: true,
      },
    });

    const totalStudyHours = Math.round(
      (totalStudyTime._sum.duration || 0) / 60,
    );

    const teacherStats = {
      teacherId: teacherId,
      totalLessons,
      lessonsThisMonth,
      totalStudents,
      studentsThisMonth,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReactions,
      positiveReactions,
      engagementRate,
      totalStudyHours,
      totalFeedback,
      totalAttendanceRecords,
      recentLessons: recentLessons.map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        date: lesson.date,
        groupName: lesson.group?.name || "Индивидуальный урок",
        studentCount: lesson._count.students,
      })),
      groups: teacherGroups.map((group: any) => ({
        id: group.id,
        name: group.name,
        level: group.level,
        studentCount: group._count.students,
      })),
    };

    return NextResponse.json(teacherStats);
  } catch (error) {
    console.error("Get teacher stats error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
