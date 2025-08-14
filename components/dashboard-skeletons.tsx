import { Skeleton } from "@heroui/skeleton";

// Hero Section Skeleton
export const HeroSkeleton = () => (
  <div className="pt-12 mb-8">
    <Skeleton className="h-16 w-96 rounded-lg mb-2" />
    <Skeleton className="h-6 w-80 rounded-lg" />
  </div>
);

// Next Lesson Section Skeleton
export const NextLessonSkeleton = () => (
  <div className="bg-gradient-to-br from-[#007EFB]/5 via-[#EE7A3F]/5 to-[#FDD130]/5 border border-[#007EFB]/20 rounded-3xl p-8 mb-8 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#007EFB]/10 to-[#EE7A3F]/10 rounded-full -translate-y-8 translate-x-8" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div>
            <Skeleton className="h-8 w-48 rounded-lg mb-2" />
            <Skeleton className="h-5 w-64 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="h-5 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-64 rounded-lg mb-2" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-40 rounded-lg" />
            <Skeleton className="h-5 w-32 rounded-lg" />
          </div>
        </div>

        <div className="flex flex-col items-center lg:items-end justify-end h-full">
          <Skeleton className="w-32 h-12 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

// Stats Grid Skeleton
export const StatsGridSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
    {[...Array(4)].map((_, index) => (
      <div
        key={index}
        className="bg-white border border-slate-200/60 rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-12 h-5 rounded-full" />
        </div>
        <Skeleton className="h-10 w-16 rounded-lg mb-1" />
        <Skeleton className="h-5 w-24 rounded-lg" />
        <Skeleton className="h-4 w-32 rounded-lg mt-1" />
      </div>
    ))}
  </div>
);

// Courses Section Skeleton
export const CoursesSectionSkeleton = () => (
  <section className="relative">
    <div className="flex items-center justify-between mb-8">
      <div>
        <Skeleton className="h-10 w-48 rounded-lg mb-2" />
        <Skeleton className="h-6 w-80 rounded-lg" />
      </div>
      <Skeleton className="h-6 w-32 rounded-lg" />
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {[...Array(2)].map((_, index) => (
        <div
          key={index}
          className="xl:col-span-1.5 bg-white border border-slate-200/60 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-48 rounded-lg" />
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-lg" />
              <Skeleton className="h-4 w-40 rounded-lg" />
            </div>
          </div>
          <div className="mt-4">
            <Skeleton className="h-3 w-full rounded-lg mb-2" />
            <Skeleton className="h-3 w-3/4 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

// Recent Lessons Section Skeleton
export const RecentLessonsSkeleton = () => (
  <section className="relative">
    <div className="flex items-center justify-between mb-8">
      <div>
        <Skeleton className="h-10 w-48 rounded-lg mb-2" />
        <Skeleton className="h-6 w-80 rounded-lg" />
      </div>
      <Skeleton className="h-6 w-32 rounded-lg" />
    </div>

    <div className="space-y-3">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="bg-white border border-slate-200/60 rounded-2xl p-4"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-lg" />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Skeleton className="w-20 h-8 rounded-xl" />
              <Skeleton className="w-20 h-8 rounded-xl" />
              <Skeleton className="w-16 h-8 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// Recording Upload Form Skeleton
export const RecordingUploadFormSkeleton = () => (
  <div className="bg-gradient-to-br from-[#007EFB]/5 via-[#EE7A3F]/5 to-[#FDD130]/5 border border-[#007EFB]/20 rounded-3xl p-8 mb-8 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#007EFB]/10 to-[#EE7A3F]/10 rounded-full -translate-y-8 translate-x-8" />
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-8">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <div>
          <Skeleton className="h-8 w-48 rounded-lg mb-2" />
          <Skeleton className="h-5 w-64 rounded-lg" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Lesson Type and Group/Student Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>

        {/* Date and YouTube Link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>

        {/* File Upload */}
        <div>
          <Skeleton className="h-5 w-32 rounded-lg mb-2" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>

        {/* Message */}
        <div>
          <Skeleton className="h-5 w-32 rounded-lg mb-2" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Skeleton className="h-12 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

// Recent Recordings Skeleton
export const RecentRecordingsSkeleton = () => (
  <div>
    <Skeleton className="h-8 w-64 rounded-lg mb-6" />
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="border border-slate-200/60 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-lg" />
              </div>

              <div className="mb-3">
                <Skeleton className="h-5 w-48 rounded-lg" />
              </div>

              <div className="mb-3">
                <Skeleton className="h-4 w-32 rounded-lg mb-2" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>

              <Skeleton className="h-20 w-full rounded-xl" />
            </div>

            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Full Teacher Page Skeleton
export const TeacherPageSkeleton = () => (
  <div className="min-h-screen bg-white lg:ml-4 xl:ml-0">
    <HeroSkeleton />
    <RecordingUploadFormSkeleton />
    <RecentRecordingsSkeleton />
  </div>
);

// Full Dashboard Skeleton
export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-white lg:ml-4 xl:ml-0">
    <HeroSkeleton />
    <NextLessonSkeleton />
    <StatsGridSkeleton />
    <div className="space-y-8">
      <CoursesSectionSkeleton />
      <RecentLessonsSkeleton />
    </div>
  </div>
);
