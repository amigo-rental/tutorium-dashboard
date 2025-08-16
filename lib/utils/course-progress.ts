import { prisma } from "@/lib/db/prisma";

/**
 * Centralized function to calculate course progress and get next topic
 * This ensures consistency across all components (course cards, upcoming lessons, etc.)
 */
export async function getCourseProgressData(
  courseId: string,
  groupId?: string,
) {
  try {
    // Get total topics for the course
    const totalTopics = await prisma.topic.count({
      where: {
        courseId: courseId,
        isActive: true,
      },
    });

    if (totalTopics === 0) {
      return {
        progressPercent: 0,
        completedTopics: 0,
        totalTopics: 0,
        lastStudiedTopic: null,
        nextTopic: null,
        nextTopicId: null,
      };
    }

    // Get completed topics based on lessons with topics
    let whereClause: any = {
      topicId: { not: null },
      status: "COMPLETED",
      group: {
        courseId: courseId,
      },
    };

    // If groupId is provided, only count lessons from that specific group
    if (groupId) {
      whereClause.groupId = groupId;
    }

    const completedLessons = await prisma.lesson.findMany({
      where: whereClause,
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            order: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Calculate completed topics
    const completedTopicIds = Array.from(
      new Set(completedLessons.map((lesson: any) => lesson.topicId)),
    );
    const completedTopics = completedTopicIds.length;
    const progressPercent = Math.round((completedTopics / totalTopics) * 100);

    // Get last studied topic from the most recent completed lesson
    const lastStudiedTopic =
      completedLessons.length > 0 ? completedLessons[0].topic?.name : null;

    // Get next topic - this is the key to consistency
    let nextTopic = null;
    let nextTopicId = null;

    if (completedLessons.length > 0) {
      // Get the most recent completed lesson
      const mostRecentLesson = completedLessons[0];

      if (mostRecentLesson.nextTopicId) {
        // If the lesson has a nextTopicId set, use that
        const nextTopicData = await prisma.topic.findUnique({
          where: { id: mostRecentLesson.nextTopicId },
          select: { id: true, name: true },
        });

        if (nextTopicData) {
          nextTopic = nextTopicData.name;
          nextTopicId = nextTopicData.id;
        }
      } else {
        // Fallback: find the next topic in the course sequence
        const allTopics = await prisma.topic.findMany({
          where: {
            courseId: courseId,
            isActive: true,
          },
          orderBy: {
            order: "asc", // Assuming topics have an order field
          },
        });

        if (allTopics.length > 0) {
          // Find the first topic that hasn't been completed
          const nextTopicData = allTopics.find(
            (topic: any) => !completedTopicIds.includes(topic.id),
          );

          if (nextTopicData) {
            nextTopic = nextTopicData.name;
            nextTopicId = nextTopicData.id;
          }
        }
      }
    }

    return {
      progressPercent,
      completedTopics,
      totalTopics,
      lastStudiedTopic,
      nextTopic,
      nextTopicId,
    };
  } catch (error) {
    console.error("Error calculating course progress:", error);

    return {
      progressPercent: 0,
      completedTopics: 0,
      totalTopics: 0,
      lastStudiedTopic: null,
      nextTopic: null,
      nextTopicId: null,
    };
  }
}

/**
 * Get group-specific progress data
 * This tracks progress for a specific group based on its lessons
 */
export async function getGroupProgressData(groupId: string) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        course: {
          select: { id: true },
        },
      },
    });

    if (!group) {
      throw new Error("Group not found");
    }

    // Get progress data for this specific group
    return await getCourseProgressData(group.courseId, groupId);
  } catch (error) {
    console.error("Error getting group progress:", error);
    
    return {
      progressPercent: 0,
      completedTopics: 0,
      totalTopics: 0,
      lastStudiedTopic: null,
      nextTopic: null,
      nextTopicId: null,
    };
  }
}

/**
 * Get course progress across all student's groups
 * This tracks overall course progress by finding the furthest topic covered across all groups
 */
export async function getCourseProgressAcrossGroups(courseId: string, userId: string) {
  try {
    // Get all groups the student is enrolled in that belong to this course
    const userGroups = await prisma.group.findMany({
      where: {
        courseId: courseId,
        students: {
          some: {
            id: userId,
          },
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (userGroups.length === 0) {
      return {
        progressPercent: 0,
        completedTopics: 0,
        totalTopics: 0,
        lastStudiedTopic: null,
        nextTopic: null,
        nextTopicId: null,
        groupCount: 0,
      };
    }

    // Get total topics for the course
    const totalTopics = await prisma.topic.count({
      where: {
        courseId: courseId,
        isActive: true,
      },
    });

    if (totalTopics === 0) {
      return {
        progressPercent: 0,
        completedTopics: 0,
        totalTopics: 0,
        lastStudiedTopic: null,
        nextTopic: null,
        nextTopicId: null,
        groupCount: userGroups.length,
      };
    }

    // Get all completed lessons with topics from all user's groups in this course
    const completedLessons = await prisma.lesson.findMany({
      where: {
        topicId: { not: null },
        status: "COMPLETED",
        groupId: {
          in: userGroups.map(g => g.id),
        },
      },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            order: true,
          },
        },
      },
      orderBy: [
        { topic: { order: "desc" } },
        { date: "desc" },
      ],
    });

    // Calculate completed topics
    const completedTopicIds = Array.from(
      new Set(completedLessons.map((lesson: any) => lesson.topicId)),
    );
    const completedTopics = completedTopicIds.length;
    const progressPercent = Math.round((completedTopics / totalTopics) * 100);

    // Get the most advanced topic (highest order) that has been completed
    const lastStudiedTopic = completedLessons.length > 0 
      ? completedLessons[0].topic?.name 
      : null;

    // Find the next topic after the most advanced completed topic
    let nextTopic = null;
    let nextTopicId = null;

    if (completedLessons.length > 0) {
      const allTopics = await prisma.topic.findMany({
        where: {
          courseId: courseId,
          isActive: true,
        },
        orderBy: {
          order: "asc",
        },
      });

      // Find the first topic that hasn't been completed
      const nextTopicData = allTopics.find(
        (topic: any) => !completedTopicIds.includes(topic.id),
      );

      if (nextTopicData) {
        nextTopic = nextTopicData.name;
        nextTopicId = nextTopicData.id;
      }
    }

    return {
      progressPercent,
      completedTopics,
      totalTopics,
      lastStudiedTopic,
      nextTopic,
      nextTopicId,
      groupCount: userGroups.length,
    };
  } catch (error) {
    console.error("Error calculating course progress across groups:", error);
    
    return {
      progressPercent: 0,
      completedTopics: 0,
      totalTopics: 0,
      lastStudiedTopic: null,
      nextTopic: null,
      nextTopicId: null,
      groupCount: 0,
    };
  }
}

/**
 * Get the next topic for a specific group/course
 * This is used by upcoming lessons to ensure consistency
 */
export async function getNextTopicForGroup(groupId: string) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        course: {
          select: { id: true },
        },
      },
    });

    if (!group) return null;

    const progressData = await getCourseProgressData(group.courseId, groupId);

    return progressData.nextTopic;
  } catch (error) {
    console.error("Error getting next topic for group:", error);

    return null;
  }
}

/**
 * Get the next topic for a specific course
 * This is used by course cards to ensure consistency
 */
export async function getNextTopicForCourse(courseId: string) {
  try {
    const progressData = await getCourseProgressData(courseId);

    return progressData.nextTopic;
  } catch (error) {
    console.error("Error getting next topic for course:", error);

    return null;
  }
}
