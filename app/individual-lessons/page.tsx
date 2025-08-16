"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";

import { ProtectedRoute } from "@/components/protected-route";
import { apiClient } from "@/lib/utils/api";
import { useAuth } from "@/lib/auth/context";

interface IndividualLesson {
  id: string;
  title: string;
  description?: string;
  date: string;
  duration: number;
  status: string;
  youtubeLink?: string;
  transcript?: string;
  topic?: {
    id: string;
    name: string;
    order: number;
  };
  nextTopic?: {
    id: string;
    name: string;
  };
  product: {
    id: string;
    name: string;
    type: string;
    course: {
      id: string;
      name: string;
      level: string;
    };
  };
  teacher: {
    id: string;
    name: string;
    email: string;
  };
}

export default function IndividualLessonsPage() {
  const [lessons, setLessons] = useState<IndividualLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadIndividualLessons();
    }
  }, [user]);

  const loadIndividualLessons = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getIndividualLessons();

      if (response.error) {
        throw new Error(response.error);
      }

      setLessons((response.data as IndividualLesson[]) || []);
    } catch (err) {
      console.error("Error loading individual lessons:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "warning";
      case "SCHEDULED":
        return "primary";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Завершен";
      case "IN_PROGRESS":
        return "В процессе";
      case "SCHEDULED":
        return "Запланирован";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Error loading individual lessons
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button color="primary" onClick={loadIndividualLessons}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white lg:ml-4 xl:ml-0">
        {/* Hero Section */}
        <div className="pt-12 mb-8">
          <h1 className="text-5xl font-bold text-black tracking-tight">
            Индивидуальные уроки 📚
          </h1>
          <p className="text-black/70 text-xl font-medium mt-2">
            Персональные занятия с преподавателем
          </p>
        </div>

        {/* Lessons Grid */}
        {lessons.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white border border-slate-200/60 rounded-2xl p-6 hover:border-slate-300/60 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#EE7A3F] to-[#FDD130] rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    📚
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-black text-lg leading-tight truncate">
                      {lesson.title}
                    </h3>
                    <p className="text-black/70 font-medium text-sm">
                      {lesson.product.course.level} •{" "}
                      {lesson.product.course.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-sm">
                      Статус
                    </span>
                    <Chip
                      color={getStatusColor(lesson.status)}
                      size="sm"
                      variant="flat"
                    >
                      {getStatusLabel(lesson.status)}
                    </Chip>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-sm">
                      Дата
                    </span>
                    <span className="text-black font-medium text-sm">
                      {formatDate(lesson.date)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-sm">
                      Длительность
                    </span>
                    <span className="text-black font-medium text-sm">
                      {lesson.duration} мин
                    </span>
                  </div>

                  {lesson.topic && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium text-sm">
                        Тема
                      </span>
                      <span className="text-black font-medium text-sm">
                        {lesson.topic.name}
                      </span>
                    </div>
                  )}

                  {lesson.nextTopic && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium text-sm">
                        Следующая
                      </span>
                      <span className="text-black font-medium text-sm">
                        {lesson.nextTopic.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-sm">
                      Преподаватель
                    </span>
                    <span className="text-black font-medium text-sm">
                      {lesson.teacher.name}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  {lesson.youtubeLink && (
                    <Button
                      as="a"
                      className="flex-1 font-semibold text-white bg-[#FF0000] hover:bg-[#FF0000]/90"
                      href={lesson.youtubeLink}
                      rel="noopener noreferrer"
                      size="lg"
                      target="_blank"
                    >
                      Смотреть на YouTube
                    </Button>
                  )}
                  {lesson.transcript && (
                    <Button
                      className="flex-1 font-semibold text-white bg-[#007EFB] hover:bg-[#007EFB]/90"
                      size="lg"
                    >
                      Читать транскрипт
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <div className="text-4xl">📚</div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Нет индивидуальных уроков
            </h3>
            <p className="text-gray-600">
              У вас пока нет индивидуальных уроков. Обратитесь к администратору
              для получения доступа.
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
