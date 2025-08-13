"use client";

import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Input } from "@heroui/input";
import { CourseCard } from "@/components/dashboard-cards";
import { useState } from "react";

// Icons
const BookIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const AwardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

// Mock data
const courses = [
  {
    id: "1",
    title: "Испанский с нуля до A2",
    level: "A0",
    progressPercent: 15,
    teacher: "Алина Дрюк",
    nextLesson: "3С: раком, боком и подскоком",
    totalLessons: 24,
    completedLessons: 18,
    coverImage: "https://media.docstorio.com/files/Marathon/331b0b7e-8bba-445a-90b9-87647beb640a.png",
  },
  {
    id: "2",
    title: "Английский B1-B2",
    level: "B1",
    progressPercent: 45,
    teacher: "Алина Гарипова",
    nextLesson: "Shakespeare Analysis",
    totalLessons: 20,
    completedLessons: 9,
    coverImage: "https://media.docstorio.com/files/Marathon/d3fe4838-a32f-4803-ac8f-880940f875ab.jpg",
  },
];

const pastLessons = [
  {
    id: "1",
    title: "Introduction to Derivatives",
    date: "Dec 15",
    time: "2:00 PM",
    teacher: "Dr. Sarah Johnson",
    message: "Great work on understanding the concept of limits. Next week we'll dive deeper into derivatives.",
    filesCount: 3,
    hasRecording: true,
    recordingUrl: "#",
  },
  {
    id: "2",
    title: "Shakespeare's Sonnets",
    date: "Dec 12",
    time: "3:30 PM",
    teacher: "Prof. Michael Chen",
    message: "Excellent analysis of Sonnet 18. Your interpretation showed deep understanding.",
    filesCount: 2,
    hasRecording: false,
  },
  {
    id: "3",
    title: "Linear Algebra Basics",
    date: "Dec 10",
    time: "1:00 PM",
    teacher: "Dr. Sarah Johnson",
    message: "Good progress on matrix operations. Keep practicing the exercises.",
    filesCount: 4,
    hasRecording: true,
    recordingUrl: "#",
  },
];

const upcomingLesson = {
  id: "1",
  title: "Группа 12345678",
  date: "18 декабря",
  time: "20:00",
  teacher: "Сева",
  duration: "60 минут",
  meetingLink: "https://zoom.us/j/1234567890?pwd=QWERTY123456",
};

const recentActivities = [
  {
    id: "1",
    type: "lesson",
    title: "New lesson scheduled",
    description: "Advanced Calculus: Integration Techniques",
    teacher: "Dr. Sarah Johnson",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "assignment",
    title: "Assignment graded",
    description: "Calculus Quiz #3 - 95%",
    teacher: "Dr. Sarah Johnson",
    timestamp: "1 day ago",
  },
  {
    id: "3",
    type: "message",
    title: "Teacher message",
    description: "Great work on the latest assignment!",
    teacher: "Prof. Michael Chen",
    timestamp: "2 days ago",
  },
];

// Function to generate lesson gradients based on index (similar to course card gradients)
const getLessonGradient = (index: number) => {
  const gradients = [
    'from-[#007EFB] to-[#00B67A]',      // Blue to Green
    'from-[#EE7A3F] to-[#FDD130]',      // Orange to Yellow
    'from-[#00B67A] to-[#007EFB]',      // Green to Blue
    'from-[#FDD130] to-[#EE7A3F]',      // Yellow to Orange
    'from-[#007EFB] to-[#FDD130]',      // Blue to Yellow
    'from-[#EE7A3F] to-[#00B67A]',      // Orange to Green
  ];
  return gradients[index % gradients.length];
};

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [meetingLink, setMeetingLink] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const { isOpen: isLessonModalOpen, onOpen: onLessonModalOpen, onClose: onLessonModalClose } = useDisclosure();
  
  // Rating system state
  const [lessonRatings, setLessonRatings] = useState<Record<string, string>>({});
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [currentRatingLesson, setCurrentRatingLesson] = useState<string | null>(null);
  const [tempRating, setTempRating] = useState<string>("");

  const handleJoinClassroom = () => {
    setMeetingLink(upcomingLesson.meetingLink || "#");
    onOpen();
  };

  const handleLessonClick = (lesson: any) => {
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
      setLessonRatings(prev => ({
        ...prev,
        [currentRatingLesson]: rating
      }));
      setTempRating(rating);
    }
  };

  const handleRatingChange = () => {
    setRatingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white lg:ml-4 xl:ml-0">
      {/* Hero Section */}
      <div className="pt-12 mb-8">
        <h1 className="text-5xl font-bold text-black tracking-tight">Привет, Елена! 👋</h1>
        <p className="text-black/70 text-xl font-medium mt-2">¿Cómo estamos, cómo vamos?</p>
      </div>

      {/* Next Lesson Section - Full Width */}
      <div className="bg-gradient-to-br from-[#007EFB]/5 via-[#EE7A3F]/5 to-[#FDD130]/5 border border-[#007EFB]/20 rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#007EFB]/10 to-[#EE7A3F]/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#007EFB]/10 rounded-2xl">
                <svg className="w-7 h-7 text-[#007EFB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-3xl text-black">Следующее занятие</h3>
                <p className="text-black/70 font-medium text-base">Подготовься к предстоящему занятию</p>
              </div>
            </div>
            
            {upcomingLesson && (
              <div className="hidden lg:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-black/70 font-medium text-sm">Твой тьютор</p>
                  <p className="text-black font-bold text-base">{upcomingLesson.teacher}</p>
                </div>
                <div className="w-16 h-16 rounded-2xl overflow-hidden">
                  <img 
                    src="https://tutorium.io/wp-content/uploads/2025/08/2025-08-05-16.27.57.jpg"
                    alt={`${upcomingLesson.teacher}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
          
          {upcomingLesson ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Lesson Details */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-[#007EFB] rounded-full animate-pulse"></div>
                  <span className="text-black font-medium text-base">
                    {upcomingLesson.date} at {upcomingLesson.time}
                  </span>
                </div>
                <h4 className="font-bold text-2xl text-black mb-2">{upcomingLesson.title}</h4>
                <div className="flex items-center gap-4 text-black/70">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-sm">Длительность: {upcomingLesson.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-sm">Онлайн занятие</span>
                  </div>
                </div>
              </div>
              
              {/* Action Area */}
              <div className="flex flex-col items-center lg:items-end justify-end h-full">
                <Button
                  className="w-full lg:w-auto font-bold px-8 text-white bg-[#007EFB] hover:bg-[#007EFB]/90"
                  size="lg"
                  onClick={handleJoinClassroom}
                  startContent={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  }
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
              <p className="text-black font-bold text-lg mb-2">Нет предстоящих уроков</p>
              <p className="text-black/70 font-medium text-base mb-4">Запланируй следующее занятие</p>
              <Button
                variant="flat"
                className="font-bold bg-[#007EFB] text-white"
                size="md"
              >
                Запланировать урок
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid - Redesigned */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
        <div className="bg-white border border-[#007EFB]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#007EFB]/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-[#007EFB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-[#007EFB]/10 rounded-xl">
                <BookIcon />
              </div>
              <span className="text-[#007EFB] text-xs font-bold bg-[#007EFB]/10 px-2 py-1 rounded-full">+12%</span>
            </div>
            <div className="text-4xl font-bold text-black mb-1">43</div>
            <div className="text-black font-medium text-base">Всего уроков</div>
            <div className="text-black/70 font-medium text-xs mt-1">В этом месяце</div>
          </div>
        </div>

        <div className="bg-white border border-[#EE7A3F]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#EE7A3F]/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-[#EE7A3F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-[#EE7A3F]/10 rounded-xl">
                <ClockIcon />
              </div>
              <span className="text-[#EE7A3F] text-xs font-bold bg-[#EE7A3F]/10 px-2 py-1 rounded-full">+8%</span>
            </div>
            <div className="text-4xl font-bold text-black mb-1">28ч</div>
            <div className="text-black font-medium text-base">Время учебы</div>
            <div className="text-black/70 font-medium text-xs mt-1">На этой неделе</div>
          </div>
        </div>

        <div className="bg-white border border-[#FDD130]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#FDD130]/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FDD130]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-[#FDD130]/10 rounded-xl">
                <TrendingUpIcon />
              </div>
              <span className="text-[#FDD130] text-xs font-bold bg-[#FDD130]/10 px-2 py-1 rounded-full">+5%</span>
            </div>
            <div className="text-4xl font-bold text-black mb-1">94%</div>
            <div className="text-black font-medium text-base">Средний балл</div>
            <div className="text-black/70 font-medium text-xs mt-1">Последние 10 уроков</div>
          </div>
        </div>

        <div className="bg-white border border-[#00B67A]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#00B67A]/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00B67A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-[#00B67A]/10 rounded-xl">
                <AwardIcon />
              </div>
              <span className="text-[#00B67A] text-xs font-bold bg-[#00B67A]/10 px-2 py-1 rounded-full">New!</span>
            </div>
            <div className="text-4xl font-bold text-black mb-1">8</div>
            <div className="text-black font-medium text-base">Достижения</div>
            <div className="text-black/70 font-medium text-xs mt-1">Разблокировано в этом месяце</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Active Courses Section */}
        <section className="relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-black">
                Твои курсы
              </h2>
              <p className="text-black/70 font-medium text-lg mt-1">Продолжай свой прогресс в обучении</p>
            </div>
            <Link 
              href="#" 
              className="font-bold text-[#007EFB] hover:text-[#007EFB]/80 flex items-center gap-2 group"
            >
              Посмотреть все
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </section>

        {/* Recent Lessons Section */}
        <section className="relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-black">
                Недавние уроки
              </h2>
              <p className="text-black/70 font-medium text-lg mt-1">Просмотри свои последние занятия</p>
            </div>
            <Link
              href="#" 
              className="font-bold text-[#007EFB] hover:text-[#007EFB]/80 flex items-center gap-2 group"
            >
              Посмотреть все
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {/* Lessons list */}
          <div className="space-y-3">
            {pastLessons.map((lesson, index) => (
              <div 
                key={lesson.id} 
                className="group cursor-pointer bg-white border border-slate-200/60 rounded-2xl p-4 relative overflow-hidden hover:border-slate-300/60 transition-all duration-300"
                onClick={() => handleLessonClick(lesson)}
              >
                {/* Hover background overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-4">
                  {/* Lesson Avatar with Dynamic Gradient */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${getLessonGradient(index)} rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {index + 1}
                  </div>
                  
                  {/* Lesson Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-black text-base leading-tight truncate">{lesson.title}</h4>
                    <p className="text-black/70 font-medium text-sm">{lesson.date} • {lesson.teacher}</p>
                  </div>
                  
                  {/* Tools & Info Section */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Files Count */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-slate-700 font-medium text-xs">{lesson.filesCount}</span>
                    </div>
                    
                    {/* Recording Status */}
                    {lesson.hasRecording && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-xl">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="text-green-700 font-medium text-xs">Запись</span>
                      </div>
                    )}
                    
                                              {/* Rating Button */}
                          <Button
                            size="sm"
                            variant="light"
                            className="px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRateLesson(lesson.id);
                            }}
                          >
                            {lessonRatings[lesson.id] ? (
                              <span className="text-lg">{lessonRatings[lesson.id]}</span>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                Оценить
                              </>
                            )}
                          </Button>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

            <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent className="bg-white border border-slate-200/60 rounded-3xl">
          <ModalHeader className="text-black font-bold text-2xl pb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#007EFB] to-[#00B67A] rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-black font-bold text-2xl">Присоединиться к классу</h3>
                <p className="text-black/60 font-medium text-sm mt-1">Готов к уроку? Присоединяйся прямо сейчас</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="pt-6">
            <div className="p-6 bg-gradient-to-br from-[#007EFB]/5 via-[#EE7A3F]/5 to-[#FDD130]/5 border border-[#007EFB]/20 rounded-2xl">
              <h4 className="font-bold text-black text-lg mb-3">Ссылка на встречу</h4>
              <p className="text-black/70 font-medium text-sm mb-4">
                Скопируй ссылку ниже, чтобы присоединиться к предстоящему уроку испанского языка.
              </p>
              <div className="space-y-3">
                <Input
                  type="url"
                  value={meetingLink}
                  isReadOnly
                  placeholder="https://zoom.us/j/..."
                  className="mb-2"
                  classNames={{
                    input: "font-medium text-black",
                    inputWrapper: "bg-white border-[#007EFB]/30 focus-within:border-[#007EFB] shadow-none"
                  }}
                  endContent={
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="min-w-0"
                      onClick={() => {
                        navigator.clipboard.writeText(meetingLink);
                        // You could add a toast notification here
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </Button>
                  }
                />
                <div className="flex items-center gap-2 text-xs text-black/50 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Нажми на иконку копирования, чтобы скопировать ссылку в буфер обмена
                </div>
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
                window.open(meetingLink, '_blank');
                onClose();
              }}
              startContent={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
            >
              Присоединиться к классу
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Lesson Details Modal */}
      <Modal isOpen={isLessonModalOpen} onClose={onLessonModalClose} size="2xl">
        <ModalContent>
          <ModalHeader className="text-black font-bold text-xl">
            {selectedLesson?.title}
          </ModalHeader>
          <ModalBody>
            {selectedLesson && (
              <div className="space-y-6">
                {/* Lesson Header */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getLessonGradient(pastLessons.findIndex(l => l.id === selectedLesson.id))} rounded-2xl flex items-center justify-center text-white font-bold text-xl`}>
                    {pastLessons.findIndex(l => l.id === selectedLesson.id) + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{selectedLesson.title}</h3>
                    <p className="text-slate-600 font-medium text-sm">{selectedLesson.date} • {selectedLesson.teacher}</p>
                    <p className="text-slate-500 font-medium text-xs">{selectedLesson.time}</p>
                  </div>
                </div>

                {/* Teacher Message */}
                {selectedLesson.message && (
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 text-sm">Сообщение преподавателя</h4>
                        <p className="text-blue-700 font-medium text-xs">Персональный фидбек</p>
                      </div>
                    </div>
                    <div className="bg-white/60 rounded-xl p-3 border border-blue-200/30">
                      <p className="text-blue-800 font-medium text-sm leading-relaxed">{selectedLesson.message}</p>
                    </div>
                  </div>
                )}

                {/* Lesson Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Files and Resources */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-[#007EFB]/10 rounded-xl">
                        <svg className="w-5 h-5 text-[#007EFB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">Файлы и ресурсы</h4>
                        <p className="text-slate-600 font-medium text-xs">Материалы для изучения</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-medium text-sm">{selectedLesson.filesCount} файлов доступно</span>
                      <Button size="sm" variant="light" className="text-[#007EFB] font-medium">
                        Открыть
                      </Button>
                    </div>
                  </div>

                  {/* Lesson Rating */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-100 rounded-xl">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">Оценка урока</h4>
                        <p className="text-amber-600 font-medium text-xs">
                          {lessonRatings[selectedLesson.id] ? "Ты уже оценил этот урок" : "Оцени качество урока"}
                        </p>
                      </div>
                    </div>
                    {lessonRatings[selectedLesson.id] ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{lessonRatings[selectedLesson.id]}</span>
                          <span className="text-slate-700 font-medium text-sm">Твоя оценка</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="light" 
                          className="text-amber-600 font-medium"
                          onClick={() => handleRateLesson(selectedLesson.id)}
                        >
                          Изменить
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{lessonRatings[selectedLesson.id]}</span>
                        <Button 
                          size="sm" 
                          variant="light"
                          className="text-amber-600 font-medium"
                          onClick={() => handleRateLesson(selectedLesson.id)}
                        >
                          Изменить
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recording Section */}
                {selectedLesson.hasRecording && (
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-100 rounded-xl">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900 text-sm">Запись урока</h4>
                        <p className="text-green-700 font-medium text-xs">Доступна для повторного просмотра</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-700 font-medium text-xs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Длительность: 60 мин</span>
                      </div>
                      <Button
                        as={Link}
                        href={selectedLesson.recordingUrl}
                        size="md"
                        color="success"
                        variant="flat"
                        className="font-semibold"
                        startContent={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        }
                      >
                        Смотреть запись
                      </Button>
                    </div>
                  </div>
                )}
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
      <Modal isOpen={ratingModalOpen} onClose={() => setRatingModalOpen(false)} size="md">
        <ModalContent className="bg-white border border-slate-200/60 rounded-3xl">
          <ModalHeader className="text-black font-bold text-xl pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="text-black font-bold text-xl">Оцени урок</h3>
                <p className="text-black/60 font-medium text-sm mt-1">Как тебе прошел этот урок?</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="pt-6">
            {tempRating ? (
              // Confirmation view
              <div className="text-center space-y-6">
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl">
                  <div className="text-6xl mb-3">{tempRating}</div>
                  <h4 className="font-bold text-amber-900 text-lg mb-2">Твоя оценка</h4>
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
                    { emoji: "🥰", color: "bg-green-100 hover:bg-green-200" }
                  ].map((rating) => (
                    <button
                      key={rating.emoji}
                      onClick={() => handleRatingSubmit(rating.emoji)}
                      className={`p-4 rounded-2xl border-2 border-transparent hover:border-amber-300 transition-all duration-200 ${rating.color} flex items-center justify-center`}
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
    </div>
  );
}
