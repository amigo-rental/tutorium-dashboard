// ✅ FIXED: Updated all text elements to use font-medium (500) or higher for consistency
"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { apiClient } from "@/lib/utils/api";
import { ProtectedRoute } from "@/components/protected-route";
import { User, Group } from "@/types";

// Icons
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const SearchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export default function AdminPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Individual Lessons Section
  const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [newLesson, setNewLesson] = useState({
    studentId: "",
    teacherId: "",
    courseId: "",
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  useEffect(() => {
      loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, groupsResponse] = await Promise.all([
          apiClient.getAllUsers(),
          apiClient.getGroups(),
      ]);

      if (usersResponse.data) {
        setUsers(usersResponse.data as User[]);
      }
      if (groupsResponse.data) {
        setGroups(groupsResponse.data as Group[]);
          }
        } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (user: User) => {
    router.push(`/admin/${user.id}`);
  };

  const handleCreateUser = () => {
    // TODO: Implement user creation functionality
    console.log("Create user functionality to be implemented");
  };

  const handleCreateLesson = async () => {
    try {
      // TODO: Implement API call to create lesson
      console.log("Creating lesson:", newLesson);
      setIsCreateLessonModalOpen(false);
        setNewLesson({
        studentId: "",
        teacherId: "",
        courseId: "",
          date: "",
          startTime: "",
          endTime: "",
          notes: "",
        });
    } catch (error) {
      console.error("Error creating lesson:", error);
    }
  };

  const handleEditLesson = async () => {
    try {
      // TODO: Implement API call to update lesson
      console.log("Updating lesson:", selectedLesson);
      setIsEditLessonModalOpen(false);
      setSelectedLesson(null);
    } catch (error) {
      console.error("Error updating lesson:", error);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      // TODO: Implement API call to delete lesson
      console.log("Deleting lesson:", lessonId);
    } catch (error) {
      console.error("Error deleting lesson:", error);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || 
                         (statusFilter === "ACTIVE" && user.isActive) ||
                         (statusFilter === "INACTIVE" && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get role display info
  const getRoleInfo = (role: string) => {
    switch (role) {
      case "ADMIN":
        return { label: "Администратор", color: "danger", bgColor: "bg-red-50", textColor: "text-red-700" };
      case "TEACHER":
        return { label: "Преподаватель", color: "primary", bgColor: "bg-blue-50", textColor: "text-blue-700" };
      case "STUDENT":
        return { label: "Студент", color: "success", bgColor: "bg-green-50", textColor: "text-green-700" };
        default:
        return { label: role, color: "default", bgColor: "bg-gray-50", textColor: "text-gray-700" };
    }
  };

  // Get level display info
  const getLevelInfo = (level: string | undefined) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return { label: "С нуля", color: "success", bgColor: "bg-emerald-50", textColor: "text-emerald-700" };
      case "elementary":
        return { label: "Начинающий", color: "primary", bgColor: "bg-blue-50", textColor: "text-blue-700" };
      case "intermediate":
        return { label: "Продолжающий", color: "warning", bgColor: "bg-amber-50", textColor: "text-amber-700" };
      case "advanced":
        return { label: "Продвинутый", color: "danger", bgColor: "bg-red-50", textColor: "text-red-700" };
      default:
        return { label: level || "Не указан", color: "default", bgColor: "bg-gray-50", textColor: "text-gray-700" };
    }
  };

  // Get user stats
  const getUserStats = (user: User) => {
    const stats = {
      totalLessons: 0, // TODO: Add this property to User type if needed
      completedLessons: 0, // TODO: Add this property to User type if needed
      averageRating: 0, // TODO: Add this property to User type if needed
      lastActive: user.updatedAt,
    };
    return stats;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-16 bg-slate-200 rounded-2xl w-1/3 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-white lg:ml-4 xl:ml-0">
        {/* Hero Section */}
        <div className="pt-12 mb-8">
          <h1 className="text-5xl font-bold text-black tracking-tight">
            Панель администратора 👨‍💼
          </h1>
          <p className="text-black/70 text-xl font-medium mt-2">
            Управление пользователями и системой
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
          <div className="bg-white border border-[#007EFB]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#007EFB]/40 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#007EFB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-[#007EFB]/10 rounded-xl">
                  <UsersIcon />
        </div>
                <span className="text-[#007EFB] text-xs font-bold bg-[#007EFB]/10 px-2 py-1 rounded-full">
                  Всего
                </span>
              </div>
              <div className="text-4xl font-bold text-black mb-1">
                {users.length}
            </div>
              <div className="text-black font-medium text-base">
                Пользователей
                </div>
              <div className="text-black/70 font-medium text-xs mt-1">
                В системе
              </div>
                    </div>
                    </div>

          <div className="bg-white border border-[#00B67A]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#00B67A]/40 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00B67A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-[#00B67A]/10 rounded-xl">
                  <div className="w-6 h-6 text-[#00B67A]">👨‍🎓</div>
                </div>
                <span className="text-[#00B67A] text-xs font-bold bg-[#00B67A]/10 px-2 py-1 rounded-full">
                  Активных
                                </span>
                              </div>
              <div className="text-4xl font-bold text-black mb-1">
                {users.filter(u => u.role === "STUDENT").length}
                            </div>
              <div className="text-black font-medium text-base">
                Студентов
                            </div>
              <div className="text-black/70 font-medium text-xs mt-1">
                Обучаются
                          </div>
                        </div>
                    </div>

          <div className="bg-white border border-[#EE7A3F]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#EE7A3F]/40 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#EE7A3F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-[#EE7A3F]/10 rounded-xl">
                  <div className="w-6 h-6 text-[#EE7A3F]">👨‍🏫</div>
                </div>
                <span className="text-[#EE7A3F] text-xs font-bold bg-[#EE7A3F]/10 px-2 py-1 rounded-full">
                  Экспертов
                </span>
              </div>
              <div className="text-4xl font-bold text-black mb-1">
                {users.filter(u => u.role === "TEACHER").length}
        </div>
              <div className="text-black font-medium text-base">
                Преподавателей
                    </div>
              <div className="text-black/70 font-medium text-xs mt-1">
                Ведут уроки
              </div>
                    </div>
                  </div>

          <div className="bg-white border border-[#FDD130]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#FDD130]/40 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FDD130]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-[#FDD130]/10 rounded-xl">
                  <div className="w-6 h-6 text-[#FDD130]">👥</div>
                    </div>
                <span className="text-[#FDD130] text-xs font-bold bg-[#FDD130]/10 px-2 py-1 rounded-full">
                  Групп
                </span>
                    </div>
              <div className="text-4xl font-bold text-black mb-1">
                {groups.length}
                    </div>
              <div className="text-black font-medium text-base">
                Активных групп
                    </div>
              <div className="text-black/70 font-medium text-xs mt-1">
                Проводят занятия
                  </div>
                        </div>
                      </div>
                    </div>

                    {/* User Management Section */}
        <section className="relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-black">
                Пользователи
              </h2>
              <p className="text-black/70 font-medium text-lg mt-1">
                Управление студентами, преподавателями и администраторами
              </p>
                </div>
              <Button
              className="font-bold text-white bg-[#007EFB] hover:bg-[#007EFB]/90 px-8"
              size="lg"
              startContent={<PlusIcon />}
              onClick={() => handleCreateUser()}
            >
              Добавить пользователя
              </Button>
          </div>

          {/* Search and Filters */}
          <div className="bg-gradient-to-br from-[#007EFB]/5 via-[#EE7A3F]/5 to-[#FDD130]/5 border border-[#007EFB]/20 rounded-3xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#007EFB]/10 to-[#EE7A3F]/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#007EFB]/10 rounded-2xl">
                  <FilterIcon />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-black">
                    Поиск и фильтры
                    </h3>
                  <p className="text-black/70 font-medium text-base">
                    Найди нужных пользователей
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Поиск по имени или email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startContent={
                      <SearchIcon className="w-5 h-5 text-gray-400" />
                    }
                    classNames={{
                      input: "font-medium text-black",
                      inputWrapper: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none h-12"
                    }}
                    variant="bordered"
                  />
                </div>

                <div className="flex gap-3">
                        <Select
                    placeholder="Роль"
                    selectedKeys={[roleFilter]}
                    onSelectionChange={(keys) => setRoleFilter(Array.from(keys)[0] as string)}
                    className="w-40"
                          classNames={{
                      trigger: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none h-12"
                          }}
                          variant="bordered"
                  >
                    <SelectItem key="ALL">Все роли</SelectItem>
                    <SelectItem key="STUDENT">Студенты</SelectItem>
                    <SelectItem key="TEACHER">Преподаватели</SelectItem>
                    <SelectItem key="ADMIN">Администраторы</SelectItem>
                        </Select>

                            <Select
                    placeholder="Статус"
                    selectedKeys={[statusFilter]}
                    onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
                    className="w-40"
                              classNames={{
                      trigger: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none h-12"
                              }}
                              variant="bordered"
                  >
                    <SelectItem key="ALL">Все статусы</SelectItem>
                    <SelectItem key="ACTIVE">Активные</SelectItem>
                    <SelectItem key="INACTIVE">Неактивные</SelectItem>
                            </Select>
                </div>
              </div>
            </div>
                          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user) => {
              const roleInfo = getRoleInfo(user.role);
              const levelInfo = getLevelInfo(user.level);
              const stats = getUserStats(user);
              
              return (
                <div
                  key={user.id}
                  className="group cursor-pointer bg-white border border-slate-200/60 rounded-2xl p-6 relative overflow-hidden hover:border-slate-300/60 transition-all duration-300 hover:shadow-lg"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    {/* User Header */}
                    <div className="flex items-start justify-between mb-4">
                      <Avatar
                        src={user.avatar}
                        name={user.name}
                        size="lg"
                      />
                      <div className="flex flex-col items-end gap-2">
                                      <Chip
                          color={roleInfo.color as any}
                                        variant="flat"
                          size="sm"
                          className={roleInfo.bgColor}
                        >
                          {roleInfo.label}
                                      </Chip>
                        <div className={`px-2 py-1 rounded-lg text-xs font-medium ${levelInfo.bgColor} ${levelInfo.textColor}`}>
                          {levelInfo.label}
                                  </div>
                                </div>
                          </div>

                    {/* User Info */}
                    <div className="mb-4">
                      <h3 className="font-bold text-black text-lg mb-1 group-hover:text-[#007EFB] transition-colors">
                        {user.name}
                      </h3>
                      <p className="text-black/70 text-sm font-medium mb-2">{user.email}</p>
                      
                      {/* Status Indicator */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`text-xs font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {user.isActive ? 'Активен' : 'Неактивен'}
                        </span>
                      </div>
                    </div>

                    {/* User Stats */}
                    <div className="space-y-3 mb-4">
                                            <div className="flex items-center justify-between text-sm">
                        <span className="text-black/70 font-medium">Уроков:</span>
                        <span className="font-semibold text-black">{stats.totalLessons}</span>
                      </div>

                      {user.role === "STUDENT" && (
                        <>
                                                    <div className="flex items-center justify-between text-sm">
                            <span className="text-black/70 font-medium">Завершено:</span>
                            <span className="font-semibold text-green-600">{stats.completedLessons}</span>
                          </div>
                          
                          {stats.averageRating > 0 && (
                                                        <div className="flex items-center justify-between text-sm">
                              <span className="text-black/70 font-medium">Рейтинг:</span>
                              <div className="flex items-center gap-1">
                                <StarIcon className="w-4 h-4 text-yellow-500" />
                                <span className="font-semibold text-black">{stats.averageRating.toFixed(1)}</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                        </div>

                                        {/* Last Activity */}
                    <div className="flex items-center gap-2 text-xs text-black/50 font-medium">
                      <ClockIcon className="w-4 h-4" />
                      <span>Активен: {new Date(stats.lastActive).toLocaleDateString('ru-RU')}</span>
                    </div>
                      </div>
                        </div>
              );
            })}
                  </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <div className="text-4xl">🔍</div>
                      </div>
              <h3 className="text-2xl font-bold text-black mb-2">Пользователи не найдены</h3>
                            <p className="text-black/70 text-lg font-medium">
                Попробуйте изменить параметры поиска или фильтры
              </p>
                      </div>
          )}
        </section>

        {/* Individual Lessons Section */}
        <section className="relative mt-12">
          <div className="flex items-center justify-between mb-8">
                        <div>
              <h2 className="text-4xl font-bold text-black">
                Индивидуальные занятия
              </h2>
              <p className="text-black/70 font-medium text-lg mt-1">
                Управление персональными уроками
              </p>
            </div>
            <Button
              className="font-bold text-white bg-[#EE7A3F] hover:bg-[#EE7A3F]/90 px-8"
              size="lg"
              startContent={<PlusIcon />}
              onClick={() => setIsCreateLessonModalOpen(true)}
            >
              Создать занятие
            </Button>
                        </div>

          <div className="bg-gradient-to-br from-[#EE7A3F]/5 via-[#FDD130]/5 to-[#00B67A]/5 border border-[#EE7A3F]/20 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#EE7A3F]/10 to-[#FDD130]/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#EE7A3F]/10 rounded-2xl">
                  <CalendarIcon />
                </div>
                            <div>
                  <h3 className="font-bold text-2xl text-black">
                    Планирование занятий
                  </h3>
                  <p className="text-black/70 font-medium text-base">
                    TODO: Реализовать список и управление индивидуальными уроками
                  </p>
                              </div>
                              </div>
                            </div>
                      </div>
        </section>
                    </div>

        {/* Create Individual Lesson Modal */}
        {isCreateLessonModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Создать индивидуальное занятие</h3>
              
              <div className="space-y-6">
                                    <Select
                    classNames={{
                      label: "font-bold text-black",
                      trigger: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                      value: "font-medium text-black",
                    }}
                    label="Студент"
                    placeholder="Выберите студента"
                    selectedKeys={newLesson.studentId ? [newLesson.studentId] : []}
                    onSelectionChange={(keys) => {
                      const selectedStudentId = Array.from(keys)[0] as string;
                      setNewLesson({ ...newLesson, studentId: selectedStudentId });
                    }}
                  >
                  {users.filter(u => u.role === "STUDENT").map((student) => (
                    <SelectItem key={student.id}>
                      {student.name} ({student.email})
                          </SelectItem>
                  ))}
                    </Select>

                                        <Select
                      classNames={{
                        label: "font-bold text-black",
                        trigger: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                        value: "font-medium text-black",
                      }}
                      label="Преподаватель"
                      placeholder="Выберите преподавателя"
                      selectedKeys={newLesson.teacherId ? [newLesson.teacherId] : []}
                      onSelectionChange={(keys) => {
                        const selectedTeacherId = Array.from(keys)[0] as string;
                        setNewLesson({ ...newLesson, teacherId: selectedTeacherId });
                      }}
                    >
                  {users.filter(u => u.role === "TEACHER").map((teacher) => (
                          <SelectItem key={teacher.id}>
                            {teacher.name} ({teacher.email})
                          </SelectItem>
                        ))}
                    </Select>

                                        <Select
                      classNames={{
                        label: "font-bold text-black",
                        trigger: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                        value: "font-medium text-black",
                      }}
                      label="Курс"
                      placeholder="Выберите курс"
                      selectedKeys={newLesson.courseId ? [newLesson.courseId] : []}
                      onSelectionChange={(keys) => {
                        const selectedCourseId = Array.from(keys)[0] as string;
                        setNewLesson({ ...newLesson, courseId: selectedCourseId });
                      }}
                    >
                  {/* TODO: Add courses data */}
                  <SelectItem key="course1">Курс 1</SelectItem>
                  <SelectItem key="course2">Курс 2</SelectItem>
                    </Select>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    classNames={{
                      label: "font-bold text-black",
                      input: "font-medium text-black",
                      inputWrapper: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                    }}
                    label="Дата"
                    type="date"
                    value={newLesson.date}
                    onChange={(e) => setNewLesson({ ...newLesson, date: e.target.value })}
                  />
                  <Input
                    classNames={{
                      label: "font-bold text-black",
                      input: "font-medium text-black",
                      inputWrapper: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                    }}
                    label="Время начала"
                    type="time"
                    value={newLesson.startTime}
                    onChange={(e) => setNewLesson({ ...newLesson, startTime: e.target.value })}
                  />
                </div>

                    <Input
                      classNames={{
                        label: "font-bold text-black",
                        input: "font-medium text-black",
                        inputWrapper: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                      }}
                      label="Время окончания"
                      type="time"
                      value={newLesson.endTime}
                      onChange={(e) => setNewLesson({ ...newLesson, endTime: e.target.value })}
                    />

                                          <Input
                      classNames={{
                        label: "font-bold text-black",
                        input: "font-medium text-black",
                        inputWrapper: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                      }}
                      label="Заметки"
                      placeholder="Дополнительная информация о занятии"
                      value={newLesson.notes}
                      onChange={(e) => setNewLesson({ ...newLesson, notes: e.target.value })}
                      />
                  </div>

              <div className="flex gap-4 mt-8">
                <Button
                  variant="light"
                  onClick={() => setIsCreateLessonModalOpen(false)}
                  className="flex-1"
                >
                Отмена
              </Button>
              <Button
                color="primary"
                onClick={handleCreateLesson}
                  className="flex-1 bg-purple-600"
              >
                Создать занятие
              </Button>
                    </div>
                  </div>
                    </div>
        )}

        {/* Edit Individual Lesson Modal */}
        {isEditLessonModalOpen && selectedLesson && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Редактировать занятие</h3>
              
              <div className="space-y-6">
                                            <Select
                        classNames={{
                          label: "font-bold text-black",
                          trigger: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                          value: "font-medium text-black",
                        }}
                        label="Студент"
                        selectedKeys={[selectedLesson.studentId]}
                        onSelectionChange={(keys) => {
                          const selectedStudentId = Array.from(keys)[0] as string;
                          setSelectedLesson({ ...selectedLesson, studentId: selectedStudentId });
                        }}
                      >
                  {users.filter(u => u.role === "STUDENT").map((student) => (
                            <SelectItem key={student.id}>
                      {student.name} ({student.email})
                            </SelectItem>
                          ))}
                      </Select>

                                            <Select
                        classNames={{
                          label: "font-bold text-black",
                          trigger: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                          value: "font-medium text-black",
                        }}
                        label="Преподаватель"
                        selectedKeys={[selectedLesson.teacherId]}
                        onSelectionChange={(keys) => {
                          const selectedTeacherId = Array.from(keys)[0] as string;
                          setSelectedLesson({ ...selectedLesson, teacherId: selectedTeacherId });
                        }}
                      >
                  {users.filter(u => u.role === "TEACHER").map((teacher) => (
                    <SelectItem key={teacher.id}>
                      {teacher.name} ({teacher.email})
                          </SelectItem>
                        ))}
                      </Select>

                                            <Select
                        classNames={{
                          label: "font-bold text-black",
                          trigger: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                          value: "font-medium text-black",
                        }}
                        label="Курс"
                        selectedKeys={[selectedLesson.courseId]}
                        onSelectionChange={(keys) => {
                          const selectedCourseId = Array.from(keys)[0] as string;
                          setSelectedLesson({ ...selectedLesson, courseId: selectedCourseId });
                        }}
                      >
                  {/* TODO: Add courses data */}
                  <SelectItem key="course1">Курс 1</SelectItem>
                  <SelectItem key="course2">Курс 2</SelectItem>
                      </Select>

                                <div className="grid grid-cols-2 gap-4">
                  <Input
                    classNames={{
                      label: "font-bold text-black",
                      input: "font-medium text-black",
                      inputWrapper: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                    }}
                    label="Дата"
                    type="date"
                    value={selectedLesson.date}
                    onChange={(e) => setSelectedLesson({ ...selectedLesson, date: e.target.value })}
                  />
                  <Input
                    classNames={{
                      label: "font-bold text-black",
                      input: "font-medium text-black",
                      inputWrapper: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                    }}
                    label="Время начала"
                    type="time"
                    value={selectedLesson.startTime}
                    onChange={(e) => setSelectedLesson({ ...selectedLesson, startTime: e.target.value })}
                  />
                </div>

                <Input
                  classNames={{
                    label: "font-bold text-black",
                    input: "font-medium text-black",
                    inputWrapper: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                  }}
                  label="Время окончания"
                  type="time"
                  value={selectedLesson.endTime}
                  onChange={(e) => setSelectedLesson({ ...selectedLesson, endTime: e.target.value })}
                />

                <Input
                  classNames={{
                    label: "font-bold text-black",
                    input: "font-medium text-black",
                    inputWrapper: "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                  }}
                  label="Заметки"
                  placeholder="Дополнительная информация о занятии"
                  value={selectedLesson.notes}
                  onChange={(e) => setSelectedLesson({ ...selectedLesson, notes: e.target.value })}
                />
                    </div>

              <div className="flex gap-4 mt-8">
                <Button
                  variant="light"
                  onClick={() => setIsEditLessonModalOpen(false)}
                  className="flex-1"
                >
                Отмена
              </Button>
              <Button
                  color="danger"
                  onClick={() => handleDeleteLesson(selectedLesson.id)}
                  className="flex-1"
                >
                  Удалить
                </Button>
                <Button
                color="primary"
                  onClick={handleEditLesson}
                  className="flex-1 bg-purple-600"
              >
                Сохранить изменения
              </Button>
      </div>
            </div>
          </div>
        )}
    </ProtectedRoute>
  );
}

