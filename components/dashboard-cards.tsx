"use client";

import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useState } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <Card>
      <CardBody className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-default-600 font-medium text-sm">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
            {subtitle && (
              <p className="text-default-500 font-medium text-xs mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 p-3 bg-default-100 rounded-lg text-default-700">
              {icon}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

interface CourseCardProps {
  id: string;
  title: string;
  level: string;
  progressPercent: number;
  teacher: string;
  nextLesson?: string;
  totalLessons: number;
  completedLessons: number;
  coverImage?: string;
}

export function CourseCard({
  title,
  level,
  progressPercent,
  teacher,
  nextLesson,
  totalLessons,
  completedLessons,
  coverImage,
}: CourseCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getGradientByProgress = (progress: number) => {
    if (progress >= 80) return "from-emerald-500 to-teal-600";
    if (progress >= 60) return "from-blue-500 to-indigo-600";
    if (progress >= 40) return "from-purple-500 to-pink-600";

    return "from-orange-500 to-red-600";
  };

  const getBgByProgress = (progress: number) => {
    if (progress >= 80) return "from-emerald-50 to-teal-50";
    if (progress >= 60) return "from-blue-50 to-indigo-50";
    if (progress >= 40) return "from-purple-50 to-pink-50";

    return "from-orange-50 to-red-50";
  };

  const handleCourseAction = (action: string) => {
    switch (action) {
      case "details":
        // Navigate to course details page
        window.open(
          `/courses/${title.toLowerCase().replace(/\s+/g, "-")}`,
          "_blank",
        );
        break;
      case "materials":
        // Download course materials
        console.log("Downloading materials for:", title);
        break;
      case "teacher":
        // Contact teacher
        window.open(
          `mailto:${teacher.toLowerCase().replace(/\s+/g, ".")}@tutorium.io`,
          "_blank",
        );
        break;
      case "schedule":
        // View course schedule
        window.open("/schedule", "_blank");
        break;
      case "certificate":
        // View/download certificate if completed
        if (progressPercent >= 100) {
          console.log("Downloading certificate for:", title);
        } else {
          console.log("Course not completed yet");
        }
        break;
    }
    setIsDropdownOpen(false);
  };

  return (
    <div
      className={`relative bg-gradient-to-br ${getBgByProgress(progressPercent)} border border-slate-200/50 rounded-3xl p-6 group hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-500 overflow-hidden`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div
          className={`w-full h-full bg-gradient-to-br ${getGradientByProgress(progressPercent)} rounded-full translate-x-8 -translate-y-8`}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {coverImage ? (
                <div className="w-12 h-12 rounded-2xl overflow-hidden">
                  <img
                    alt={title}
                    className="w-full h-full object-cover"
                    src={coverImage}
                  />
                </div>
              ) : (
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${getGradientByProgress(progressPercent)} rounded-2xl flex items-center justify-center text-white font-semibold text-lg`}
                >
                  {title.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-slate-900 leading-tight">
                  {title}
                </h3>
                <Chip
                  className="mt-1 font-bold text-xs bg-white/80 text-slate-700"
                  size="sm"
                  variant="flat"
                >
                  {level}
                </Chip>
              </div>
            </div>
          </div>
        </div>

        {/* Progress section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-800 font-bold text-sm">
              Course Progress
            </span>
            <span className="font-semibold text-lg text-slate-900">
              {progressPercent}%
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-slate-200/50 rounded-full h-3">
              <div
                className={`h-3 bg-gradient-to-r ${getGradientByProgress(progressPercent)} rounded-full transition-all duration-700`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <p className="text-slate-600 font-semibold text-xs mt-2">
            {completedLessons} из {totalLessons} тем пройдено
          </p>
        </div>

        {/* Next lesson */}
        {nextLesson && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-slate-800 font-bold text-sm">
                Следующий урок
              </span>
            </div>
            <p className="text-slate-700 font-semibold text-sm">{nextLesson}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            className={`flex-1 font-semibold text-white transition-all duration-300`}
            size="lg"
            style={{
              backgroundColor:
                progressPercent >= 80
                  ? "#10b981"
                  : progressPercent >= 60
                    ? "#3b82f6"
                    : progressPercent >= 40
                      ? "#8b5cf6"
                      : "#f59e0b",
            }}
          >
            Перейти в курс
          </Button>
          <Dropdown isOpen={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownTrigger>
              <Button
                className="font-semibold text-slate-700 hover:bg-white/50"
                size="lg"
                variant="ghost"
              >
                Еще
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Course actions"
              className="w-56"
              onAction={(key) => handleCourseAction(key as string)}
            >
              <DropdownItem key="details" className="py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#007EFB]/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#007EFB]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-black text-sm">Детали курса</p>
                    <p className="text-black/60 font-medium text-xs">
                      Просмотр полной информации
                    </p>
                  </div>
                </div>
              </DropdownItem>

              <DropdownItem key="materials" className="py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#EE7A3F]/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#EE7A3F]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-black text-sm">
                      Материалы курса
                    </p>
                    <p className="text-black/60 font-medium text-xs">
                      Скачать учебные материалы
                    </p>
                  </div>
                </div>
              </DropdownItem>

              <DropdownItem key="teacher" className="py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#FDD130]/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#FDD130]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-black text-sm">
                      Связаться с учителем
                    </p>
                    <p className="text-black/60 font-medium text-xs">
                      Написать {teacher}
                    </p>
                  </div>
                </div>
              </DropdownItem>

              <DropdownItem key="schedule" className="py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#00B67A]/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#00B67A]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-black text-sm">
                      Расписание занятий
                    </p>
                    <p className="text-black/60 font-medium text-xs">
                      Просмотр календаря курса
                    </p>
                  </div>
                </div>
              </DropdownItem>

              {progressPercent >= 100 ? (
                <DropdownItem key="certificate" className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#007EFB]/10 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-[#007EFB]"
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
                    </div>
                    <div>
                      <p className="font-bold text-black text-sm">Сертификат</p>
                      <p className="text-black/60 font-medium text-xs">
                        Скачать сертификат об окончании
                      </p>
                    </div>
                  </div>
                </DropdownItem>
              ) : null}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}

interface UpcomingLessonCardProps {
  lesson?: {
    id: string;
    date: string;
    time: string;
    title: string;
    teacher: string;
    duration: string;
    meetingLink?: string;
  } | null;
}

export function UpcomingLessonCard({ lesson }: UpcomingLessonCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <h2 className="text-lg font-bold">Upcoming lesson</h2>
      </CardHeader>
      <CardBody className="pt-0">
        {lesson ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm font-bold text-green-700">
                  {lesson.date} at {lesson.time}
                </span>
              </div>
              <h3 className="font-bold text-base">{lesson.title}</h3>
              <p className="text-default-600 font-medium text-sm">
                with {lesson.teacher}
              </p>
              <p className="text-default-500 font-medium text-sm mt-1">
                Duration: {lesson.duration}
              </p>
            </div>

            <Divider />

            <div className="flex gap-3">
              <Button
                as={Link}
                className="flex-1 font-semibold"
                color="primary"
                href={lesson.meetingLink || "#"}
                size="sm"
              >
                Join classroom
              </Button>
              <Button className="font-medium" size="sm" variant="light">
                Reschedule
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-default-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-default-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <p className="text-default-600 font-medium text-sm">
              No upcoming lessons
            </p>
            <Button className="mt-3 font-medium" size="sm" variant="light">
              Schedule lesson
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

interface RecentActivityItem {
  id: string;
  type: "lesson" | "assignment" | "message";
  title: string;
  description: string;
  timestamp: string;
  teacher?: string;
}

interface RecentActivityCardProps {
  activities: RecentActivityItem[];
}

export function RecentActivityCard({ activities }: RecentActivityCardProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "lesson":
        return (
          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-3 h-3 text-blue-600"
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
        );
      case "assignment":
        return (
          <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-3 h-3 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 713.138-3.138z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
        );
      case "message":
        return (
          <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-3 h-3 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-default-100 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-default-400 rounded-full" />
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg font-bold">Recent activity</h2>
          <Link className="font-medium" color="primary" href="#" size="sm">
            View all
          </Link>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              {getActivityIcon(activity.type)}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{activity.title}</p>
                <p className="text-default-600 font-medium text-sm mt-1 truncate">
                  {activity.description}
                </p>
                {activity.teacher && (
                  <p className="text-default-500 font-medium text-xs">
                    by {activity.teacher}
                  </p>
                )}
                <p className="text-default-500 font-medium text-xs mt-1">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
