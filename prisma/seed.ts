import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../lib/auth/jwt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create a teacher user
  const hashedPassword = await hashPassword("password123");

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@tutorium.com" },
    update: {},
    create: {
      email: "teacher@tutorium.com",
      name: "Анна Петрова",
      password: hashedPassword,
      role: "TEACHER",
      avatar: "АП",
    },
  });

  console.log("✅ Teacher created:", teacher.email);

  // Create groups
  const groups = await Promise.all([
    prisma.group.upsert({
      where: {
        name_teacherId: {
          name: "Группа A1 - Утренняя",
          teacherId: teacher.id,
        },
      },
      update: {},
      create: {
        name: "Группа A1 - Утренняя",
        description: "Утренняя группа для начинающих",
        level: "A1",
        maxStudents: 6,
        teacherId: teacher.id,
      },
    }),
    prisma.group.upsert({
      where: {
        name_teacherId: {
          name: "Группа A2 - Вечерняя",
          teacherId: teacher.id,
        },
      },
      update: {},
      create: {
        name: "Группа A2 - Вечерняя",
        description: "Вечерняя группа для продолжающих",
        level: "A2",
        maxStudents: 5,
        teacherId: teacher.id,
      },
    }),
    prisma.group.upsert({
      where: {
        name_teacherId: {
          name: "Группа B1 - Интенсив",
          teacherId: teacher.id,
        },
      },
      update: {},
      create: {
        name: "Группа B1 - Интенсив",
        description: "Интенсивная подготовка к B2",
        level: "B1",
        maxStudents: 4,
        teacherId: teacher.id,
      },
    }),
  ]);

  console.log("✅ Groups created:", groups.length);

  // Create students (now as Users with STUDENT role)
  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: "elena.garcia@example.com" },
      update: {},
      create: {
        name: "Елена Гарсия",
        email: "elena.garcia@example.com",
        password: hashedPassword, // Students also need passwords
        role: "STUDENT",
        level: "A2",
        avatar: "ЕГ",
        groupId: groups[1].id, // A2 group
      },
    }),
    prisma.user.upsert({
      where: { email: "mikhail.petrov@example.com" },
      update: {},
      create: {
        name: "Михаил Петров",
        email: "mikhail.petrov@example.com",
        password: hashedPassword,
        role: "STUDENT",
        level: "B1",
        avatar: "МП",
        groupId: groups[2].id, // B1 group
      },
    }),
    prisma.user.upsert({
      where: { email: "anna.sidorova@example.com" },
      update: {},
      create: {
        name: "Анна Сидорова",
        email: "anna.sidorova@example.com",
        password: hashedPassword,
        role: "STUDENT",
        level: "A1",
        avatar: "АС",
        groupId: groups[0].id, // A1 group
      },
    }),
    prisma.user.upsert({
      where: { email: "dmitry.kozlov@example.com" },
      update: {},
      create: {
        name: "Дмитрий Козлов",
        email: "dmitry.kozlov@example.com",
        password: hashedPassword,
        role: "STUDENT",
        level: "B2",
        avatar: "ДК",
        // No group - individual student
      },
    }),
    prisma.user.upsert({
      where: { email: "maria.ivanova@example.com" },
      update: {},
      create: {
        name: "Мария Иванова",
        email: "maria.ivanova@example.com",
        password: hashedPassword,
        role: "STUDENT",
        level: "A2",
        avatar: "МИ",
        groupId: groups[1].id, // A2 group
      },
    }),
  ]);

  console.log("✅ Students created:", students.length);

  // Create sample recordings
  const recordings = await Promise.all([
    // A1 Group Recording
    prisma.recording.create({
      data: {
        lessonType: "GROUP",
        date: new Date("2024-01-15"),
        youtubeLink: "https://youtube.com/watch?v=abc123",
        message:
          "Отличный урок! Сегодня мы изучили прошедшее время. Домашнее задание: упражнения 1-5 в рабочей тетради.",
        teacherId: teacher.id,
        groupId: groups[0].id, // A1 group
      },
    }),
    
    // A2 Group Recording (Elena's group)
    prisma.recording.create({
      data: {
        lessonType: "GROUP",
        date: new Date("2024-01-16"),
        youtubeLink: "https://youtube.com/watch?v=xyz789",
        message:
          "Урок по теме 'Путешествия'. Изучили лексику для аэропорта и отеля. Домашнее задание: написать рассказ о путешествии.",
        teacherId: teacher.id,
        groupId: groups[1].id, // A2 group (Elena's group)
      },
    }),
    
    // Another A2 Group Recording
    prisma.recording.create({
      data: {
        lessonType: "GROUP",
        date: new Date("2024-01-18"),
        youtubeLink: "https://youtube.com/watch?v=mno456",
        message:
          "Грамматика: будущее время. Практика в парах и группах. Домашнее задание: упражнения 6-10, подготовка к тесту.",
        teacherId: teacher.id,
        groupId: groups[1].id, // A2 group (Elena's group)
      },
    }),
    
    // Individual lesson for Elena
    prisma.recording.create({
      data: {
        lessonType: "INDIVIDUAL",
        date: new Date("2024-01-14"),
        youtubeLink: "https://youtube.com/watch?v=def456",
        message:
          "Индивидуальный урок по разговорной практике. Фокус на произношении и беглости речи.",
        teacherId: teacher.id,
        students: {
          connect: [
            { id: students[0].id }, // Elena
            { id: students[1].id }, // Mikhail
          ],
        },
      },
    }),
    
    // Individual lesson specifically for Elena
    prisma.recording.create({
      data: {
        lessonType: "INDIVIDUAL",
        date: new Date("2024-01-20"),
        youtubeLink: "https://youtube.com/watch?v=pqr321",
        message:
          "Индивидуальный урок для Елены: работа над произношением звука 'р' и интонацией в вопросах. Отличный прогресс!",
        teacherId: teacher.id,
        students: {
          connect: [
            { id: students[0].id }, // Elena only
          ],
        },
      },
    }),
    
    // Recent A2 Group Recording
    prisma.recording.create({
      data: {
        lessonType: "GROUP",
        date: new Date("2024-01-22"),
        youtubeLink: "https://youtube.com/watch?v=stu654",
        message:
          "Разговорная практика: 'Мой город'. Студенты рассказывали о своих городах. Елена отлично справилась с презентацией!",
        teacherId: teacher.id,
        groupId: groups[1].id, // A2 group (Elena's group)
      },
    }),
    
    // Upcoming A2 Group Recording
    prisma.recording.create({
      data: {
        lessonType: "GROUP",
        date: new Date("2024-01-25"),
        youtubeLink: "https://youtube.com/watch?v=vwx987",
        message:
          "Подготовка к тесту A2. Повторение всех тем месяца. Приходите готовыми к активной работе!",
        teacherId: teacher.id,
        groupId: groups[1].id, // A2 group (Elena's group)
      },
    }),
  ]);

  console.log("✅ Recordings created:", recordings.length);

  // Create sample attachments for recordings
  const attachments = await Promise.all([
    // Attachments for Elena's group recordings
    prisma.attachment.create({
      data: {
        filename: "travel_vocabulary.pdf",
        originalName: "travel_vocabulary.pdf",
        mimeType: "application/pdf",
        size: 1024000,
        path: "/uploads/travel_vocabulary.pdf",
        recordingId: recordings[1].id, // A2 Travel lesson
      },
    }),
    prisma.attachment.create({
      data: {
        filename: "future_tense_exercises.pdf",
        originalName: "future_tense_exercises.pdf",
        mimeType: "application/pdf",
        size: 512000,
        path: "/uploads/future_tense_exercises.pdf",
        recordingId: recordings[2].id, // A2 Future tense lesson
      },
    }),
    prisma.attachment.create({
      data: {
        filename: "pronunciation_guide.mp3",
        originalName: "pronunciation_guide.mp3",
        mimeType: "audio/mpeg",
        size: 2048000,
        path: "/uploads/pronunciation_guide.mp3",
        recordingId: recordings[4].id, // Elena's individual lesson
      },
    }),
    prisma.attachment.create({
      data: {
        filename: "city_presentation_template.pptx",
        originalName: "city_presentation_template.pptx",
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        size: 1536000,
        path: "/uploads/city_presentation_template.pptx",
        recordingId: recordings[5].id, // City presentation lesson
      },
    }),
    prisma.attachment.create({
      data: {
        filename: "a2_test_preparation.pdf",
        originalName: "a2_test_preparation.pdf",
        mimeType: "application/pdf",
        size: 768000,
        path: "/uploads/a2_test_preparation.pdf",
        recordingId: recordings[6].id, // A2 test preparation
      },
    }),
  ]);

  console.log("✅ Attachments created:", attachments.length);

  // Create lesson feedback
  console.log("Creating lesson feedback...");
  const feedbacks = await Promise.all([
    prisma.lessonFeedback.create({
      data: {
        rating: 5,
        comment: "Отличный урок! Все понятно объяснили.",
        isAnonymous: false,
        studentId: students[0].id, // Elena Garcia
        recordingId: recordings[0].id, // Spanish A1 lesson
      },
    }),
    prisma.lessonFeedback.create({
      data: {
        rating: 4,
        comment: "Хороший урок, но хотелось бы больше практики.",
        isAnonymous: false,
        studentId: students[1].id, // Maria Rodriguez
        recordingId: recordings[1].id, // Spanish A2 lesson
      },
    }),
    prisma.lessonFeedback.create({
      data: {
        rating: 5,
        comment: "Превосходно! Очень понравилось.",
        isAnonymous: true,
        studentId: students[2].id, // Carlos Mendez
        recordingId: recordings[2].id, // English B1 lesson
      },
    }),
    prisma.lessonFeedback.create({
      data: {
        rating: 3,
        comment: "Нормально, но можно было бы лучше.",
        isAnonymous: false,
        studentId: students[0].id, // Elena Garcia
        recordingId: recordings[3].id, // English B2 lesson
      },
    }),
    prisma.lessonFeedback.create({
      data: {
        rating: 4,
        isAnonymous: true,
        studentId: students[1].id, // Maria Rodriguez
        recordingId: recordings[4].id, // Individual lesson
      },
    }),
  ]);

  console.log("✅ Lesson feedback created:", feedbacks.length);

  console.log("🎉 Database seeding completed successfully!");
  console.log("\n📋 Test Account:");
  console.log("Email: teacher@tutorium.com");
  console.log("Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
