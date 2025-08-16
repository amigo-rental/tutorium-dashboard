"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useDisclosure } from "@heroui/use-disclosure";

import { ProtectedRoute } from "@/components/protected-route";
import { apiClient } from "@/lib/utils/api";
import { useAuth } from "@/lib/auth/context";

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
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

const UsersIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
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
);

interface Group {
  id: string;
  name: string;
  description?: string;
  level: string;
  maxStudents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  teacherId: string;
  courseId: string;
  teacher?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  course?: {
    id: string;
    name: string;
    description?: string;
    level: string;
    duration: number;
  };
  students: Array<{
    id: string;
    name: string;
    email: string;
    level?: string;
    avatar?: string;
  }>;
  _count?: {
    students: number;
  };
  // UI-specific properties derived from real data
  type: "grammar" | "speaking" | "intensive";
  schedule: string;
  lessonTime: string;
  timeOfDay: "morning" | "afternoon" | "evening";
  currentBlock: number;
  totalBlocks: number;
  currentLesson: string;
  progress: number;
  isEnrolled: boolean;
  nextLesson: string;
  progressData?: {
    progressPercent: number;
    lastStudiedTopic: string;
    completedTopics: number;
    totalTopics: number;
    nextTopic?: string;
    nextTopicId?: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  groupId?: string;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "grammar":
      return "bg-[#007EFB] text-white";
    case "speaking":
      return "bg-[#EE7A3F] text-white";
    case "intensive":
      return "bg-[#00B67A] text-white";
    default:
      return "bg-slate-200 text-slate-700";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "grammar":
      return "Грамматика";
    case "speaking":
      return "Разговорный";
    case "intensive":
      return "Интенсив";
    default:
      return type;
  }
};

const getTimeOfDayColor = (time: string) => {
  switch (time) {
    case "morning":
      return "bg-[#FDD130] text-black";
    case "afternoon":
      return "bg-[#EE7A3F] text-white";
    case "evening":
      return "bg-[#007EFB] text-white";
    default:
      return "bg-slate-200 text-slate-700";
  }
};

const getTimeOfDayLabel = (time: string) => {
  switch (time) {
    case "morning":
      return "Утро";
    case "afternoon":
      return "День";
    case "evening":
      return "Вечер";
    default:
      return time;
  }
};

// Transform API group data to UI format
const transformGroupData = (apiGroup: any, currentUser: User | null): Group => {
  // Safety check for required fields
  if (!apiGroup || !apiGroup.id || !apiGroup.name) {
    console.error("Invalid group data:", apiGroup);
    throw new Error("Invalid group data received");
  }

  // Determine type based on course name or group name
  let type: "grammar" | "speaking" | "intensive" = "grammar";
  const name = (apiGroup.name || "").toLowerCase();
  const courseName = apiGroup.course?.name?.toLowerCase() || "";

  if (name.includes("разговор") || courseName.includes("разговор")) {
    type = "speaking";
  } else if (name.includes("интенсив") || courseName.includes("интенсив")) {
    type = "intensive";
  }

  // Generate schedule based on level
  const schedules = {
    A1: "Пн, Ср, Пт",
    A2: "Вт, Чт, Сб",
    B1: "Пн, Чт",
    B2: "Вт, Пт",
    C1: "Ср, Сб",
  };

  // Generate lesson time based on group ID hash
  const timeSlots = ["10:00", "15:00", "18:00", "19:00", "20:00", "21:00"];
  const timeIndex =
    parseInt(apiGroup.id?.slice(-1) || "0", 16) % timeSlots.length;
  const lessonTime = timeSlots[timeIndex] || "20:00"; // Fallback to 20:00

  // Determine time of day
  let timeOfDay: "morning" | "afternoon" | "evening" = "evening";

  if (lessonTime && lessonTime.includes(":")) {
    const hour = parseInt(lessonTime.split(":")[0]);

    if (hour < 12) timeOfDay = "morning";
    else if (hour < 18) timeOfDay = "afternoon";
  }

  // Use real progress data from API if available, otherwise fallback to mock data
  const progressData = apiGroup.progress;
  const progress = progressData?.progressPercent || 0;
  const currentBlock = progressData ? Math.floor(progress / 12.5) + 1 : 1;
  const totalBlocks = 8;

  // Generate current lesson based on level
  const lessons = {
    A1: ["Los números", "Los colores", "Mi familia", "En el restaurante"],
    A2: [
      "Presente Perfecto",
      "Futuro Simple",
      "Condicional",
      "Subjuntivo básico",
    ],
    B1: [
      "Subjuntivo avanzado",
      "Pasado perfecto",
      "Voz pasiva",
      "Estilo indirecto",
    ],
    B2: [
      "Gramática avanzada",
      "Expresiones idiomáticas",
      "Literatura",
      "Cultura",
    ],
    C1: [
      "Registro formal",
      "Análisis textual",
      "Debate avanzado",
      "Escritura académica",
    ],
  };

  const levelLessons =
    lessons[apiGroup.level as keyof typeof lessons] || lessons["A1"];
  const currentLesson =
    progressData?.lastStudiedTopic ||
    levelLessons[Math.min(currentBlock - 1, levelLessons.length - 1)] ||
    "Урок";

  // Check if user is enrolled
  const isEnrolled = currentUser?.groupId === apiGroup.id;

  // Generate next lesson date
  const nextLesson =
    lessonTime === "10:00"
      ? "Завтра в 10:00"
      : lessonTime === "15:00"
        ? "Вторник в 15:00"
        : lessonTime === "18:00"
          ? "Среда в 18:00"
          : lessonTime === "19:00"
            ? "Четверг в 19:00"
            : lessonTime === "20:00"
              ? "Завтра в 20:00"
              : "Пятница в 21:00";

  return {
    ...apiGroup,
    type,
    schedule:
      schedules[apiGroup.level as keyof typeof schedules] || "Пн, Ср, Пт",
    lessonTime,
    timeOfDay,
    currentBlock,
    totalBlocks,
    currentLesson,
    progress,
    isEnrolled,
    nextLesson,
    students: apiGroup.students || [],
    progressData: progressData || null,
  };
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const [selectedTimeFilters, setSelectedTimeFilters] = useState<string[]>([]);
  const [selectedTypeFilters, setSelectedTypeFilters] = useState<string[]>([]);
  const [selectedBlockFilters, setSelectedBlockFilters] = useState<number[]>(
    [],
  );
  const [sortBy, setSortBy] = useState("time");

  const { isOpen: isTimeOpen, onOpenChange: onTimeOpenChange } =
    useDisclosure();
  const { isOpen: isTypeOpen, onOpenChange: onTypeOpenChange } =
    useDisclosure();
  const { isOpen: isBlockOpen, onOpenChange: onBlockOpenChange } =
    useDisclosure();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading groups and user data...");

      const [groupsResponse, userResponse] = await Promise.all([
        apiClient.getGroups(),
        apiClient.getUser(),
      ]);

      console.log("Raw groups response:", groupsResponse);
      console.log("Raw user response:", userResponse);

      if (groupsResponse.error) {
        console.error("Groups API error:", groupsResponse.error);
        throw new Error(groupsResponse.error);
      }
      if (userResponse.error) {
        console.error("User API error:", userResponse.error);
        throw new Error(userResponse.error);
      }

      console.log("Groups response data:", groupsResponse.data);
      console.log("User response data:", userResponse.data);

      const userData = userResponse.data as User;

      setCurrentUser(userData);

      if (!groupsResponse.data || !Array.isArray(groupsResponse.data)) {
        console.error("Groups data is not an array:", groupsResponse.data);
        throw new Error("Invalid groups data received");
      }

      console.log("Transforming groups...");
      const transformedGroups = groupsResponse.data.map((group: any) => {
        console.log("Transforming group:", group);
        try {
          return transformGroupData(group, userData);
        } catch (error) {
          console.error("Error transforming group:", group, error);
          throw error;
        }
      });

      console.log("Transformed groups:", transformedGroups);
      setGroups(transformedGroups);
    } catch (err) {
      console.error("Error loading groups:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
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
            Error loading groups
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button color="primary" onClick={loadData}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const myGroups = groups.filter((group) => group.isEnrolled);
  const communityGroups = groups.filter((group) => !group.isEnrolled);

  const filteredCommunityGroups = communityGroups.filter((group) => {
    if (
      selectedTimeFilters.length > 0 &&
      !selectedTimeFilters.includes(group.timeOfDay)
    )
      return false;
    if (
      selectedTypeFilters.length > 0 &&
      !selectedTypeFilters.includes(group.type)
    )
      return false;
    if (
      selectedBlockFilters.length > 0 &&
      !selectedBlockFilters.includes(group.currentBlock)
    )
      return false;

    return true;
  });

  const sortedGroups = [...filteredCommunityGroups].sort((a, b) => {
    switch (sortBy) {
      case "time":
        return a.lessonTime.localeCompare(b.lessonTime);
      case "progress":
        return b.progress - a.progress;
      case "students":
        return (b._count?.students || 0) - (a._count?.students || 0);
      case "block":
        return a.currentBlock - b.currentBlock;
      default:
        return 0;
    }
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white lg:ml-4 xl:ml-0">
        {/* Hero Section */}
        <div className="pt-12 mb-8">
          <h1 className="text-5xl font-bold text-black tracking-tight">
            Группы 👥
          </h1>
          <p className="text-black/70 text-xl font-medium mt-2">
            Присоединяйся к сообществу изучающих испанский
          </p>
        </div>

        {/* My Groups Section */}
        {myGroups.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#00B67A]/10 rounded-2xl">
                <UsersIcon className="w-7 h-7 text-[#00B67A]" />
              </div>
              <div>
                <h2 className="font-bold text-3xl text-black">Твои группы</h2>
                <p className="text-black/70 font-medium text-base">
                  Группы, в которых ты уже учишься
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myGroups.map((group) => (
                <GroupCard key={group.id} group={group} isMyGroup={true} />
              ))}
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#007EFB]/10 rounded-2xl">
              <SearchIcon className="w-7 h-7 text-[#007EFB]" />
            </div>
            <div>
              <h2 className="font-bold text-3xl text-black">Найти группу</h2>
              <p className="text-black/70 font-medium text-base">
                Открой для себя новые возможности обучения
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-wrap gap-3">
              {/* Time Filter Dropdown */}
              <Dropdown isOpen={isTimeOpen} onOpenChange={onTimeOpenChange}>
                <DropdownTrigger>
                  <Button
                    className="border-slate-200 text-black font-medium"
                    endContent={
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 9l-7 7-7-7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    }
                    variant="bordered"
                  >
                    {selectedTimeFilters.length === 0
                      ? "Все время"
                      : `${selectedTimeFilters.length} выбрано`}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Time filters"
                  selectedKeys={selectedTimeFilters}
                  selectionMode="multiple"
                  onSelectionChange={(keys) =>
                    setSelectedTimeFilters(Array.from(keys) as string[])
                  }
                >
                  <DropdownItem key="morning" className="text-black">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#FDD130]" />
                      Утро (8:00-12:00)
                    </div>
                  </DropdownItem>
                  <DropdownItem key="afternoon" className="text-black">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#EE7A3F]" />
                      День (12:00-18:00)
                    </div>
                  </DropdownItem>
                  <DropdownItem key="evening" className="text-black">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#007EFB]" />
                      Вечер (18:00-22:00)
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              {/* Type Filter Dropdown */}
              <Dropdown isOpen={isTypeOpen} onOpenChange={onTypeOpenChange}>
                <DropdownTrigger>
                  <Button
                    className="border-slate-200 text-black font-medium"
                    endContent={
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 9l-7 7-7-7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    }
                    variant="bordered"
                  >
                    {selectedTypeFilters.length === 0
                      ? "Все типы"
                      : `${selectedTypeFilters.length} выбрано`}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Type filters"
                  selectedKeys={selectedTypeFilters}
                  selectionMode="multiple"
                  onSelectionChange={(keys) =>
                    setSelectedTypeFilters(Array.from(keys) as string[])
                  }
                >
                  <DropdownItem key="grammar" className="text-black">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#007EFB]" />
                      Грамматика
                    </div>
                  </DropdownItem>
                  <DropdownItem key="speaking" className="text-black">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#EE7A3F]" />
                      Разговорный
                    </div>
                  </DropdownItem>
                  <DropdownItem key="intensive" className="text-black">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#00B67A]" />
                      Интенсив
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              {/* Block Filter Dropdown */}
              <Dropdown isOpen={isBlockOpen} onOpenChange={onBlockOpenChange}>
                <DropdownTrigger>
                  <Button
                    className="border-slate-200 text-black font-medium"
                    endContent={
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 9l-7 7-7-7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    }
                    variant="bordered"
                  >
                    {selectedBlockFilters.length === 0
                      ? "Все блоки"
                      : `${selectedBlockFilters.length} выбрано`}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Block filters"
                  selectedKeys={selectedBlockFilters.map(String)}
                  selectionMode="multiple"
                  onSelectionChange={(keys) =>
                    setSelectedBlockFilters(Array.from(keys).map(Number))
                  }
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((block) => (
                    <DropdownItem key={block} className="text-black">
                      Блок {block}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              {/* Clear All Filters Button */}
              {(selectedTimeFilters.length > 0 ||
                selectedTypeFilters.length > 0 ||
                selectedBlockFilters.length > 0) && (
                <Button
                  className="text-[#007EFB] font-medium"
                  variant="light"
                  onClick={() => {
                    setSelectedTimeFilters([]);
                    setSelectedTypeFilters([]);
                    setSelectedBlockFilters([]);
                  }}
                >
                  Очистить фильтры
                </Button>
              )}
            </div>

            {/* Sort Dropdown - Right Aligned */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="border-slate-200 text-black font-medium"
                  endContent={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M19 9l-7 7-7-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  }
                  variant="bordered"
                >
                  {sortBy === "time" && "По времени"}
                  {sortBy === "progress" && "По прогрессу"}
                  {sortBy === "students" && "По студентам"}
                  {sortBy === "block" && "По блоку"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Sort options"
                selectedKeys={[sortBy]}
                onSelectionChange={(keys) =>
                  setSortBy(Array.from(keys)[0] as string)
                }
              >
                <DropdownItem key="time" className="text-black">
                  По времени
                </DropdownItem>
                <DropdownItem key="progress" className="text-black">
                  По прогрессу
                </DropdownItem>
                <DropdownItem key="students" className="text-black">
                  По количеству студентов
                </DropdownItem>
                <DropdownItem key="block" className="text-black">
                  По блоку программы
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Community Groups Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
          {sortedGroups.map((group) => (
            <GroupCard key={group.id} group={group} isMyGroup={false} />
          ))}
        </div>

        {/* No groups message */}
        {groups.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Нет доступных групп
            </h3>
            <p className="text-gray-600">
              Свяжитесь с администратором для создания групп.
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function GroupCard({ group, isMyGroup }: { group: Group; isMyGroup: boolean }) {
  const getBgByProgress = (progress: number) => {
    const flooredProgress = Math.floor(progress);

    if (flooredProgress >= 80) return "from-emerald-50 to-emerald-100";
    if (flooredProgress >= 60) return "from-blue-50 to-blue-100";
    if (flooredProgress >= 40) return "from-purple-50 to-purple-100";

    return "from-amber-50 to-amber-100";
  };

  const getGradientByProgress = (progress: number) => {
    const flooredProgress = Math.floor(progress);

    if (flooredProgress >= 80) return "from-emerald-400 to-emerald-600";
    if (flooredProgress >= 60) return "from-blue-400 to-blue-600";
    if (flooredProgress >= 40) return "from-purple-400 to-purple-600";

    return "from-amber-400 to-amber-600";
  };

  // Get teacher initials
  const getTeacherInitials = (teacherName: string) => {
    if (!teacherName) return "T";
    const names = teacherName.split(" ");

    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }

    return teacherName[0] || "T";
  };

  const teacherName = group.teacher?.name || "Преподаватель";
  const studentCount = group._count?.students || group.students.length || 0;

  return (
    <div
      className={`relative bg-gradient-to-br ${getBgByProgress(Math.floor(group.progress))} border border-slate-200/50 rounded-3xl p-6 group hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-500 overflow-hidden flex flex-col h-full`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div
          className={`w-full h-full bg-gradient-to-br ${getGradientByProgress(Math.floor(group.progress))} rounded-full translate-x-8 -translate-y-8`}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${getGradientByProgress(Math.floor(group.progress))} rounded-2xl flex items-center justify-center text-white font-semibold text-lg`}
              >
                {group.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 leading-tight">
                  {group.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Chip
                    className="font-bold text-xs bg-white/80 text-slate-700"
                    size="sm"
                    variant="flat"
                  >
                    {group.level}
                  </Chip>
                  <Chip className={getTypeColor(group.type)} size="sm">
                    {getTypeLabel(group.type)}
                  </Chip>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher and Schedule */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/50">
          <div className="flex items-center gap-3">
            <Avatar
              className="text-white bg-[#007EFB] text-sm font-bold"
              name={getTeacherInitials(teacherName)}
              size="sm"
            />
            <div className="flex-1">
              <p className="text-slate-800 font-bold text-sm">{teacherName}</p>
              <div className="flex items-center gap-2 text-slate-600 font-medium text-xs">
                <ClockIcon className="w-3 h-3" />
                <span>
                  {group.schedule} • {group.lessonTime}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Chip className={getTimeOfDayColor(group.timeOfDay)} size="sm">
              {getTimeOfDayLabel(group.timeOfDay)}
            </Chip>
            <span className="text-slate-600 font-semibold text-xs">
              Блок {group.currentBlock} из {group.totalBlocks}
            </span>
          </div>
        </div>

        {/* Progress section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-800 font-bold text-sm">
              Прогресс группы
            </span>
            <span className="font-semibold text-lg text-slate-900">
              {Math.floor(group.progress)}%
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-slate-200/50 rounded-full h-3">
              <div
                className={`h-3 bg-gradient-to-r ${getGradientByProgress(Math.floor(group.progress))} rounded-full transition-all duration-700`}
                style={{ width: `${Math.floor(group.progress)}%` }}
              />
            </div>
          </div>

          {/* Progress Details */}
          <div className="mt-3 space-y-2">
            {group.progressData ? (
              <>
                <p className="text-slate-600 font-semibold text-xs">
                  {group.progressData.completedTopics} из{" "}
                  {group.progressData.totalTopics} тем пройдено
                </p>
                {group.progressData.lastStudiedTopic && (
                  <p className="text-slate-500 font-medium text-xs">
                    Последняя тема: {group.progressData.lastStudiedTopic}
                  </p>
                )}
                {group.progressData.nextTopic && (
                  <p className="text-slate-500 font-medium text-xs">
                    Следующая тема: {group.progressData.nextTopic}
                  </p>
                )}
              </>
            ) : (
              <p className="text-slate-600 font-semibold text-xs">
                {group.currentLesson}
              </p>
            )}
          </div>
        </div>

        {/* Flex spacer to push button to bottom */}
        <div className="flex-1" />

        {/* Students and Next Lesson - Bottom Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-slate-600" />
              <span className="text-slate-800 font-bold text-sm">
                {studentCount}/{group.maxStudents} студентов
              </span>
            </div>
            <div className="text-right">
              <p className="text-slate-700 font-semibold text-sm">
                {group.nextLesson}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            className={`flex-1 font-semibold text-black bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-300`}
            disabled={!isMyGroup && studentCount >= group.maxStudents}
            size="lg"
          >
            {isMyGroup
              ? "Продолжить обучение"
              : studentCount >= group.maxStudents
                ? "Группа заполнена"
                : "Присоединиться"}
          </Button>
        </div>
      </div>
    </div>
  );
}
