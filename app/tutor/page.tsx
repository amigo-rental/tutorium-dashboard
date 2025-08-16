"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Input } from "@heroui/input";

import { useAuth } from "@/lib/auth/context";
import { apiClient } from "@/lib/utils/api";
import { ProtectedRoute } from "@/components/protected-route";
import {
  DashboardSkeleton,
  HeroSkeleton,
  NextLessonSkeleton,
  StatsGridSkeleton,
  RecentLessonsSkeleton,
} from "@/components/dashboard-skeletons";
import { Lesson, TeacherGroup } from "@/types";

// Helper function to get level label
const getLevelLabel = (level: string) => {
  switch (level) {
    case "beginner":
      return "С нуля";
    case "elementary":
      return "Начинающий";
    case "intermediate":
      return "Продолжающий";
    case "advanced":
      return "Продвинутый";
    default:
      return level;
  }
};

// Icons
const BookIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const TrendingUpIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const AwardIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

interface UpcomingLesson {
  id: string;
  date: string;
  time: string;
  title: string;
  teacher: string;
  duration: string;
  meetingLink?: string;
  type: string;
  groupName?: string;
  studentCount?: number;
  description?: string;
  topic?: string;
  isIndividual?: boolean;
  studentNames?: string;
}

interface RecentLesson {
  id: string;
  title: string;
  date: string;
  time: string;
  teacher: string;
  message: string;
  filesCount: number;
  hasRecording: boolean;
  recordingUrl?: string;
}

// Function to generate lesson gradients based on index
const getLessonGradient = (index: number) => {
  const gradients = [
    "from-[#007EFB] to-[#00B67A]", // Blue to Green
    "from-[#EE7A3F] to-[#FDD130]", // Orange to Yellow
    "from-[#00B67A] to-[#007EFB]", // Green to Blue
    "from-[#FDD130] to-[#EE7A3F]", // Yellow to Orange
    "from-[#007EFB] to-[#FDD130]", // Blue to Yellow
    "from-[#EE7A3F] to-[#00B67A]", // Orange to Green
  ];

  return gradients[index % gradients.length];
};

interface TeacherMetrics {
  teacherId: string;
  totalLessons: number;
  totalStudents: number;
  averageRating: number;
  totalReactions: number;
  positiveReactions: number;
  engagementRate: number;
  lessonsThisMonth: number;
  studentsThisMonth: number;
  totalFeedback: number;
  teacher: any;
  groups: any[];
  lessons: any[];
}

interface TeacherStatsResponse {
  teacherId: string;
  totalLessons: number;
  lessonsThisMonth: number;
  totalStudents: number;
  studentsThisMonth: number;
  averageRating: number;
  totalReactions: number;
  positiveReactions: number;
  engagementRate: number;
  totalStudyHours: number;
  totalFeedback: number;
  recentLessons: any[];
  groups: any[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [upcomingLesson, setUpcomingLesson] = useState<UpcomingLesson | null>(
    null,
  );

  const [recentLessons, setRecentLessons] = useState<RecentLesson[]>([]);
  const [groups, setGroups] = useState<TeacherGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLessons: 0,
    studyTime: 0,
    averageScore: 0,
    achievements: 0,
  });

  const [teacherMetrics, setTeacherMetrics] = useState<TeacherMetrics | null>(
    null,
  );
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [meetingLink, setMeetingLink] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const {
    isOpen: isLessonModalOpen,
    onOpen: onLessonModalOpen,
    onClose: onLessonModalClose,
  } = useDisclosure();

  // Rating system state
  const [lessonRatings, setLessonRatings] = useState<Record<string, string>>(
    {},
  );
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [currentRatingLesson, setCurrentRatingLesson] = useState<string | null>(
    null,
  );
  const [tempRating, setTempRating] = useState<string>("");

  // Load dashboard data
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      const [
        upcomingResponse,
        recentResponse,
        groupsResponse,
        teacherStatsResponse,
      ] = await Promise.all([
        apiClient.getUpcomingLessons(),
        apiClient.getRecentLessons(),
        apiClient.getTeacherGroups(user?.id || ""),
        apiClient.getTeacherStats(user?.id || ""),
      ]);

      console.log("🔍 Tutor Dashboard API responses:", {
        upcoming: upcomingResponse,
        recent: recentResponse,
        groups: groupsResponse,
        teacherStats: teacherStatsResponse,
      });

      // For teachers, only show upcoming lessons where they are the teacher
      if (
        upcomingResponse.data &&
        Array.isArray(upcomingResponse.data) &&
        upcomingResponse.data.length > 0
      ) {
        // Filter to ensure only lessons where current user is the teacher
        const teacherUpcomingLessons = upcomingResponse.data.filter(
          (lesson: any) =>
            lesson.teacher === "Вы" || lesson.teacher === user?.name,
        );

        if (teacherUpcomingLessons.length > 0) {
          console.log(
            "✅ Setting teacher upcoming lesson:",
            teacherUpcomingLessons[0],
          );
          setUpcomingLesson(teacherUpcomingLessons[0]);
        } else {
          console.log("⚠️ No upcoming lessons for current teacher");
          setUpcomingLesson(null);
        }
      } else {
        console.log("⚠️ No upcoming lessons data:", upcomingResponse);
        setUpcomingLesson(null);
      }

      if (recentResponse.data && Array.isArray(recentResponse.data)) {
        setRecentLessons(recentResponse.data);
      }

      // Use real teacher groups data
      if (groupsResponse.data && Array.isArray(groupsResponse.data)) {
        setGroups(groupsResponse.data);
      } else {
        console.log("⚠️ No teacher groups data:", groupsResponse);
        setGroups([]);
      }

      // Use real teacher statistics
      if (teacherStatsResponse.data) {
        const stats = teacherStatsResponse.data as TeacherStatsResponse;

        // Set teacher metrics
        const teacherMetrics: TeacherMetrics = {
          teacherId: stats.teacherId,
          totalLessons: stats.totalLessons,
          totalStudents: stats.totalStudents,
          averageRating: stats.averageRating,
          totalReactions: stats.totalReactions,
          positiveReactions: stats.positiveReactions,
          engagementRate: stats.engagementRate,
          lessonsThisMonth: stats.lessonsThisMonth,
          studentsThisMonth: stats.studentsThisMonth,
          totalFeedback: stats.totalFeedback,
          teacher: user!,
          groups: stats.groups || [],
          lessons: stats.recentLessons || [],
        };

        setTeacherMetrics(teacherMetrics);

        // Calculate stats from real teacher metrics
        setStats({
          totalLessons: stats.totalLessons,
          studyTime: stats.totalStudyHours,
          averageScore: Math.round(stats.averageRating * 20), // Convert rating to percentage
          achievements: Math.floor(stats.totalLessons / 10), // Achievement every 10 lessons
        });

        console.log("✅ Teacher stats loaded:", stats);
      } else {
        console.log("⚠️ No teacher stats data:", teacherStatsResponse);

        // Fallback to default values
        setStats({
          totalLessons: 0,
          studyTime: 0,
          averageScore: 0,
          achievements: 0,
        });
      }
    } catch (error) {
      console.error("Error loading tutor dashboard data:", error);

      // Set default values on error
      setStats({
        totalLessons: 0,
        studyTime: 0,
        averageScore: 0,
        achievements: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClassroom = () => {
    setMeetingLink(upcomingLesson?.meetingLink || "#");
    onOpen();
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    onLessonModalOpen();
  };

  const handleRateLesson = (lessonId: string) => {
    setCurrentRatingLesson(lessonId);
    setTempRating(lessonRatings[lessonId] || "");
    setRatingModalOpen(true);
  };

  const handleRatingSubmit = (rating: string) => {
    if (currentRatingLesson) {
      setLessonRatings((prev) => ({
        ...prev,
        [currentRatingLesson]: rating,
      }));
      setTempRating(rating);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p>Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="TEACHER">
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="min-h-screen bg-white lg:ml-4 xl:ml-0">
          {/* Hero Section */}
          {isLoading ? (
            <HeroSkeleton />
          ) : (
            <div className="pt-12 mb-8">
              <h1 className="text-5xl font-bold text-black tracking-tight">
                Привет, {user?.name}! 👋
              </h1>
              <p className="text-black/70 text-xl font-medium mt-2">
                Добро пожаловать в дашборд преподавателя
              </p>
            </div>
          )}

          {/* Next Lesson Section */}
          {isLoading ? (
            <NextLessonSkeleton />
          ) : (
            <div className="bg-gradient-to-br from-[#007EFB]/5 via-[#EE7A3F]/5 to-[#FDD130]/5 border border-[#007EFB]/20 rounded-3xl p-8 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#007EFB]/10 to-[#EE7A3F]/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#007EFB]/10 rounded-2xl">
                      <ClockIcon />
                    </div>
                    <div>
                      <h3 className="font-bold text-3xl text-black">
                        Следующее занятие
                      </h3>
                      <p className="text-black/70 font-medium text-base">
                        Подготовься к предстоящему занятию
                      </p>
                    </div>
                  </div>
                </div>

                {upcomingLesson ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-[#007EFB] rounded-full animate-pulse" />
                        <span className="text-black font-medium text-base">
                          {upcomingLesson.date} в {upcomingLesson.time}
                        </span>
                      </div>
                      <h4 className="font-bold text-2xl text-black mb-2">
                        {upcomingLesson.title}
                      </h4>
                      <div className="flex items-center gap-4 text-black/70">
                        <div className="flex items-center gap-2">
                          <ClockIcon />
                          <span className="font-medium text-sm">
                            Длительность: {upcomingLesson.duration}
                          </span>
                        </div>
                        {/* Group or Student Info */}
                        {upcomingLesson.groupName ? (
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                              />
                            </svg>
                            <span className="font-medium text-sm text-blue-700">
                              {upcomingLesson.groupName}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                              />
                            </svg>
                            <span className="font-medium text-sm text-purple-700">
                              {upcomingLesson.studentNames || "Студент"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center lg:items-end justify-end h-full">
                      <Button
                        className="w-full lg:w-auto font-bold px-8 text-white bg-[#007EFB] hover:bg-[#007EFB]/90"
                        size="lg"
                        startContent={<ClockIcon />}
                        onClick={handleJoinClassroom}
                      >
                        Подключиться
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-[#007EFB]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <div className="text-4xl">📅</div>
                    </div>
                    <p className="text-black font-bold text-lg mb-2">
                      Нет предстоящих уроков
                    </p>
                    <p className="text-black/70 font-medium text-base mb-4">
                      Запланируй следующее занятие для своих студентов
                    </p>
                    <Button
                      className="font-bold bg-[#007EFB] text-white"
                      size="md"
                      variant="flat"
                    >
                      Создать урок
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          {isLoading ? (
            <StatsGridSkeleton />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
              <div className="bg-white border border-[#007EFB]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#007EFB]/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-[#007EFB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-[#007EFB]/10 rounded-xl">
                      <BookIcon />
                    </div>
                    <span className="text-[#007EFB] text-xs font-bold bg-[#007EFB]/10 px-2 py-1 rounded-full">
                      {teacherMetrics?.lessonsThisMonth || 0}
                    </span>
                  </div>
                  <div className="text-4xl font-bold text-black mb-1">
                    {teacherMetrics?.totalLessons || 0}
                  </div>
                  <div className="text-black font-medium text-base">
                    Всего уроков
                  </div>
                  <div className="text-black/70 font-medium text-xs mt-1">
                    В этом месяце: {teacherMetrics?.lessonsThisMonth || 0}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#EE7A3F]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#EE7A3F]/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-[#EE7A3F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-[#EE7A3F]/10 rounded-xl">
                      <ClockIcon />
                    </div>
                    <span className="text-[#EE7A3F] text-xs font-bold bg-[#EE7A3F]/10 px-2 py-1 rounded-full">
                      {teacherMetrics?.studentsThisMonth || 0}
                    </span>
                  </div>
                  <div className="text-4xl font-bold text-black mb-1">
                    {teacherMetrics?.totalStudents || 0}
                  </div>
                  <div className="text-black font-medium text-base">
                    Всего студентов
                  </div>
                  <div className="text-black/70 font-medium text-xs mt-1">
                    В этом месяце: {teacherMetrics?.studentsThisMonth || 0}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#FDD130]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#FDD130]/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FDD130]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-[#FDD130]/10 rounded-xl">
                      <TrendingUpIcon />
                    </div>
                    <span className="text-[#FDD130] text-xs font-bold bg-[#FDD130]/10 px-2 py-1 rounded-full">
                      ⭐
                    </span>
                  </div>
                  <div className="text-4xl font-bold text-black mb-1">
                    {teacherMetrics?.averageRating || 0}
                  </div>
                  <div className="text-black font-medium text-base">
                    Рейтинг преподавателя
                  </div>
                  <div className="text-black/70 font-medium text-xs mt-1">
                    Из 5 звезд • {teacherMetrics?.totalFeedback || 0} отзывов
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#00B67A]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#00B67A]/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00B67A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-[#00B67A]/10 rounded-xl">
                      <AwardIcon />
                    </div>
                    <span className="text-[#00B67A] text-xs font-bold bg-[#00B67A]/10 px-2 py-1 rounded-full">
                      {teacherMetrics?.engagementRate || 0}%
                    </span>
                  </div>
                  <div className="text-4xl font-bold text-black mb-1">
                    {teacherMetrics?.totalReactions || 0}
                  </div>
                  <div className="text-black font-medium text-base">
                    Всего реакций
                  </div>
                  <div className="text-black/70 font-medium text-xs mt-1">
                    Вовлеченность: {teacherMetrics?.engagementRate || 0}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-black">
                  Быстрые действия
                </h2>
                <p className="text-black/70 font-medium text-lg mt-1">
                  Управляй своими уроками и группами
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                as={Link}
                className="h-24 bg-gradient-to-br from-[#007EFB] to-[#00B67A] text-white font-bold text-lg hover:opacity-90 transition-all duration-300"
                href="/lessons/create"
                size="lg"
                variant="flat"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📝</div>
                  <div>Создать урок</div>
                </div>
              </Button>

              <Button
                as={Link}
                className="h-24 bg-gradient-to-br from-[#EE7A3F] to-[#FDD130] text-white font-bold text-lg hover:opacity-90 transition-all duration-300"
                href="/groups/create"
                size="lg"
                variant="flat"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">👥</div>
                  <div>Создать группу</div>
                </div>
              </Button>

              <Button
                as={Link}
                className="h-24 bg-gradient-to-br from-[#FDD130] to-[#EE7A3F] text-white font-bold text-lg hover:opacity-90 transition-all duration-300"
                href="/schedule"
                size="lg"
                variant="flat"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📅</div>
                  <div>Расписание</div>
                </div>
              </Button>

              <Button
                as={Link}
                className="h-24 bg-gradient-to-br from-[#00B67A] to-[#007EFB] text-white font-bold text-lg hover:opacity-90 transition-all duration-300"
                href="/analytics"
                size="lg"
                variant="flat"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div>Аналитика</div>
                </div>
              </Button>
            </div>
          </section>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Groups Section */}
            {groups.length > 0 && (
              <section className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-4xl font-bold text-black">
                      Твои группы
                    </h2>
                    <p className="text-black/70 font-medium text-lg mt-1">
                      Группы, которыми ты управляешь как преподаватель
                    </p>
                  </div>
                  <Button
                    as={Link}
                    className="font-bold text-[#007EFB] hover:text-[#007EFB]/80 flex items-center gap-2 group bg-transparent p-0 h-auto min-w-0"
                    href="/groups"
                    size="lg"
                    variant="light"
                  >
                    Управлять группами
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 5l7 7-7 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </Button>
                </div>

                {/* Groups Grid - Single line for desktop with overflow indicator */}
                <div className="relative">
                  <div className="grid grid-cols-1 gap-4 sm:flex sm:gap-4 sm:overflow-x-auto sm:pb-4 scrollbar-hide">
                    {groups.slice(0, 2).map((group) => (
                      <div
                        key={group.id}
                        className="w-full sm:flex-shrink-0 sm:w-80 bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-6 hover:border-slate-300/60 transition-all duration-300 hover:shadow-lg flex flex-col"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#007EFB] to-[#00B67A] rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                            {group.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-black text-lg leading-tight truncate">
                              {group.name}
                            </h3>
                            <p className="text-black/70 font-medium text-sm">
                              {group.level} • {group.studentCount || 0}{" "}
                              студентов
                            </p>
                            {group.course && (
                              <p className="text-black/50 font-medium text-xs mt-1">
                                Курс: {group.course.name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3 flex-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-black/70 font-medium">
                              Прогресс
                            </span>
                            <span className="text-black font-bold">
                              {typeof group.progress === "object" &&
                              group.progress
                                ? group.progress.progressPercent
                                : 0}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-slate-200/50 rounded-full h-2">
                            <div
                              className="h-2 bg-gradient-to-r from-[#007EFB] to-[#00B67A] rounded-full"
                              style={{
                                width: `${typeof group.progress === "object" && group.progress ? group.progress.progressPercent : 0}%`,
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-black/50">
                            <span>Уроков: {group.lessonCount || 0}</span>
                            <span>Макс: {group.maxStudents}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            className="flex-1 font-semibold text-white bg-[#007EFB] hover:bg-[#007EFB]/90"
                            size="md"
                          >
                            Управлять
                          </Button>
                          <Button
                            className="flex-1 font-semibold text-[#007EFB] border border-[#007EFB] hover:bg-[#007EFB]/10"
                            size="md"
                            variant="bordered"
                          >
                            Telegram
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* +N Groups indicator when more than 2 */}
                    {groups.length > 2 && (
                      <div className="w-full sm:flex-shrink-0 sm:w-80 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center hover:border-slate-400 transition-all duration-300">
                        <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-4">
                          <svg
                            className="w-8 h-8 text-slate-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                            />
                          </svg>
                        </div>
                        <h3 className="font-bold text-slate-700 text-lg mb-2">
                          +{groups.length - 2} групп
                        </h3>
                        <p className="text-slate-600 font-medium text-sm text-center">
                          У тебя еще {groups.length - 2} активных групп
                        </p>
                        <Button
                          as={Link}
                          className="mt-4 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
                          href="/groups"
                          size="lg"
                          variant="flat"
                        >
                          Посмотреть все
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Recent Lessons Section */}
            <section className="relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-bold text-black">
                    Недавние уроки
                  </h2>
                  <p className="text-black/70 font-medium text-lg mt-1">
                    Ваши последние занятия и отзывы студентов
                  </p>
                </div>
                <Button
                  as={Link}
                  className="font-bold text-[#007EFB] hover:text-[#007EFB]/80 flex items-center gap-2 group bg-transparent p-0 h-auto min-w-0"
                  href="#"
                  size="lg"
                  variant="light"
                >
                  История уроков
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </Button>
              </div>

              {/* Lessons list */}
              <div className="space-y-3">
                {isLoading ? (
                  <RecentLessonsSkeleton />
                ) : lessons.length > 0 ? (
                  lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      aria-label={`Открыть детали урока: ${lesson.title}`}
                      className="group cursor-pointer bg-white border border-slate-200/60 rounded-2xl p-4 relative overflow-hidden hover:border-slate-300/60 transition-all duration-300"
                      role="button"
                      tabIndex={0}
                      onClick={() => handleLessonClick(lesson)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleLessonClick(lesson);
                        }
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10">
                        {/* Desktop Layout - Full horizontal layout */}
                        <div className="hidden xl:flex items-center gap-4">
                          {/* Lesson Avatar with Dynamic Gradient */}
                          <div
                            className={`w-12 h-12 bg-gradient-to-br ${getLessonGradient(index)} rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                          >
                            {index + 1}
                          </div>

                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-black text-base leading-tight truncate">
                              {lesson.title}
                            </h4>
                            <p className="text-black/70 font-medium text-sm">
                              {lesson.date} •{" "}
                              {lesson.group?.name || "Индивидуальный урок"}
                            </p>
                          </div>

                          {/* Feedback Reaction Counts Only */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Student Count */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-xl">
                              <svg
                                className="w-4 h-4 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
                              </svg>
                              <span className="text-blue-700 font-medium text-xs">
                                {lesson._count?.students || 0} студентов
                              </span>
                            </div>

                            {/* Positive Feedback Count */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-xl">
                              <svg
                                className="w-4 h-4 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
                              </svg>
                              <span className="text-green-700 font-medium text-xs">
                                {
                                  lesson.reactions.filter(
                                    (r) =>
                                      r.reactionType === "THUMBS_UP" ||
                                      r.reactionType === "LOVE" ||
                                      r.reactionType === "EXCITED" ||
                                      r.reactionType === "CLAP",
                                  ).length
                                }{" "}
                                👍
                              </span>
                            </div>

                            {/* Recording Status */}
                            {lesson.recording && (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-xl">
                                <svg
                                  className="w-4 h-4 text-purple-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                  />
                                </svg>
                                <span className="text-purple-700 font-medium text-xs">
                                  Запись
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Medium Screen Layout - Compact horizontal layout */}
                        <div className="hidden lg:flex xl:hidden items-center gap-4">
                          {/* Lesson Avatar with Dynamic Gradient */}
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${getLessonGradient(index)} rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                          >
                            {index + 1}
                          </div>

                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-black text-sm leading-tight truncate">
                              {lesson.title}
                            </h4>
                            <p className="text-black/70 font-medium text-xs">
                              {lesson.date} •{" "}
                              {lesson.group?.name || "Индивидуальный"}
                            </p>
                          </div>

                          {/* Compact Feedback Section */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Student Count - Compact */}
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-lg">
                              <svg
                                className="w-3 h-3 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
                              </svg>
                              <span className="text-blue-700 font-medium text-xs">
                                {lesson._count?.students || 0}
                              </span>
                            </div>

                            {/* Positive Feedback - Compact */}
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-lg">
                              <svg
                                className="w-3 h-3 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
                              </svg>
                              <span className="text-green-700 font-medium text-xs">
                                {
                                  lesson.reactions.filter(
                                    (r) =>
                                      r.reactionType === "THUMBS_UP" ||
                                      r.reactionType === "LOVE" ||
                                      r.reactionType === "EXCITED" ||
                                      r.reactionType === "CLAP",
                                  ).length
                                }{" "}
                                👍
                              </span>
                            </div>

                            {/* Recording Status - Compact */}
                            {lesson.recording && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-lg">
                                <svg
                                  className="w-3 h-3 text-purple-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                  />
                                </svg>
                                <span className="text-purple-700 font-medium text-xs">
                                  📹
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Mobile Layout - Buttons moved to separate row */}
                        <div className="lg:hidden">
                          <div className="flex items-center gap-4 mb-4">
                            {/* Lesson Avatar with Dynamic Gradient */}
                            <div
                              className={`w-12 h-12 bg-gradient-to-br ${getLessonGradient(index)} rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                            >
                              {index + 1}
                            </div>

                            {/* Lesson Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-black text-base leading-tight truncate">
                                {lesson.title}
                              </h4>
                              <p className="text-black/70 font-medium text-sm">
                                {lesson.date} •{" "}
                                {lesson.group?.name || "Индивидуальный урок"}
                              </p>
                            </div>
                          </div>

                          {/* Mobile Feedback Row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Student Count */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-xl">
                              <svg
                                className="w-4 h-4 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
                              </svg>
                              <span className="text-blue-700 font-medium text-xs">
                                {lesson._count?.students || 0} студентов
                              </span>
                            </div>

                            {/* Positive Feedback */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-xl">
                              <svg
                                className="w-4 h-4 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
                              </svg>
                              <span className="text-green-700 font-medium text-xs">
                                {
                                  lesson.reactions.filter(
                                    (r) =>
                                      r.reactionType === "THUMBS_UP" ||
                                      r.reactionType === "LOVE" ||
                                      r.reactionType === "EXCITED" ||
                                      r.reactionType === "CLAP",
                                  ).length
                                }{" "}
                                👍
                              </span>
                            </div>

                            {/* Recording Status */}
                            {lesson.recording && (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-xl">
                                <svg
                                  className="w-4 h-4 text-purple-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                  />
                                </svg>
                                <span className="text-purple-700 font-medium text-xs">
                                  Запись
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <div className="text-4xl">📝</div>
                    </div>
                    <p className="text-slate-600 font-medium text-lg mb-2">
                      Нет недавних уроков
                    </p>
                    <p className="text-slate-500 text-base">
                      Проведите свой первый урок, чтобы увидеть его здесь
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Join Classroom Modal */}
      <Modal isOpen={isOpen} size="lg" onClose={onClose}>
        <ModalContent className="bg-white border border-slate-200/60 rounded-3xl">
          <ModalHeader className="text-black font-bold text-2xl pb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#007EFB] to-[#00B67A] rounded-2xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-black font-bold text-2xl">
                  Присоединиться к классу
                </h3>
                <p className="text-black/60 font-medium text-sm mt-1">
                  Готов к уроку? Присоединяйся прямо сейчас
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="pt-6">
            <div className="p-6 bg-gradient-to-br from-[#007EFB]/5 via-[#EE7A3F]/5 to-[#FDD130]/5 border border-[#007EFB]/20 rounded-2xl">
              <h4 className="font-bold text-black text-lg mb-3">
                Ссылка на встречу
              </h4>
              <p className="text-black/70 font-medium text-sm mb-4">
                Скопируй ссылку ниже, чтобы присоединиться к предстоящему уроку.
              </p>
              <div className="space-y-3">
                <Input
                  isReadOnly
                  className="mb-2"
                  classNames={{
                    input: "font-medium text-black",
                    inputWrapper:
                      "bg-white border-[#007EFB]/30 focus-within:border-[#007EFB] shadow-none",
                  }}
                  endContent={
                    <Button
                      isIconOnly
                      className="min-w-0"
                      size="sm"
                      variant="light"
                      onClick={() => {
                        navigator.clipboard.writeText(meetingLink);
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </Button>
                  }
                  placeholder="https://zoom.us/j/..."
                  type="url"
                  value={meetingLink}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="gap-3">
            <Button variant="light" onClick={onClose}>
              Отмена
            </Button>
            <Button
              className="font-bold text-white bg-[#007EFB] hover:bg-[#007EFB]/90"
              onClick={() => {
                window.open(meetingLink, "_blank");
                onClose();
              }}
            >
              Присоединиться к классу
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Teacher Lesson Details Modal */}
      <Modal isOpen={isLessonModalOpen} size="2xl" onClose={onLessonModalClose}>
        <ModalContent>
          <ModalHeader className="text-black font-bold text-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#007EFB]/10 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#007EFB]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-black font-bold text-xl">Детали урока</h3>
                <p className="text-black/60 font-medium text-sm">
                  Просмотр информации об уроке
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedLesson && (
              <div className="space-y-6">
                {/* Lesson Header */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${getLessonGradient(lessons.findIndex((l) => l.id === selectedLesson.id))} rounded-2xl flex items-center justify-center text-white font-bold text-xl`}
                  >
                    {lessons.findIndex((l) => l.id === selectedLesson.id) + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">
                      {selectedLesson.title}
                    </h3>
                    <p className="text-slate-600 font-medium text-sm">
                      {selectedLesson.date} • {selectedLesson.teacher.name}
                    </p>
                    <p className="text-slate-500 font-medium text-xs">
                      {selectedLesson.startTime} - {selectedLesson.endTime}
                    </p>
                  </div>
                </div>

                {/* Feedback Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Reactions */}
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 text-sm">
                          Всего реакций
                        </h4>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {selectedLesson?._count?.reactions || 0}
                      </div>
                      <p className="text-blue-700 font-medium text-xs">
                        от студентов
                      </p>
                    </div>
                  </div>

                  {/* Positive Feedback */}
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-100 rounded-xl">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900 text-sm">
                          Положительные
                        </h4>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {selectedLesson?.reactions.filter(
                          (r) =>
                            r.reactionType === "THUMBS_UP" ||
                            r.reactionType === "LOVE" ||
                            r.reactionType === "EXCITED" ||
                            r.reactionType === "CLAP",
                        ).length || 0}{" "}
                        👍
                      </div>
                      <p className="text-green-700 font-medium text-xs">
                        довольных студентов
                      </p>
                    </div>
                  </div>

                  {/* Engagement Rate */}
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-100 rounded-xl">
                        <svg
                          className="w-5 h-5 text-amber-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-900 text-sm">
                          Вовлеченность
                        </h4>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-600 mb-1">
                        {selectedLesson
                          ? Math.round(
                              ((selectedLesson.reactions.length || 0) /
                                (selectedLesson._count?.students || 1)) *
                                100,
                            )
                          : 0}
                        %
                      </div>
                      <p className="text-amber-700 font-medium text-xs">
                        активность студентов
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    className="flex-1 font-semibold text-white bg-[#007EFB] hover:bg-[#007EFB]/90"
                    size="lg"
                  >
                    Просмотреть все отзывы
                  </Button>
                  <Button
                    className="flex-1 font-semibold text-[#007EFB] border border-[#007EFB] hover:bg-[#007EFB]/10"
                    size="lg"
                    variant="bordered"
                  >
                    Экспорт данных
                  </Button>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onLessonModalClose}>
              Закрыть
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Rating Modal */}
      <Modal
        isOpen={ratingModalOpen}
        size="md"
        onClose={() => setRatingModalOpen(false)}
      >
        <ModalContent className="bg-white border border-slate-200/60 rounded-3xl">
          <ModalHeader className="text-black font-bold text-xl pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-black font-bold text-xl">Оцени урок</h3>
                <p className="text-black/60 font-medium text-sm mt-1">
                  Как тебе прошел этот урок?
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="pt-6">
            {tempRating ? (
              // Confirmation view
              <div className="text-center space-y-6">
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl">
                  <div className="text-6xl mb-3">{tempRating}</div>
                  <h4 className="font-bold text-amber-900 text-lg mb-2">
                    Твоя оценка
                  </h4>
                  <p className="text-amber-700 font-medium text-sm">
                    {tempRating === "😠" && "Ты был недоволен уроком"}
                    {tempRating === "😴" && "Урок был скучным"}
                    {tempRating === "😐" && "Урок был нормальным"}
                    {tempRating === "😊" && "Тебе понравился урок"}
                    {tempRating === "🥰" && "Ты в восторге от урока!"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 font-medium bg-white text-black border border-slate-300 hover:bg-slate-50"
                    onClick={() => setTempRating("")}
                  >
                    Изменить
                  </Button>
                  <Button
                    className="flex-1 font-medium bg-amber-500 text-white hover:bg-amber-600"
                    onClick={() => setRatingModalOpen(false)}
                  >
                    Отлично
                  </Button>
                </div>
              </div>
            ) : (
              // Rating selection view
              <div className="space-y-6">
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { emoji: "😠", color: "bg-red-100 hover:bg-red-200" },
                    { emoji: "😴", color: "bg-yellow-100 hover:bg-yellow-200" },
                    { emoji: "😐", color: "bg-gray-100 hover:bg-gray-200" },
                    { emoji: "😊", color: "bg-blue-100 hover:bg-blue-200" },
                    { emoji: "🥰", color: "bg-green-100 hover:bg-green-200" },
                  ].map((rating) => (
                    <button
                      key={rating.emoji}
                      className={`p-4 rounded-2xl border-2 border-transparent hover:border-amber-300 transition-all duration-200 ${rating.color} flex items-center justify-center`}
                      onClick={() => handleRatingSubmit(rating.emoji)}
                    >
                      <div className="text-4xl">{rating.emoji}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </ProtectedRoute>
  );
}
