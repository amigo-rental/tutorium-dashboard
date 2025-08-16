/*
  Warnings:

  - You are about to drop the column `recordingId` on the `lesson_feedbacks` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,lessonId]` on the table `lesson_feedbacks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lessonId` to the `lesson_feedbacks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."LessonStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateTable
CREATE TABLE "public"."lessons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "meetingLink" TEXT,
    "notes" TEXT,
    "materials" TEXT[],
    "teacherId" TEXT NOT NULL,
    "groupId" TEXT,
    "topicId" TEXT,
    "lessonType" "public"."LessonType" NOT NULL,
    "status" "public"."LessonStatus" NOT NULL DEFAULT 'SCHEDULED',

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- Create placeholder lessons for existing feedbacks and attendance records
-- We'll create one lesson per unique recording that has feedbacks or attendance
INSERT INTO "public"."lessons" (
    "id", "title", "description", "date", "startTime", "endTime", "duration", 
    "isActive", "createdAt", "updatedAt", "meetingLink", "notes", "materials", 
    "teacherId", "groupId", "topicId", "lessonType", "status"
)
SELECT 
    'placeholder_' || r.id,
    COALESCE(r.title, 'Placeholder Lesson'),
    r.message,
    r.date,
    '14:00',
    '15:00',
    60,
    true,
    r."createdAt",
    r."updatedAt",
    r."youtubeLink",
    r.notes,
    ARRAY[]::TEXT[],
    r."teacherId",
    r."groupId",
    NULL,
    r."lessonType",
    'COMPLETED'
FROM "public"."recordings" r
WHERE r.id IN (
    SELECT DISTINCT "recordingId" FROM "public"."lesson_feedbacks"
    UNION
    SELECT DISTINCT "lessonId" FROM "public"."lesson_attendance"
);

-- Add lessonId column to lesson_feedbacks
ALTER TABLE "public"."lesson_feedbacks" ADD COLUMN "lessonId" TEXT;

-- Update lesson_feedbacks to reference placeholder lessons
UPDATE "public"."lesson_feedbacks" 
SET "lessonId" = 'placeholder_' || "recordingId"
WHERE "recordingId" IS NOT NULL;

-- Make lessonId NOT NULL
ALTER TABLE "public"."lesson_feedbacks" ALTER COLUMN "lessonId" SET NOT NULL;

-- Drop the old recordingId column
ALTER TABLE "public"."lesson_feedbacks" DROP COLUMN "recordingId";

-- Update lesson_attendance to reference placeholder lessons
UPDATE "public"."lesson_attendance" 
SET "lessonId" = 'placeholder_' || "lessonId"
WHERE "lessonId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "public"."lesson_attendance" DROP CONSTRAINT "lesson_attendance_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."lesson_feedbacks" DROP CONSTRAINT "lesson_feedbacks_recordingId_fkey";

-- DropIndex
DROP INDEX "public"."lesson_feedbacks_studentId_recordingId_key";

-- CreateIndex
CREATE UNIQUE INDEX "lesson_feedbacks_studentId_lessonId_key" ON "public"."lesson_feedbacks"("studentId", "lessonId");

-- AddForeignKey
ALTER TABLE "public"."lessons" ADD CONSTRAINT "lessons_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."lessons" ADD CONSTRAINT "lessons_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."lessons" ADD CONSTRAINT "lessons_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."lesson_feedbacks" ADD CONSTRAINT "lesson_feedbacks_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."lesson_attendance" ADD CONSTRAINT "lesson_attendance_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
