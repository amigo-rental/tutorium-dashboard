"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";

import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/lib/auth/context";
import { apiClient } from "@/lib/utils/api";
import { LEVEL_OPTIONS } from "@/lib/constants/levels";
import { User as UserType, Group } from "@/types";

interface UserWithStats extends UserType {
  averageRating?: number;
  totalFeedbacks?: number;
  lastActiveDate?: string;
  group?: Group;
  groups?: Group[];
  courses?: any[];
}

export default function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Unwrap params
  const { id } = use(params);

  // Data state
  const [user, setUser] = useState<UserWithStats | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<UserWithStats[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "STUDENT" as "ADMIN" | "TEACHER" | "STUDENT",
    level: "",
    isActive: true,
  });

  useEffect(() => {
    if (currentUser && currentUser.role === "ADMIN") {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load user data
      const userResponse = await apiClient.getUserById(id);
      if (userResponse.data) {
        const userData = userResponse.data as UserWithStats;
        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          level: userData.level || "",
          isActive: userData.isActive,
        });
      }

      // Load groups and courses
      const [groupsResponse, coursesResponse] = await Promise.all([
        apiClient.getGroups(),
        apiClient.getCourses(),
      ]);

      if (groupsResponse.data) {
        setGroups(groupsResponse.data as Group[]);
      }

      if (coursesResponse.data) {
        setCourses(coursesResponse.data as any[]);
      }

      // Load teachers for individual lessons
      const teachersResponse = await apiClient.getAllUsers();
      if (teachersResponse.data) {
        const teachersList = (teachersResponse.data as UserWithStats[]).filter(
          (u: UserWithStats) => u.role === "TEACHER" && u.isActive
        );
        setTeachers(teachersList);
      }

    } catch (error) {
      console.error("Error loading data:", error);
      setMessage({ type: "error", text: "Ошибка при загрузке данных" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      setMessage(null);

      const updateData = {
        id: user.id,
        firstName: formData.name.split(" ")[0],
        lastName: formData.name.split(" ").slice(1).join(" ") || "",
        email: formData.email,
        role: formData.role,
        level: formData.level || undefined,
        isActive: formData.isActive,
      };

      const response = await apiClient.updateUser(updateData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setMessage({ type: "success", text: "Пользователь успешно обновлен!" });
      
      // Reload user data
      await loadData();
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage({ type: "error", text: "Ошибка при обновлении пользователя" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <div className="min-h-screen bg-white lg:ml-4 xl:ml-0">
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="pt-12 mb-8">
              <div className="h-8 bg-slate-200 rounded w-2/3 mb-4" />
              <div className="h-6 bg-slate-200 rounded w-1/2" />
            </div>
            
            {/* Cards Skeleton */}
            <div className="space-y-8">
              <div className="h-96 bg-slate-200 rounded-3xl" />
              <div className="h-64 bg-slate-200 rounded-3xl" />
              <div className="h-48 bg-slate-200 rounded-3xl" />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!user) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <div className="min-h-screen bg-white lg:ml-4 xl:ml-0">
          <div className="pt-12">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <div className="text-4xl">👤</div>
              </div>
              <h1 className="text-3xl font-bold text-black mb-4">
                Пользователь не найден
              </h1>
              <p className="text-black/70 text-lg mb-6">
                Возможно, пользователь был удален или у вас нет доступа
              </p>
              <Button 
                className="font-bold text-white bg-[#007EFB] hover:bg-[#007EFB]/90 px-8"
                size="lg"
                onClick={() => router.back()}
              >
                Вернуться назад
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-white lg:ml-4 xl:ml-0">
        <div className="pt-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                className="font-bold text-white bg-[#007EFB] hover:bg-[#007EFB]/90 px-6"
                size="lg"
                onClick={() => router.back()}
              >
                ← Назад
              </Button>
              <h1 className="text-4xl font-bold text-black">Редактирование пользователя</h1>
            </div>
            <p className="text-black/70 font-medium text-lg">
              Управление профилем и настройками пользователя
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-2xl ${
              message.type === "success" 
                ? "bg-green-50 border border-green-200 text-green-800" 
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              <p className="font-medium">{message.text}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-gradient-to-br from-[#007EFB]/5 via-[#EE7A3F]/5 to-[#FDD130]/5 border border-[#007EFB]/20 rounded-3xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#007EFB]/10 to-[#EE7A3F]/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-[#007EFB]/10 rounded-2xl">
                  <svg className="w-7 h-7 text-[#007EFB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-3xl text-black">Основная информация</h2>
                  <p className="text-black/70 font-medium text-base">Личные данные и настройки</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Input
                  label="Имя"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  classNames={{
                    label: "font-medium text-black",
                    input: "font-medium text-black",
                    inputWrapper: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none h-12"
                  }}
                  variant="bordered"
                />

                <Input
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  classNames={{
                    label: "font-medium text-black",
                    input: "font-medium text-black",
                    inputWrapper: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none h-12"
                  }}
                  variant="bordered"
                />

                <Select
                  label="Роль"
                  selectedKeys={[formData.role]}
                  onSelectionChange={(keys) => {
                    const selectedRole = Array.from(keys)[0] as "ADMIN" | "TEACHER" | "STUDENT";
                    setFormData({ ...formData, role: selectedRole });
                  }}
                  classNames={{
                    label: "font-medium text-black",
                    trigger: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none h-12",
                    value: "font-medium text-black",
                  }}
                  variant="bordered"
                >
                  <SelectItem key="STUDENT">Студент</SelectItem>
                  <SelectItem key="TEACHER">Преподаватель</SelectItem>
                  <SelectItem key="ADMIN">Администратор</SelectItem>
                </Select>

                <Select
                  label="Уровень"
                  placeholder="Выберите уровень"
                  selectedKeys={formData.level ? [formData.level] : []}
                  onSelectionChange={(keys) => {
                    const selectedLevel = Array.from(keys)[0] as string;
                    setFormData({ ...formData, level: selectedLevel });
                  }}
                  classNames={{
                    label: "font-medium text-black",
                    trigger: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none h-12",
                    value: "font-medium text-black",
                  }}
                  variant="bordered"
                >
                  {LEVEL_OPTIONS.map((level) => (
                    <SelectItem key={level.value} textValue={level.label}>
                      {level.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="flex justify-end mt-8">
                <Button
                  className="font-bold text-white bg-[#007EFB] hover:bg-[#007EFB]/90 px-8"
                  disabled={isSaving}
                  size="lg"
                  onClick={handleSaveUser}
                >
                  {isSaving ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </div>
            </div>
          </div>

          {/* User Statistics */}
          <div className="bg-gradient-to-br from-[#FDD130]/5 via-[#EE7A3F]/5 to-[#007EFB]/5 border border-[#FDD130]/20 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FDD130]/10 to-[#EE7A3F]/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-[#FDD130]/10 rounded-2xl">
                  <svg className="w-7 h-7 text-[#FDD130]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-3xl text-black">Статистика пользователя</h2>
                  <p className="text-black/70 font-medium text-base">Активность и прогресс</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-white border border-[#007EFB]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#007EFB]/40 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#007EFB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-[#007EFB]/10 rounded-xl">
                        <svg className="w-6 h-6 text-[#007EFB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-black mb-1">
                      {user.totalFeedbacks || 0}
                    </div>
                    <div className="text-black font-medium text-base">
                      Отзывов
                    </div>
                    <div className="text-black/70 font-medium text-xs mt-1">
                      Получено
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#00B67A]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#00B67A]/40 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00B67A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-[#00B67A]/10 rounded-xl">
                        <svg className="w-6 h-6 text-[#00B67A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-black mb-1">
                      {user.averageRating ? user.averageRating.toFixed(1) : "—"}
                    </div>
                    <div className="text-black font-medium text-base">
                      Рейтинг
                    </div>
                    <div className="text-black/70 font-medium text-xs mt-1">
                      Средний балл
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#FDD130]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#FDD130]/40 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FDD130]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-[#FDD130]/10 rounded-xl">
                        <svg className="w-6 h-6 text-[#FDD130]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-black mb-1">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                    </div>
                    <div className="text-black font-medium text-base">
                      Регистрация
                    </div>
                    <div className="text-black/70 font-medium text-xs mt-1">
                      {new Date(user.createdAt).getFullYear()}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#EE7A3F]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#EE7A3F]/40 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#EE7A3F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-[#EE7A3F]/10 rounded-xl">
                        <svg className="w-6 h-6 text-[#EE7A3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-black mb-1">
                      {user.lastActiveDate ? new Date(user.lastActiveDate).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) : "—"}
                    </div>
                    <div className="text-black font-medium text-base">
                      Последняя активность
                    </div>
                    <div className="text-black/70 font-medium text-xs mt-1">
                      {user.lastActiveDate ? new Date(user.lastActiveDate).getFullYear() : "Нет данных"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
