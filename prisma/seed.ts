import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../lib/auth/jwt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create users with hashed passwords
  const hashedPassword = await hashPassword("password123");

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@tutorium.com" },
    update: {},
    create: {
      email: "admin@tutorium.com",
      name: "Админ Администратор",
      password: hashedPassword,
      role: "ADMIN",
      avatar: "АА",
    },
  });

  console.log("✅ Admin created:", admin.email);

  // Create multiple teacher users
  const teachers = await Promise.all([
    prisma.user.upsert({
      where: { email: "teacher@tutorium.com" },
      update: {},
      create: {
        email: "teacher@tutorium.com",
        name: "Анна Петрова",
        password: hashedPassword,
        role: "TEACHER",
        avatar: "АП",
      },
    }),
    prisma.user.upsert({
      where: { email: "maria.gonzalez@tutorium.com" },
      update: {},
      create: {
        email: "maria.gonzalez@tutorium.com",
        name: "Мария Гонсалес",
        password: hashedPassword,
        role: "TEACHER",
        avatar: "МГ",
      },
    }),
    prisma.user.upsert({
      where: { email: "carlos.lopez@tutorium.com" },
      update: {},
      create: {
        email: "carlos.lopez@tutorium.com",
        name: "Карлос Лопес",
        password: hashedPassword,
        role: "TEACHER",
        avatar: "КЛ",
      },
    }),
  ]);

  console.log("✅ Teachers created:", teachers.length);

  // Create courses
  const courses = await Promise.all([
    prisma.course.upsert({
      where: { id: "course-a1" },
      update: {},
      create: {
        id: "course-a1",
        name: "Испанский для начинающих A1",
        description:
          "Базовый курс испанского языка для абсолютных новичков. Изучаем основы грамматики, лексики и произношения.",
        level: "A1",
        duration: 12, // 12 weeks
      },
    }),
    prisma.course.upsert({
      where: { id: "course-a2" },
      update: {},
      create: {
        id: "course-a2",
        name: "Испанский для продолжающих A2",
        description:
          "Курс для тех, кто уже знает основы испанского. Углубляем знания и развиваем разговорные навыки.",
        level: "A2",
        duration: 16, // 16 weeks
      },
    }),
    prisma.course.upsert({
      where: { id: "course-b1" },
      update: {},
      create: {
        id: "course-b1",
        name: "Испанский средний уровень B1",
        description:
          "Курс для подготовки к уровню B2. Фокус на сложных грамматических конструкциях и расширенной лексике.",
        level: "B1",
        duration: 20, // 20 weeks
      },
    }),
    prisma.course.upsert({
      where: { id: "course-b2" },
      update: {},
      create: {
        id: "course-b2",
        name: "Испанский продвинутый уровень B2",
        description:
          "Продвинутый курс для свободного общения на испанском языке. Подготовка к международным экзаменам.",
        level: "B2",
        duration: 24, // 24 weeks
      },
    }),
    prisma.course.upsert({
      where: { id: "course-c1" },
      update: {},
      create: {
        id: "course-c1",
        name: "Испанский профессиональный уровень C1",
        description:
          "Профессиональный уровень владения испанским языком. Академический и деловой испанский.",
        level: "C1",
        duration: 32, // 32 weeks
      },
    }),
  ]);

  console.log("✅ Courses created:", courses.length);

  // Create topics for each course
  const topics = await Promise.all([
    // A1 Course Topics
    prisma.topic.create({
      data: {
        name: "Приветствие и знакомство",
        description: "Базовые фразы для знакомства, числа 1-10, глагол 'ser'",
        order: 1,
        courseId: courses[0].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Семья и друзья",
        description:
          "Лексика по теме семьи, притяжательные местоимения, глагол 'tener'",
        order: 2,
        courseId: courses[0].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Еда и напитки",
        description: "Названия продуктов, глагол 'gustar', артикли",
        order: 3,
        courseId: courses[0].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Город и транспорт",
        description: "Названия мест в городе, направления, предлоги места",
        order: 4,
        courseId: courses[0].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Время и расписание",
        description:
          "Часы, дни недели, глаголы 'ser' и 'estar', настоящее время",
        order: 5,
        courseId: courses[0].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Покупки и цены",
        description: "Магазины, цвета, размеры одежды, числа 11-100",
        order: 6,
        courseId: courses[0].id,
      },
    }),

    // A2 Course Topics
    prisma.topic.create({
      data: {
        name: "Путешествия",
        description:
          "Аэропорт, отель, туристические фразы, прошедшее время (pretérito indefinido)",
        order: 1,
        courseId: courses[1].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Работа и профессии",
        description:
          "Названия профессий, описание обязанностей, прошедшее время (pretérito imperfecto)",
        order: 2,
        courseId: courses[1].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Здоровье и медицина",
        description: "Части тела, симптомы, посещение врача, модальные глаголы",
        order: 3,
        courseId: courses[1].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Культура и традиции",
        description:
          "Праздники, обычаи, культурные особенности, условные предложения",
        order: 4,
        courseId: courses[1].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Технологии и интернет",
        description: "Компьютерные термины, социальные сети, будущее время",
        order: 5,
        courseId: courses[1].id,
      },
    }),

    // B1 Course Topics
    prisma.topic.create({
      data: {
        name: "Деловая коммуникация",
        description:
          "Деловые письма, переговоры, презентации, формальный стиль",
        order: 1,
        courseId: courses[2].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Академический испанский",
        description:
          "Научные тексты, аргументация, дискуссии, сложные конструкции",
        order: 2,
        courseId: courses[2].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Литература и искусство",
        description:
          "Анализ текстов, культурные контексты, литературные приемы",
        order: 3,
        courseId: courses[2].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Современные проблемы",
        description: "Экология, социальные вопросы, политика, дискуссии",
        order: 4,
        courseId: courses[2].id,
      },
    }),

    // B2 Course Topics
    prisma.topic.create({
      data: {
        name: "Сложная грамматика",
        description: "Subjuntivo, условные предложения, пассивный залог",
        order: 1,
        courseId: courses[3].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Идиомы и фразеологизмы",
        description: "Разговорные выражения, сленг, культурные особенности",
        order: 2,
        courseId: courses[3].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Анализ текстов",
        description: "Критическое чтение, анализ стиля, интерпретация",
        order: 3,
        courseId: courses[3].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Письменная речь",
        description: "Эссе, отчеты, официальные документы, стилистика",
        order: 4,
        courseId: courses[3].id,
      },
    }),

    // C1 Course Topics
    prisma.topic.create({
      data: {
        name: "Академическое письмо",
        description: "Научные статьи, диссертации, исследовательские работы",
        order: 1,
        courseId: courses[4].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Перевод и интерпретация",
        description:
          "Профессиональный перевод, синхронный перевод, локализация",
        order: 2,
        courseId: courses[4].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Лингвистический анализ",
        description: "Фонетика, морфология, синтаксис, семантика",
        order: 3,
        courseId: courses[4].id,
      },
    }),
    prisma.topic.create({
      data: {
        name: "Культурология",
        description:
          "История испаноязычных стран, культурные традиции, современность",
        order: 4,
        courseId: courses[4].id,
      },
    }),
  ]);

  console.log("✅ Topics created:", topics.length);

  // Create groups (now belonging to courses)
  const groups = await Promise.all([
    prisma.group.upsert({
      where: {
        name_teacherId: {
          name: "Группа A1 - Утренняя",
          teacherId: teachers[0].id,
        },
      },
      update: {},
      create: {
        name: "Группа A1 - Утренняя",
        description:
          "Утренняя группа для начинающих. Занятия по понедельникам, средам и пятницам в 10:00.",
        level: "A1",
        maxStudents: 6,
        teacherId: teachers[0].id,
        courseId: courses[0].id, // A1 course
      },
    }),
    prisma.group.upsert({
      where: {
        name_teacherId: {
          name: "Группа A1 - Вечерняя",
          teacherId: teachers[0].id,
        },
      },
      update: {},
      create: {
        name: "Группа A1 - Вечерняя",
        description:
          "Вечерняя группа для начинающих. Занятия по вторникам и четвергам в 19:00.",
        level: "A1",
        maxStudents: 8,
        teacherId: teachers[0].id,
        courseId: courses[0].id, // A1 course
      },
    }),
    prisma.group.upsert({
      where: {
        name_teacherId: {
          name: "Группа A2 - Вечерняя",
          teacherId: teachers[0].id,
        },
      },
      update: {},
      create: {
        name: "Группа A2 - Вечерняя",
        description:
          "Вечерняя группа для продолжающих. Занятия по понедельникам и средам в 20:00.",
        level: "A2",
        maxStudents: 5,
        teacherId: teachers[0].id,
        courseId: courses[1].id, // A2 course
      },
    }),
    prisma.group.upsert({
      where: {
        name_teacherId: {
          name: "Группа B1 - Интенсив",
          teacherId: teachers[1].id,
        },
      },
      update: {},
      create: {
        name: "Группа B1 - Интенсив",
        description:
          "Интенсивная подготовка к B2. Занятия 5 раз в неделю по 2 часа.",
        level: "B1",
        maxStudents: 4,
        teacherId: teachers[1].id,
        courseId: courses[2].id, // B1 course
      },
    }),
    prisma.group.upsert({
      where: {
        name_teacherId: {
          name: "Группа B2 - Подготовка к экзамену",
          teacherId: teachers[1].id,
        },
      },
      update: {},
      create: {
        name: "Группа B2 - Подготовка к экзамену",
        description:
          "Подготовка к международным экзаменам DELE B2. Занятия по субботам и воскресеньям.",
        level: "B2",
        maxStudents: 6,
        teacherId: teachers[1].id,
        courseId: courses[3].id, // B2 course
      },
    }),
    prisma.group.upsert({
      where: {
        name_teacherId: {
          name: "Группа C1 - Профессиональный",
          teacherId: teachers[2].id,
        },
      },
      update: {},
      create: {
        name: "Группа C1 - Профессиональный",
        description:
          "Профессиональный уровень для преподавателей и переводчиков. Занятия по воскресеньям.",
        level: "C1",
        maxStudents: 3,
        teacherId: teachers[2].id,
        courseId: courses[4].id, // C1 course
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
        password: hashedPassword,
        role: "STUDENT",
        level: "A2",
        avatar: "ЕГ",
        groupId: groups[2].id, // A2 group
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
        groupId: groups[3].id, // B1 group
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
        groupId: groups[0].id, // A1 morning group
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
        groupId: groups[4].id, // B2 group
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
        groupId: groups[2].id, // A2 group
      },
    }),
    prisma.user.upsert({
      where: { email: "alexander.smirnov@example.com" },
      update: {},
      create: {
        name: "Александр Смирнов",
        email: "alexander.smirnov@example.com",
        password: hashedPassword,
        role: "STUDENT",
        level: "A1",
        avatar: "АС",
        groupId: groups[1].id, // A1 evening group
      },
    }),
    prisma.user.upsert({
      where: { email: "olga.volkova@example.com" },
      update: {},
      create: {
        name: "Ольга Волкова",
        email: "olga.volkova@example.com",
        password: hashedPassword,
        role: "STUDENT",
        level: "C1",
        avatar: "ОВ",
        groupId: groups[5].id, // C1 group
      },
    }),
    prisma.user.upsert({
      where: { email: "sergey.novikov@example.com" },
      update: {},
      create: {
        name: "Сергей Новиков",
        email: "sergey.novikov@example.com",
        password: hashedPassword,
        role: "STUDENT",
        level: "B1",
        avatar: "СН",
        groupId: groups[3].id, // B1 group
      },
    }),
    prisma.user.upsert({
      where: { email: "natalia.kuznetsova@example.com" },
      update: {},
      create: {
        name: "Наталья Кузнецова",
        email: "natalia.kuznetsova@example.com",
        password: hashedPassword,
        role: "STUDENT",
        level: "A1",
        avatar: "НК",
        groupId: groups[0].id, // A1 morning group
      },
    }),
    prisma.user.upsert({
      where: { email: "vladimir.sokolov@example.com" },
      update: {},
      create: {
        name: "Владимир Соколов",
        email: "vladimir.sokolov@example.com",
        password: hashedPassword,
        role: "STUDENT",
        level: "B2",
        avatar: "ВС",
        groupId: groups[4].id, // B2 group
      },
    }),
  ]);

  console.log("✅ Students created:", students.length);

  // Automatically enroll students in courses based on their groups
  console.log("Enrolling students in courses...");
  const enrollments = await Promise.all([
    // Elena Garcia - A2 course (via A2 group)
    prisma.user.update({
      where: { id: students[0].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[1].id }, // A2 course
        },
      },
    }),
    // Mikhail Petrov - B1 course (via B1 group)
    prisma.user.update({
      where: { id: students[1].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[2].id }, // B1 course
        },
      },
    }),
    // Anna Sidorova - A1 course (via A1 morning group)
    prisma.user.update({
      where: { id: students[2].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[0].id }, // A1 course
        },
      },
    }),
    // Dmitry Kozlov - B2 course (via B2 group)
    prisma.user.update({
      where: { id: students[3].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[3].id }, // B2 course
        },
      },
    }),
    // Maria Ivanova - A2 course (via A2 group)
    prisma.user.update({
      where: { id: students[4].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[1].id }, // A2 course
        },
      },
    }),
    // Alexander Smirnov - A1 course (via A1 evening group)
    prisma.user.update({
      where: { id: students[5].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[0].id }, // A1 course
        },
      },
    }),
    // Olga Volkova - C1 course (via C1 group)
    prisma.user.update({
      where: { id: students[6].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[4].id }, // C1 course
        },
      },
    }),
    // Sergey Novikov - B1 course (via B1 group)
    prisma.user.update({
      where: { id: students[7].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[2].id }, // B1 course
        },
      },
    }),
    // Natalia Kuznetsova - A1 course (via A1 morning group)
    prisma.user.update({
      where: { id: students[8].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[0].id }, // A1 course
        },
      },
    }),
    // Vladimir Sokolov - B2 course (via B2 group)
    prisma.user.update({
      where: { id: students[9].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[3].id }, // B2 course
        },
      },
    }),
  ]);

  console.log("✅ Course enrollments created:", enrollments.length);

  // Create sample recordings for different groups
  const recordings = await Promise.all([
    // A1 Morning Group Recordings
    prisma.recording.create({
      data: {
        lessonType: "GROUP",
        date: new Date("2024-01-15"),
        youtubeLink: "https://youtube.com/watch?v=a1_lesson1",
        message:
          "Отличный урок! Сегодня мы изучили приветствия и числа 1-10. Домашнее задание: упражнения 1-5 в рабочей тетради.",
        teacherId: teachers[0].id,
        groupId: groups[0].id, // A1 morning group
      },
    }),
    prisma.recording.create({
      data: {
        lessonType: "GROUP",
        date: new Date("2024-01-17"),
        youtubeLink: "https://youtube.com/watch?v=a1_lesson2",
        message:
          "Изучили тему 'Семья и друзья'. Глагол 'tener' и притяжательные местоимения. Домашнее задание: составить рассказ о своей семье.",
        teacherId: teachers[0].id,
        groupId: groups[0].id, // A1 morning group
      },
    }),

    // A1 Evening Group Recordings
    prisma.recording.create({
      data: {
        lessonType: "GROUP",
        date: new Date("2024-01-16"),
        youtubeLink: "https://youtube.com/watch?v=a1_evening1",
        message:
          "Первый урок вечерней группы! Приветствия и основы произношения. Домашнее задание: выучить алфавит.",
        teacherId: teachers[0].id,
        groupId: groups[1].id, // A1 evening group
      },
    }),

    // A2 Group Recordings
    prisma.recording.create({
      data: {
        lessonType: "GROUP",
        date: new Date("2024-01-16"),
        youtubeLink: "https://youtube.com/watch?v=a2_lesson1",
        message:
          "Урок по теме 'Путешествия'. Изучили лексику для аэропорта и отеля. Домашнее задание: написать рассказ о путешествии.",
        teacherId: teachers[0].id,
        groupId: groups[2].id, // A2 group
      },
    }),
    prisma.recording.create({
      data: {
        lessonType: "GROUP",
        date: new Date("2024-01-18"),
        youtubeLink: "https://youtube.com/watch?v=a2_lesson2",
        message:
          "Грамматика: прошедшее время (pretérito indefinido). Практика в парах и группах. Домашнее задание: упражнения 6-10.",
        teacherId: teachers[0].id,
        groupId: groups[2].id, // A2 group
      },
    }),

    // B1 Group Recordings
    prisma.recording.create({
      data: {
        lessonType: "GROUP",
        date: new Date("2024-01-15"),
        youtubeLink: "https://youtube.com/watch?v=b1_lesson1",
        message:
          "Деловая коммуникация. Формальный стиль общения. Домашнее задание: написать деловое письмо.",
        teacherId: teachers[1].id,
        groupId: groups[3].id, // B1 group
      },
    }),
    prisma.recording.create({
      data: {
        lessonType: "GROUP",
        date: new Date("2024-01-17"),
        youtubeLink: "https://youtube.com/watch?v=b1_lesson2",
        message:
          "Академический испанский. Научные тексты и аргументация. Домашнее задание: анализ статьи.",
        teacherId: teachers[1].id,
        groupId: groups[3].id, // B1 group
      },
    }),

    // B2 Group Recordings
    prisma.recording.create({
      data: {
        lessonType: "GROUP",
        date: new Date("2024-01-20"),
        youtubeLink: "https://youtube.com/watch?v=b2_lesson1",
        message:
          "Сложная грамматика: Subjuntivo. Подготовка к экзамену DELE B2. Домашнее задание: грамматические упражнения.",
        teacherId: teachers[1].id,
        groupId: groups[4].id, // B2 group
      },
    }),

    // C1 Group Recordings
    prisma.recording.create({
      data: {
        lessonType: "GROUP",
        date: new Date("2024-01-21"),
        youtubeLink: "https://youtube.com/watch?v=c1_lesson1",
        message:
          "Академическое письмо. Структура научной статьи. Домашнее задание: написать аннотацию к исследованию.",
        teacherId: teachers[2].id,
        groupId: groups[5].id, // C1 group
      },
    }),

    // Individual lessons
    prisma.recording.create({
      data: {
        lessonType: "INDIVIDUAL",
        date: new Date("2024-01-14"),
        youtubeLink: "https://youtube.com/watch?v=individual1",
        message:
          "Индивидуальный урок по разговорной практике. Фокус на произношении и беглости речи.",
        teacherId: teachers[0].id,
        students: {
          connect: [
            { id: students[0].id }, // Elena
            { id: students[1].id }, // Mikhail
          ],
        },
      },
    }),
  ]);

  console.log("✅ Recordings created:", recordings.length);

  // Create sample attachments for recordings
  const attachments = await Promise.all([
    // A1 Morning Group Attachments
    prisma.attachment.create({
      data: {
        filename: "a1_greetings_worksheet.pdf",
        originalName: "a1_greetings_worksheet.pdf",
        mimeType: "application/pdf",
        size: 512000,
        path: "/uploads/a1_greetings_worksheet.pdf",
        recordingId: recordings[0].id, // A1 lesson 1
      },
    }),
    prisma.attachment.create({
      data: {
        filename: "a1_family_vocabulary.pdf",
        originalName: "a1_family_vocabulary.pdf",
        mimeType: "application/pdf",
        size: 768000,
        path: "/uploads/a1_family_vocabulary.pdf",
        recordingId: recordings[1].id, // A1 lesson 2
      },
    }),

    // A2 Group Attachments
    prisma.attachment.create({
      data: {
        filename: "a2_travel_vocabulary.pdf",
        originalName: "a2_travel_vocabulary.pdf",
        mimeType: "application/pdf",
        size: 1024000,
        path: "/uploads/a2_travel_vocabulary.pdf",
        recordingId: recordings[3].id, // A2 travel lesson
      },
    }),
    prisma.attachment.create({
      data: {
        filename: "a2_past_tense_exercises.pdf",
        originalName: "a2_past_tense_exercises.pdf",
        mimeType: "application/pdf",
        size: 512000,
        path: "/uploads/a2_past_tense_exercises.pdf",
        recordingId: recordings[4].id, // A2 grammar lesson
      },
    }),

    // B1 Group Attachments
    prisma.attachment.create({
      data: {
        filename: "b1_business_communication.pdf",
        originalName: "b1_business_communication.pdf",
        mimeType: "application/pdf",
        size: 1536000,
        path: "/uploads/b1_business_communication.pdf",
        recordingId: recordings[5].id, // B1 business lesson
      },
    }),

    // B2 Group Attachments
    prisma.attachment.create({
      data: {
        filename: "b2_subjuntivo_exercises.pdf",
        originalName: "b2_subjuntivo_exercises.pdf",
        mimeType: "application/pdf",
        size: 1024000,
        path: "/uploads/b2_subjuntivo_exercises.pdf",
        recordingId: recordings[6].id, // B2 grammar lesson
      },
    }),

    // C1 Group Attachments
    prisma.attachment.create({
      data: {
        filename: "c1_academic_writing.pdf",
        originalName: "c1_academic_writing.pdf",
        mimeType: "application/pdf",
        size: 2048000,
        path: "/uploads/c1_academic_writing.pdf",
        recordingId: recordings[7].id, // C1 writing lesson
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
        comment:
          "Отличный урок! Все понятно объяснили, особенно понравились практические упражнения.",
        isAnonymous: false,
        studentId: students[0].id, // Elena Garcia
        recordingId: recordings[0].id, // A1 lesson
      },
    }),
    prisma.lessonFeedback.create({
      data: {
        rating: 4,
        comment:
          "Хороший урок, но хотелось бы больше практики разговорной речи.",
        isAnonymous: false,
        studentId: students[1].id, // Mikhail Petrov
        recordingId: recordings[4].id, // A2 lesson
      },
    }),
    prisma.lessonFeedback.create({
      data: {
        rating: 5,
        comment:
          "Превосходно! Очень понравилась структура урока и объяснение грамматики.",
        isAnonymous: true,
        studentId: students[2].id, // Anna Sidorova
        recordingId: recordings[1].id, // A1 lesson
      },
    }),
    prisma.lessonFeedback.create({
      data: {
        rating: 4,
        comment: "Интересный материал, но темп немного быстрый для меня.",
        isAnonymous: false,
        studentId: students[3].id, // Dmitry Kozlov
        recordingId: recordings[5].id, // B1 lesson
      },
    }),
    prisma.lessonFeedback.create({
      data: {
        rating: 5,
        comment:
          "Отличный урок! Много полезной информации для подготовки к экзамену.",
        isAnonymous: true,
        studentId: students[4].id, // Maria Ivanova
        recordingId: recordings[3].id, // A2 lesson
      },
    }),
    prisma.lessonFeedback.create({
      data: {
        rating: 5,
        comment:
          "Профессиональный подход к обучению. Очень доволен качеством материала.",
        isAnonymous: false,
        studentId: students[6].id, // Olga Volkova
        recordingId: recordings[7].id, // C1 lesson
      },
    }),
  ]);

  console.log("✅ Lesson feedback created:", feedbacks.length);

  // Create lesson attendance records
  console.log("Creating lesson attendance...");
  const attendanceRecords = await Promise.all([
    // A1 Morning Group Attendance
    prisma.lessonAttendance.create({
      data: {
        lessonId: recordings[0].id,
        studentId: students[2].id, // Anna Sidorova
        status: "PRESENT",
        notes: "Активно участвовала в уроке",
      },
    }),
    prisma.lessonAttendance.create({
      data: {
        lessonId: recordings[0].id,
        studentId: students[8].id, // Natalia Kuznetsova
        status: "PRESENT",
        notes: "Хорошо справилась с заданиями",
      },
    }),

    // A2 Group Attendance
    prisma.lessonAttendance.create({
      data: {
        lessonId: recordings[3].id,
        studentId: students[0].id, // Elena Garcia
        status: "PRESENT",
        notes: "Отличная работа на уроке",
      },
    }),
    prisma.lessonAttendance.create({
      data: {
        lessonId: recordings[3].id,
        studentId: students[4].id, // Maria Ivanova
        status: "LATE",
        notes: "Опоздала на 10 минут",
      },
    }),

    // B1 Group Attendance
    prisma.lessonAttendance.create({
      data: {
        lessonId: recordings[5].id,
        studentId: students[1].id, // Mikhail Petrov
        status: "PRESENT",
        notes: "Активно участвовал в дискуссии",
      },
    }),
    prisma.lessonAttendance.create({
      data: {
        lessonId: recordings[5].id,
        studentId: students[7].id, // Sergey Novikov
        status: "ABSENT",
        notes: "По семейным обстоятельствам",
      },
    }),
  ]);

  console.log("✅ Attendance records created:", attendanceRecords.length);

  console.log("🎉 Database seeding completed successfully!");
  console.log("\n📋 Test Accounts:");
  console.log("Admin Email: admin@tutorium.com");
  console.log("Teacher 1 Email: teacher@tutorium.com");
  console.log("Teacher 2 Email: maria.gonzalez@tutorium.com");
  console.log("Teacher 3 Email: carlos.lopez@tutorium.com");
  console.log("Password: password123");
  console.log("\n📚 Courses Available:");
  console.log("- A1: Испанский для начинающих (12 weeks)");
  console.log("- A2: Испанский для продолжающих (16 weeks)");
  console.log("- B1: Испанский средний уровень (20 weeks)");
  console.log("- B2: Испанский продвинутый уровень (24 weeks)");
  console.log("- C1: Испанский профессиональный уровень (32 weeks)");
  console.log("\n👥 Groups Created:");
  console.log("- 2 A1 groups (morning & evening)");
  console.log("- 1 A2 group");
  console.log("- 1 B1 intensive group");
  console.log("- 1 B2 exam preparation group");
  console.log("- 1 C1 professional group");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
