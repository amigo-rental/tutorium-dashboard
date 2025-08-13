"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useDisclosure } from "@heroui/use-disclosure";

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
  type: "grammar" | "speaking" | "intensive";
  teacher: string;
  teacherAvatar: string;
  schedule: string;
  lessonTime: string;
  timeOfDay: "morning" | "afternoon" | "evening";
  currentBlock: number;
  totalBlocks: number;
  currentLesson: string;
  progress: number;
  students: number;
  maxStudents: number;
  level: string;
  isEnrolled: boolean;
  nextLesson: string;
  description: string;
}

const myGroups: Group[] = [
  {
    id: "1",
    name: "Группа A2: Основы грамматики",
    type: "grammar",
    teacher: "Алина Дрюк",
    teacherAvatar: "АД",
    schedule: "Пн, Ср, Пт",
    lessonTime: "20:00",
    timeOfDay: "evening",
    currentBlock: 3,
    totalBlocks: 8,
    currentLesson: "Presente Perfecto",
    progress: 37,
    students: 4,
    maxStudents: 6,
    level: "A2",
    isEnrolled: true,
    nextLesson: "Завтра в 20:00",
    description: "Изучаем основы испанской грамматики для уровня A2",
  },
  {
    id: "2",
    name: "Разговорный клуб B1",
    type: "speaking",
    teacher: "Сева",
    teacherAvatar: "С",
    schedule: "Вт, Чт",
    lessonTime: "19:00",
    timeOfDay: "evening",
    currentBlock: 5,
    totalBlocks: 8,
    currentLesson: "Обсуждение фильмов",
    progress: 62,
    students: 6,
    maxStudents: 6,
    level: "B1",
    isEnrolled: true,
    nextLesson: "Четверг в 19:00",
    description: "Практика разговорного испанского в неформальной обстановке",
  },
];

const communityGroups: Group[] = [
  {
    id: "3",
    name: "Интенсив A1-A2",
    type: "intensive",
    teacher: "Мария Гонсалес",
    teacherAvatar: "МГ",
    schedule: "Пн-Пт",
    lessonTime: "10:00",
    timeOfDay: "morning",
    currentBlock: 2,
    totalBlocks: 8,
    currentLesson: "Los números y colores",
    progress: 25,
    students: 3,
    maxStudents: 6,
    level: "A1-A2",
    isEnrolled: false,
    nextLesson: "Завтра в 10:00",
    description: "Быстрый курс испанского для начинающих",
  },
  {
    id: "4",
    name: "Грамматика B2",
    type: "grammar",
    teacher: "Карлос Лопес",
    teacherAvatar: "КЛ",
    schedule: "Вт, Чт, Сб",
    lessonTime: "15:00",
    timeOfDay: "afternoon",
    currentBlock: 6,
    totalBlocks: 8,
    currentLesson: "Subjuntivo",
    progress: 75,
    students: 5,
    maxStudents: 6,
    level: "B2",
    isEnrolled: false,
    nextLesson: "Вторник в 15:00",
    description: "Продвинутая грамматика испанского языка",
  },
  {
    id: "5",
    name: "Разговорный клуб A2",
    type: "speaking",
    teacher: "Анна Мартинес",
    teacherAvatar: "АМ",
    schedule: "Ср, Пт",
    lessonTime: "18:00",
    timeOfDay: "afternoon",
    currentBlock: 4,
    totalBlocks: 8,
    currentLesson: "В ресторане",
    progress: 50,
    students: 4,
    maxStudents: 6,
    level: "A2",
    isEnrolled: false,
    nextLesson: "Среда в 18:00",
    description: "Практика повседневного испанского",
  },
  {
    id: "6",
    name: "Интенсив B1",
    type: "intensive",
    teacher: "Хавьер Руис",
    teacherAvatar: "ХР",
    schedule: "Пн-Пт",
    lessonTime: "21:00",
    timeOfDay: "evening",
    currentBlock: 7,
    totalBlocks: 8,
    currentLesson: "Деловой испанский",
    progress: 87,
    students: 6,
    maxStudents: 6,
    level: "B1",
    isEnrolled: false,
    nextLesson: "Завтра в 21:00",
    description: "Интенсивный курс для среднего уровня",
  },
];

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

export default function GroupsPage() {
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

  const allGroups = [...myGroups, ...communityGroups];

  const filteredGroups = allGroups.filter((group) => {
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

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    switch (sortBy) {
      case "time":
        return a.lessonTime.localeCompare(b.lessonTime);
      case "progress":
        return b.progress - a.progress;
      case "students":
        return b.students - a.students;
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
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#00B67A]/10 rounded-2xl">
            <UsersIcon className="w-7 h-7 text-[#00B67A]" />
          </div>
          <div>
            <h2 className="font-bold text-3xl text-black">Мои группы</h2>
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
        {sortedGroups
          .filter((group) => !group.isEnrolled)
          .map((group) => (
            <GroupCard key={group.id} group={group} isMyGroup={false} />
          ))}
      </div>
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

  return (
    <div
      className={`relative bg-gradient-to-br ${getBgByProgress(Math.floor(group.progress))} border border-slate-200/50 rounded-3xl p-6 group hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-500 overflow-hidden`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div
          className={`w-full h-full bg-gradient-to-br ${getGradientByProgress(Math.floor(group.progress))} rounded-full translate-x-8 -translate-y-8`}
        />
      </div>

      <div className="relative z-10">
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
              name={group.teacherAvatar}
              size="sm"
            />
            <div className="flex-1">
              <p className="text-slate-800 font-bold text-sm">
                {group.teacher}
              </p>
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
          <p className="text-slate-600 font-semibold text-xs mt-2">
            {group.currentLesson}
          </p>
        </div>

        {/* Students and Next Lesson */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-slate-600" />
              <span className="text-slate-800 font-bold text-sm">
                {group.students}/{group.maxStudents} студентов
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
            disabled={!isMyGroup && group.students >= group.maxStudents}
            size="lg"
          >
            {isMyGroup
              ? "Продолжить обучение"
              : group.students >= group.maxStudents
                ? "Группа заполнена"
                : "Присоединиться"}
          </Button>
        </div>
      </div>
    </div>
  );
}
