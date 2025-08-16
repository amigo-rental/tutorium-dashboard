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
  console.log("Creating courses...");
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        name: "Испанский с нуля в группе",
        description: "Базовый курс испанского языка для группового обучения",
        level: "A1",
        duration: 12,
        difficulty: "BEGINNER",
        category: "GROUP",
        tags: ["базовый", "группа", "с нуля"],
        isActive: true,
      },
    }),
    prisma.course.create({
      data: {
        name: "Интенсив с нуля до A2",
        description:
          "Интенсивный курс испанского языка от начального до базового уровня",
        level: "A2",
        duration: 16,
        difficulty: "BEGINNER",
        category: "INTENSIVE",
        tags: ["интенсив", "с нуля", "до A2"],
        isActive: true,
      },
    }),
    prisma.course.create({
      data: {
        name: "Испанский с нуля индивидуально",
        description: "Индивидуальное обучение испанскому языку с нуля",
        level: "A1",
        duration: 20,
        difficulty: "BEGINNER",
        category: "INDIVIDUAL",
        tags: ["индивидуально", "с нуля", "персонально"],
        isActive: true,
      },
    }),
  ]);

  console.log("✅ Courses created:", courses.length);

  // Create topics for all courses
  console.log("Creating topics...");

  // Create topics for "Испанский с нуля в группе" course
  const groupCourseTopics = await Promise.all([
    // 1A: алфавит и правила чтения
    prisma.topic.create({
      data: {
        name: "1А: алфавит и правила чтения",
        description: "Изучаем испанский алфавит, правила произношения и чтения",
        order: 1,
        courseId: courses[0].id, // Испанский с нуля в группе
        isActive: true,
      },
    }),
    // 1B: приветствие, цифры
    prisma.topic.create({
      data: {
        name: "1B: приветствие, цифры",
        description: "Базовые приветствия, представления и числа от 1 до 100",
        order: 2,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 1C: являться и находиться
    prisma.topic.create({
      data: {
        name: "1С: являться и находиться",
        description: "Глаголы ser и estar - основные различия и использование",
        order: 3,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 1D: артикль, род и множественное число
    prisma.topic.create({
      data: {
        name: "1D: артикль, род и множественное число",
        description:
          "Определенные и неопределенные артикли, род существительных, множественное число",
        order: 4,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 1E: принадлежащее местоимение
    prisma.topic.create({
      data: {
        name: "1Е: принадлежащее местоимение",
        description:
          "Притяжательные местоимения: mi, tu, su, nuestro, vuestro, su",
        order: 5,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 1F: глагол estar + эмоции
    prisma.topic.create({
      data: {
        name: "1F: глагол estar + эмоции",
        description:
          "Глагол estar с прилагательными для описания эмоций и состояний",
        order: 6,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 1G: повторение
    prisma.topic.create({
      data: {
        name: "1G: повторение",
        description: "Повторение и закрепление материала первого блока",
        order: 7,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 1H: проверка знаний
    prisma.topic.create({
      data: {
        name: "1H: проверка знаний",
        description: "Контрольная работа по первому блоку тем",
        order: 8,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 2A: presente de indicativo - правильные глаголы
    prisma.topic.create({
      data: {
        name: "2A: presente de indicativo - правильные глаголы",
        description:
          "Настоящее время изъявительного наклонения для правильных глаголов",
        order: 9,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 2B: presente - неправильные глаголы
    prisma.topic.create({
      data: {
        name: "2B: presente - неправильные глаголы",
        description:
          "Настоящее время для неправильных глаголов: ser, estar, tener, ir, hacer",
        order: 10,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 2C: вопросы и ответы в настоящем времени
    prisma.topic.create({
      data: {
        name: "2С: вопросы и ответы в настоящем времени",
        description: "Построение вопросов и ответов в настоящем времени",
        order: 11,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 2D: практика настоящего времени
    prisma.topic.create({
      data: {
        name: "2D: практика настоящего времени",
        description: "Практические упражнения по настоящему времени",
        order: 12,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 2E: практика настоящего времени
    prisma.topic.create({
      data: {
        name: "2E: практика настоящего времени",
        description: "Дополнительная практика настоящего времени",
        order: 13,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 2F: практика настоящего времени
    prisma.topic.create({
      data: {
        name: "2F: практика настоящего времени",
        description: "Продолжение практики настоящего времени",
        order: 14,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 2G: повторение
    prisma.topic.create({
      data: {
        name: "2G: повторение",
        description: "Повторение и закрепление материала второго блока",
        order: 15,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 2H: проверка знаний
    prisma.topic.create({
      data: {
        name: "2H: проверка знаний",
        description: "Контрольная работа по второму блоку тем",
        order: 16,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 3A: ser, estar, tener, haber
    prisma.topic.create({
      data: {
        name: "3A: ser, estar, tener, haber",
        description: "Углубленное изучение основных глаголов испанского языка",
        order: 17,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 3B: tener que, hay que
    prisma.topic.create({
      data: {
        name: "3B: tener que, hay que",
        description:
          "Модальные конструкции для выражения необходимости и обязательства",
        order: 18,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 3C: глагол hay
    prisma.topic.create({
      data: {
        name: "3C: глагол hay",
        description: "Использование глагола hay для выражения существования",
        order: 19,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 3D: наречия места
    prisma.topic.create({
      data: {
        name: "3D: наречия места",
        description: "Наречия места: aquí, allí, cerca, lejos, dentro, fuera",
        order: 20,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 3E: разговорная практика
    prisma.topic.create({
      data: {
        name: "3E: разговорная практика",
        description: "Практика разговорной речи на основе изученного материала",
        order: 21,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 3F: вопросительные местоимения
    prisma.topic.create({
      data: {
        name: "3F: вопросительные местоимения",
        description:
          "Вопросительные местоимения: qué, quién, dónde, cuándo, cómo, por qué",
        order: 22,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 3G: повторение
    prisma.topic.create({
      data: {
        name: "3G: повторение",
        description: "Повторение и закрепление материала третьего блока",
        order: 23,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    // 3H: проверка знаний
    prisma.topic.create({
      data: {
        name: "3H: проверка знаний",
        description: "Финальная контрольная работа по всему курсу",
        order: 24,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
  ]);

  // Create the same topics for "Интенсив с нуля до A2" course
  const intensiveCourseTopics = await Promise.all([
    prisma.topic.create({
      data: {
        name: "1А: алфавит и правила чтения",
        description: "Изучаем испанский алфавит, правила произношения и чтения",
        order: 1,
        courseId: courses[1].id, // Интенсив с нуля до A2
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "1B: приветствие, цифры",
        description: "Базовые приветствия, представления и числа от 1 до 100",
        order: 2,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "1С: являться и находиться",
        description: "Глаголы ser и estar - основные различия и использование",
        order: 3,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "1D: артикль, род и множественное число",
        description:
          "Определенные и неопределенные артикли, род существительных, множественное число",
        order: 4,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "1Е: принадлежащее местоимение",
        description:
          "Притяжательные местоимения: mi, tu, su, nuestro, vuestro, su",
        order: 5,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "1F: глагол estar + эмоции",
        description:
          "Глагол estar с прилагательными для описания эмоций и состояний",
        order: 6,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "1G: повторение",
        description: "Повторение и закрепление материала первого блока",
        order: 7,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "1H: проверка знаний",
        description: "Контрольная работа по первому блоку тем",
        order: 8,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "2A: presente de indicativo - правильные глаголы",
        description:
          "Настоящее время изъявительного наклонения для правильных глаголов",
        order: 9,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "2B: presente - неправильные глаголы",
        description:
          "Настоящее время для неправильных глаголов: ser, estar, tener, ir, hacer",
        order: 10,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "2С: вопросы и ответы в настоящем времени",
        description: "Построение вопросов и ответов в настоящем времени",
        order: 11,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "2D: практика настоящего времени",
        description: "Практические упражнения по настоящему времени",
        order: 12,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "2E: практика настоящего времени",
        description: "Дополнительная практика настоящего времени",
        order: 13,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "2F: практика настоящего времени",
        description: "Продолжение практики настоящего времени",
        order: 14,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "2G: повторение",
        description: "Повторение и закрепление материала второго блока",
        order: 15,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "2H: проверка знаний",
        description: "Контрольная работа по второму блоку тем",
        order: 16,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "3A: ser, estar, tener, haber",
        description: "Углубленное изучение основных глаголов испанского языка",
        order: 17,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "3B: tener que, hay que",
        description:
          "Модальные конструкции для выражения необходимости и обязательства",
        order: 18,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "3C: глагол hay",
        description: "Использование глагола hay для выражения существования",
        order: 19,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "3D: наречия места",
        description: "Наречия места: aquí, allí, cerca, lejos, dentro, fuera",
        order: 20,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "3E: разговорная практика",
        description: "Практика разговорной речи на основе изученного материала",
        order: 21,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "3F: вопросительные местоимения",
        description:
          "Вопросительные местоимения: qué, quién, dónde, cuándo, cómo, por qué",
        order: 22,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "3G: повторение",
        description: "Повторение и закрепление материала третьего блока",
        order: 23,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "3H: проверка знаний",
        description: "Финальная контрольная работа по всему курсу",
        order: 24,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
  ]);

  // Create the same topics for "Испанский с нуля индивидуально" course
  const individualCourseTopics = await Promise.all([
    prisma.topic.create({
      data: {
        name: "1А: алфавит и правила чтения",
        description: "Изучаем испанский алфавит, правила произношения и чтения",
        order: 1,
        courseId: courses[2].id, // Испанский с нуля индивидуально
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "1B: приветствие, цифры",
        description: "Базовые приветствия, представления и числа от 1 до 100",
        order: 2,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "1С: являться и находиться",
        description: "Глаголы ser и estar - основные различия и использование",
        order: 3,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "1D: артикль, род и множественное число",
        description:
          "Определенные и неопределенные артикли, род существительных, множественное число",
        order: 4,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "1Е: принадлежащее местоимение",
        description:
          "Притяжательные местоимения: mi, tu, su, nuestro, vuestro, su",
        order: 5,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "1F: глагол estar + эмоции",
        description:
          "Глагол estar с прилагательными для описания эмоций и состояний",
        order: 6,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "1G: повторение",
        description: "Повторение и закрепление материала первого блока",
        order: 7,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "1H: проверка знаний",
        description: "Контрольная работа по первому блоку тем",
        order: 8,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "2A: presente de indicativo - правильные глаголы",
        description:
          "Настоящее время изъявительного наклонения для правильных глаголов",
        order: 9,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "2B: presente - неправильные глаголы",
        description:
          "Настоящее время для неправильных глаголов: ser, estar, tener, ir, hacer",
        order: 10,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "2С: вопросы и ответы в настоящем времени",
        description: "Построение вопросов и ответов в настоящем времени",
        order: 11,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "2D: практика настоящего времени",
        description: "Практические упражнения по настоящему времени",
        order: 12,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "2E: практика настоящего времени",
        description: "Дополнительная практика настоящего времени",
        order: 13,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "2F: практика настоящего времени",
        description: "Продолжение практики настоящего времени",
        order: 14,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "2G: повторение",
        description: "Повторение и закрепление материала второго блока",
        order: 15,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "2H: проверка знаний",
        description: "Контрольная работа по второму блоку тем",
        order: 16,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "3A: ser, estar, tener, haber",
        description: "Углубленное изучение основных глаголов испанского языка",
        order: 17,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "3B: tener que, hay que",
        description:
          "Модальные конструкции для выражения необходимости и обязательства",
        order: 18,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "3C: глагол hay",
        description: "Использование глагола hay для выражения существования",
        order: 19,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "3D: наречия места",
        description: "Наречия места: aquí, allí, cerca, lejos, dentro, fuera",
        order: 20,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "3E: разговорная практика",
        description: "Практика разговорной речи на основе изученного материала",
        order: 21,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "3F: вопросительные местоимения",
        description:
          "Вопросительные местоимения: qué, quién, dónde, cuándo, cómo, por qué",
        order: 22,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "3G: повторение",
        description: "Повторение и закрепление материала третьего блока",
        order: 23,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
    prisma.topic.create({
      data: {
        name: "3H: проверка знаний",
        description: "Финальная контрольная работа по всему курсу",
        order: 24,
        courseId: courses[2].id,
        isActive: true,
      },
    }),
  ]);

  // Combine all topics for easier reference
  const allTopics = [
    ...groupCourseTopics,
    ...intensiveCourseTopics,
    ...individualCourseTopics,
  ];
  const topics = allTopics;

  console.log("✅ Topics created:", topics.length);

  // Create groups
  console.log("Creating groups...");
  const groups = await Promise.all([
    // Интенсив группы (Интенсив с нуля до A2)
    prisma.group.create({
      data: {
        name: "Интенсив 10010925",
        description: "Интенсивная группа по испанскому языку",
        level: "A2",
        maxStudents: 6,
        isActive: true,
        startDate: new Date("2025-01-10"),
        endDate: new Date("2025-04-25"),
        schedule: {
          days: ["Понедельник", "Среда", "Пятница"],
          time: "19:00-21:00",
        },
        meetingLink: "https://zoom.us/j/123456789",
        teacherId: teachers[0].id,
        courseId: courses[1].id, // Интенсив с нуля до A2
        currentStudents: 4,
        totalLessons: 24,
        averageRating: 4.8,
      },
    }),
    prisma.group.create({
      data: {
        name: "Интенсив 19210825",
        description: "Интенсивная группа по испанскому языку",
        level: "A2",
        maxStudents: 6,
        isActive: true,
        startDate: new Date("2025-08-19"),
        endDate: new Date("2025-12-05"),
        schedule: {
          days: ["Вторник", "Четверг", "Суббота"],
          time: "18:00-20:00",
        },
        meetingLink: "https://zoom.us/j/987654321",
        teacherId: teachers[1].id,
        courseId: courses[1].id, // Интенсив с нуля до A2
        currentStudents: 5,
        totalLessons: 24,
        averageRating: 4.7,
      },
    }),
    prisma.group.create({
      data: {
        name: "Интенсив 12070725",
        description: "Интенсивная группа по испанскому языку",
        level: "A2",
        maxStudents: 6,
        isActive: true,
        startDate: new Date("2025-07-12"),
        endDate: new Date("2025-10-25"),
        schedule: {
          days: ["Понедельник", "Среда", "Пятница"],
          time: "20:00-22:00",
        },
        meetingLink: "https://zoom.us/j/456789123",
        teacherId: teachers[2].id,
        courseId: courses[1].id, // Интенсив с нуля до A2
        currentStudents: 3,
        totalLessons: 24,
        averageRating: 4.6,
      },
    }),
    prisma.group.create({
      data: {
        name: "Интенсив 20300625",
        description: "Интенсивная группа по испанскому языку",
        level: "A2",
        maxStudents: 6,
        isActive: true,
        startDate: new Date("2025-06-20"),
        endDate: new Date("2025-09-30"),
        schedule: {
          days: ["Вторник", "Четверг", "Суббота"],
          time: "17:00-19:00",
        },
        meetingLink: "https://zoom.us/j/789123456",
        teacherId: teachers[0].id,
        courseId: courses[1].id, // Интенсив с нуля до A2
        currentStudents: 6,
        totalLessons: 24,
        averageRating: 4.9,
      },
    }),
    prisma.group.create({
      data: {
        name: "Интенсив 11030525",
        description: "Интенсивная группа по испанскому языку",
        level: "A2",
        maxStudents: 6,
        isActive: true,
        startDate: new Date("2025-05-11"),
        endDate: new Date("2025-08-20"),
        schedule: {
          days: ["Понедельник", "Среда", "Пятница"],
          time: "16:00-18:00",
        },
        meetingLink: "https://zoom.us/j/321654987",
        teacherId: teachers[1].id,
        courseId: courses[1].id, // Интенсив с нуля до A2
        currentStudents: 4,
        totalLessons: 24,
        averageRating: 4.5,
      },
    }),
    prisma.group.create({
      data: {
        name: "Интенсив 18120525",
        description: "Интенсивная группа по испанскому языку",
        level: "A2",
        maxStudents: 6,
        isActive: true,
        startDate: new Date("2025-12-18"),
        endDate: new Date("2026-03-30"),
        schedule: {
          days: ["Вторник", "Четверг", "Суббота"],
          time: "19:00-21:00",
        },
        meetingLink: "https://zoom.us/j/147258369",
        teacherId: teachers[0].id,
        courseId: courses[1].id, // Интенсив с нуля до A2
        currentStudents: 2,
        totalLessons: 24,
        averageRating: 4.4,
      },
    }),
    // Группа группы (Испанский с нуля в группе)
    prisma.group.create({
      data: {
        name: "Группа 20020925",
        description: "Группа по испанскому языку с нуля",
        level: "A1",
        maxStudents: 8,
        isActive: true,
        startDate: new Date("2025-09-20"),
        endDate: new Date("2026-01-10"),
        schedule: {
          days: ["Понедельник", "Среда"],
          time: "18:00-20:00",
        },
        meetingLink: "https://zoom.us/j/963852741",
        teacherId: teachers[2].id,
        courseId: courses[0].id, // Испанский с нуля в группе
        currentStudents: 6,
        totalLessons: 24,
        averageRating: 4.7,
      },
    }),
    prisma.group.create({
      data: {
        name: "Группа 10100925",
        description: "Группа по испанскому языку с нуля",
        level: "A1",
        maxStudents: 8,
        isActive: true,
        startDate: new Date("2025-09-10"),
        endDate: new Date("2025-12-30"),
        schedule: {
          days: ["Вторник", "Четверг"],
          time: "19:00-21:00",
        },
        meetingLink: "https://zoom.us/j/852963741",
        teacherId: teachers[1].id,
        courseId: courses[0].id, // Испанский с нуля в группе
        currentStudents: 7,
        totalLessons: 24,
        averageRating: 4.8,
      },
    }),
    prisma.group.create({
      data: {
        name: "Группа 10050825",
        description: "Группа по испанскому языку с нуля",
        level: "A1",
        maxStudents: 8,
        isActive: true,
        startDate: new Date("2025-08-10"),
        endDate: new Date("2025-11-25"),
        schedule: {
          days: ["Понедельник", "Четверг"],
          time: "17:00-19:00",
        },
        meetingLink: "https://zoom.us/j/741852963",
        teacherId: teachers[0].id,
        courseId: courses[0].id, // Испанский с нуля в группе
        currentStudents: 5,
        totalLessons: 24,
        averageRating: 4.6,
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
        groupId: groups[0].id, // Интенсив 10010925
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
        level: "A2",
        avatar: "МП",
        groupId: groups[1].id, // Интенсив 19210825
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
        groupId: groups[6].id, // Группа 20020925
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
        level: "A2",
        avatar: "ДК",
        groupId: groups[4].id, // Интенсив 20300625
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
        groupId: groups[0].id, // Интенсив 10010925
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
        groupId: groups[7].id, // Группа 10100925
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
        level: "A2",
        avatar: "ОВ",
        groupId: groups[5].id, // Интенсив 11030525
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
        level: "A2",
        avatar: "СН",
        groupId: groups[1].id, // Интенсив 19210825
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
        groupId: groups[6].id, // Группа 20020925
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
        level: "A2",
        avatar: "ВС",
        groupId: groups[4].id, // Интенсив 20300625
      },
    }),
  ]);

  console.log("✅ Students created:", students.length);

  // Enroll students in courses
  console.log("Enrolling students in courses...");
  const enrollments = await Promise.all([
    // Elena Grigorieva - A2 course (via intensive group)
    prisma.user.update({
      where: { id: students[0].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[1].id }, // Интенсив с нуля до A2
        },
      },
    }),
    // Maria Petrova - A2 course (via intensive group)
    prisma.user.update({
      where: { id: students[1].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[1].id }, // Интенсив с нуля до A2
        },
      },
    }),
    // Anna Sidorova - A1 course (via group course)
    prisma.user.update({
      where: { id: students[2].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[0].id }, // Испанский с нуля в группе
        },
      },
    }),
    // Dmitry Kozlov - A2 course (via intensive group)
    prisma.user.update({
      where: { id: students[3].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[1].id }, // Интенсив с нуля до A2
        },
      },
    }),
    // Maria Ivanova - A2 course (via intensive group)
    prisma.user.update({
      where: { id: students[4].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[1].id }, // Интенсив с нуля до A2
        },
      },
    }),
    // Alexander Smirnov - A1 course (via group course)
    prisma.user.update({
      where: { id: students[5].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[0].id }, // Испанский с нуля в группе
        },
      },
    }),
    // Olga Volkova - A2 course (via intensive group)
    prisma.user.update({
      where: { id: students[6].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[1].id }, // Интенсив с нуля до A2
        },
      },
    }),
    // Sergey Novikov - A2 course (via intensive group)
    prisma.user.update({
      where: { id: students[7].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[1].id }, // Интенсив с нуля до A2
        },
      },
    }),
    // Natalia Kuznetsova - A1 course (via group course)
    prisma.user.update({
      where: { id: students[8].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[0].id }, // Испанский с нуля в группе
        },
      },
    }),
    // Vladimir Sokolov - A2 course (via intensive group)
    prisma.user.update({
      where: { id: students[9].id },
      data: {
        enrolledCourses: {
          connect: { id: courses[1].id }, // Интенсив с нуля до A2
        },
      },
    }),
  ]);

  console.log("✅ Course enrollments created:", enrollments.length);

  // Create upcoming lessons for different groups
  console.log("Creating upcoming lessons...");
  const upcomingLessons = await Promise.all([
    // A1 Morning Group - Upcoming lessons (synchronized with completed lessons)
    prisma.lesson.create({
      data: {
        title: "Город и транспорт",
        description: "Изучаем названия мест в городе, направления, транспорт",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        startTime: "10:00",
        endTime: "11:00",
        duration: 60,
        isActive: true,
        meetingLink: "https://zoom.us/j/123456789",
        notes: "Практика с картой города",
        materials: [
          "https://example.com/city_vocabulary.pdf",
          "https://example.com/transport_audio.mp3",
        ],
        teacherId: teachers[0].id,
        groupId: groups[0].id, // A1 morning group
        topicId: topics[3].id, // "Город и транспорт" - matches nextTopicId from last completed lesson
        lessonType: "GROUP",
        status: "SCHEDULED",
      },
    }),
    prisma.lesson.create({
      data: {
        title: "Время и расписание",
        description:
          "Изучаем как говорить о времени, расписании, планировать встречи",
        date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
        startTime: "10:00",
        endTime: "11:00",
        duration: 60,
        isActive: true,
        meetingLink: "https://zoom.us/j/987654321",
        notes: "Студенты должны принести свое расписание",
        materials: [
          "https://example.com/time_vocabulary.pdf",
          "https://example.com/schedule_exercises.pdf",
        ],
        teacherId: teachers[0].id,
        groupId: groups[0].id, // A1 morning group
        topicId: topics[4].id, // "Время и расписание" - next topic after "Город и транспорт"
        lessonType: "GROUP",
        status: "SCHEDULED",
      },
    }),

    // A1 Evening Group - Upcoming lessons (synchronized with completed lessons)
    prisma.lesson.create({
      data: {
        title: "Семья и друзья",
        description:
          "Изучаем названия членов семьи, глагол 'tener' и притяжательные местоимения",
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        startTime: "20:00",
        endTime: "21:00",
        duration: 60,
        isActive: true,
        meetingLink: "https://zoom.us/j/456789123",
        notes: "Практика произношения с аудио материалами",
        materials: [
          "https://example.com/family_vocabulary.pdf",
          "https://example.com/grammar_exercises.pdf",
        ],
        teacherId: teachers[0].id,
        groupId: groups[1].id, // A1 evening group
        topicId: topics[1].id, // "Семья и друзья" - matches nextTopicId from last completed lesson
        lessonType: "GROUP",
        status: "SCHEDULED",
      },
    }),

    // A2 Group - Upcoming lessons
    prisma.lesson.create({
      data: {
        title: "Путешествия и транспорт",
        description: "Лексика для аэропорта, отеля, покупки билетов",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        startTime: "19:00",
        endTime: "20:00",
        duration: 60,
        isActive: true,
        meetingLink: "https://zoom.us/j/789123456",
        notes: "Подготовить диалоги для ролевых игр",
        materials: [
          "https://example.com/travel_vocabulary.pdf",
          "https://example.com/dialogues.pdf",
        ],
        teacherId: teachers[0].id,
        groupId: groups[2].id, // A2 group
        topicId: topics[5].id, // "Путешествия"
        lessonType: "GROUP",
        status: "SCHEDULED",
      },
    }),

    // B1 Group - Upcoming lessons
    prisma.lesson.create({
      data: {
        title: "Деловые переговоры",
        description:
          "Формальный стиль общения, деловая лексика, проведение переговоров",
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        startTime: "18:00",
        endTime: "19:00",
        duration: 60,
        isActive: true,
        meetingLink: "https://zoom.us/j/321654987",
        notes: "Студенты должны подготовить презентацию своей компании",
        materials: [
          "https://example.com/business_communication.pdf",
          "https://example.com/negotiation_skills.pdf",
        ],
        teacherId: teachers[1].id,
        groupId: groups[3].id, // B1 group
        topicId: topics[8].id, // "Деловая коммуникация"
        lessonType: "GROUP",
        status: "SCHEDULED",
      },
    }),

    // B2 Group - Upcoming lessons
    prisma.lesson.create({
      data: {
        title: "Подготовка к DELE B2 - Грамматика",
        description:
          "Сложные грамматические конструкции, Subjuntivo, условные предложения",
        date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        startTime: "15:00",
        endTime: "16:00",
        duration: 60,
        isActive: true,
        meetingLink: "https://zoom.us/j/654321789",
        notes: "Тест по грамматике в начале урока",
        materials: [
          "https://example.com/grammar_test.pdf",
          "https://example.com/subjuntivo_exercises.pdf",
        ],
        teacherId: teachers[1].id,
        groupId: groups[4].id, // B2 group
        topicId: topics[10].id, // "Сложная грамматика"
        lessonType: "GROUP",
        status: "SCHEDULED",
      },
    }),

    // Individual lessons
    prisma.lesson.create({
      data: {
        title: "Индивидуальная практика разговорной речи",
        description:
          "Персональный урок по развитию беглости речи и произношения",
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        startTime: "16:00",
        endTime: "17:00",
        duration: 60,
        isActive: true,
        meetingLink: "https://zoom.us/j/111222333",
        notes: "Фокус на произношении и беглости речи",
        materials: [
          "https://example.com/conversation_topics.pdf",
          "https://example.com/pronunciation_exercises.pdf",
        ],
        teacherId: teachers[0].id,
        groupId: null, // Individual lesson
        topicId: null, // No specific topic for individual lessons
        lessonType: "INDIVIDUAL",
        status: "SCHEDULED",
      },
    }),
  ]);

  console.log("✅ Upcoming lessons created:", upcomingLessons.length);

  // Create sample attachments for lessons (now using lessonId instead of recordingId)
  const attachments = await Promise.all([
    // A1 Morning Group Attachments
    prisma.attachment.create({
      data: {
        filename: "a1_greetings_worksheet.pdf",
        originalName: "a1_greetings_worksheet.pdf",
        mimeType: "application/pdf",
        size: 512000,
        path: "/uploads/a1_greetings_worksheet.pdf",
        lessonId: upcomingLessons[0].id, // A1 lesson
      },
    }),
    prisma.attachment.create({
      data: {
        filename: "a1_family_vocabulary.pdf",
        originalName: "a1_family_vocabulary.pdf",
        mimeType: "application/pdf",
        size: 768000,
        path: "/uploads/a1_family_vocabulary.pdf",
        lessonId: upcomingLessons[1].id, // A1 lesson
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
        lessonId: upcomingLessons[3].id, // A2 lesson
      },
    }),
    prisma.attachment.create({
      data: {
        filename: "a2_past_tense_exercises.pdf",
        originalName: "a2_past_tense_exercises.pdf",
        mimeType: "application/pdf",
        size: 512000,
        path: "/uploads/a2_past_tense_exercises.pdf",
        lessonId: upcomingLessons[3].id, // A2 lesson
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
        lessonId: upcomingLessons[4].id, // B1 lesson
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
        lessonId: upcomingLessons[5].id, // B2 lesson
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
        lessonId: upcomingLessons[6].id, // C1 lesson
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
        lessonId: upcomingLessons[0].id, // A1 lesson
      },
    }),
    prisma.lessonFeedback.create({
      data: {
        rating: 4,
        comment:
          "Хороший урок, но хотелось бы больше практики разговорной речи.",
        isAnonymous: false,
        studentId: students[1].id, // Mikhail Petrov
        lessonId: upcomingLessons[3].id, // A2 lesson
      },
    }),
    prisma.lessonFeedback.create({
      data: {
        rating: 5,
        comment:
          "Превосходно! Очень понравилась структура урока и объяснение грамматики.",
        isAnonymous: true,
        studentId: students[2].id, // Anna Sidorova
        lessonId: upcomingLessons[1].id, // A1 lesson
      },
    }),
    prisma.lessonFeedback.create({
      data: {
        rating: 4,
        comment: "Интересный материал, но темп немного быстрый для меня.",
        isAnonymous: false,
        studentId: students[3].id, // Dmitry Kozlov
        lessonId: upcomingLessons[4].id, // B1 lesson
      },
    }),
    prisma.lessonFeedback.create({
      data: {
        rating: 5,
        comment:
          "Отличный урок! Много полезной информации для подготовки к экзамену.",
        isAnonymous: true,
        studentId: students[4].id, // Maria Ivanova
        lessonId: upcomingLessons[2].id, // A2 lesson
      },
    }),
    prisma.lessonFeedback.create({
      data: {
        rating: 5,
        comment:
          "Профессиональный подход к обучению. Очень доволен качеством материала.",
        isAnonymous: false,
        studentId: students[6].id, // Olga Volkova
        lessonId: upcomingLessons[5].id, // C1 lesson
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
        lessonId: upcomingLessons[0].id,
        studentId: students[2].id, // Anna Sidorova
        status: "PRESENT",
        notes: "Активно участвовала в уроке",
      },
    }),
    prisma.lessonAttendance.create({
      data: {
        lessonId: upcomingLessons[0].id,
        studentId: students[8].id, // Natalia Kuznetsova
        status: "PRESENT",
        notes: "Хорошо справилась с заданиями",
      },
    }),

    // A2 Group Attendance
    prisma.lessonAttendance.create({
      data: {
        lessonId: upcomingLessons[2].id,
        studentId: students[0].id, // Elena Garcia
        status: "PRESENT",
        notes: "Отличная работа на уроке",
      },
    }),
    prisma.lessonAttendance.create({
      data: {
        lessonId: upcomingLessons[2].id,
        studentId: students[4].id, // Maria Ivanova
        status: "LATE",
        notes: "Опоздала на 10 минут",
      },
    }),

    // B1 Group Attendance
    prisma.lessonAttendance.create({
      data: {
        lessonId: upcomingLessons[4].id,
        studentId: students[1].id, // Mikhail Petrov
        status: "PRESENT",
        notes: "Активно участвовал в дискуссии",
      },
    }),
    prisma.lessonAttendance.create({
      data: {
        lessonId: upcomingLessons[4].id,
        studentId: students[7].id, // Sergey Novikov
        status: "ABSENT",
        notes: "По семейным обстоятельствам",
      },
    }),
  ]);

  console.log("✅ Attendance records created:", attendanceRecords.length);

  // Create completed lessons with next topic information to demonstrate progress tracking
  console.log("Creating completed lessons with next topics...");
  const completedLessons = await Promise.all([
    // Интенсив 10010925 - Completed lessons showing progress
    prisma.lesson.create({
      data: {
        title: "1А: алфавит и правила чтения",
        description: "Изучили испанский алфавит, правила произношения и чтения",
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        startTime: "19:00",
        endTime: "21:00",
        duration: 120,
        isActive: true,
        youtubeLink: "https://youtube.com/watch?v=abc123",
        transcript:
          "Полная расшифровка урока по теме '1А: алфавит и правила чтения'",
        isPublished: true,
        viewCount: 45,
        averageRating: 4.8,
        totalFeedback: 6,
        teacherId: teachers[0].id,
        groupId: groups[0].id, // Интенсив 10010925
        topicId: topics[0].id, // "1А: алфавит и правила чтения"
        nextTopicId: topics[1].id, // "1B: приветствие, цифры" - next topic
        lessonType: "GROUP",
        status: "COMPLETED",
      },
    }),
    prisma.lesson.create({
      data: {
        title: "1B: приветствие, цифры",
        description:
          "Изучили базовые приветствия, представления и числа от 1 до 100",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        startTime: "19:00",
        endTime: "21:00",
        duration: 120,
        isActive: true,
        youtubeLink: "https://youtube.com/watch?v=def456",
        transcript: "Полная расшифровка урока по теме '1B: приветствие, цифры'",
        isPublished: true,
        viewCount: 38,
        averageRating: 4.9,
        totalFeedback: 6,
        teacherId: teachers[0].id,
        groupId: groups[0].id, // Интенсив 10010925
        topicId: topics[1].id, // "1B: приветствие, цифры"
        nextTopicId: topics[2].id, // "1С: являться и находиться" - next topic
        lessonType: "GROUP",
        status: "COMPLETED",
      },
    }),
    prisma.lesson.create({
      data: {
        title: "1С: являться и находиться",
        description:
          "Изучили глаголы ser и estar - основные различия и использование",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        startTime: "19:00",
        endTime: "21:00",
        duration: 120,
        isActive: true,
        youtubeLink: "https://youtube.com/watch?v=ghi789",
        transcript:
          "Полная расшифровка урока по теме '1С: являться и находиться'",
        isPublished: true,
        viewCount: 22,
        averageRating: 4.7,
        totalFeedback: 6,
        teacherId: teachers[0].id,
        groupId: groups[0].id, // Интенсив 10010925
        topicId: topics[2].id, // "1С: являться и находиться"
        nextTopicId: topics[3].id, // "1D: артикль, род и множественное число" - next topic
        lessonType: "GROUP",
        status: "COMPLETED",
      },
    }),

    // Интенсив 19210825 - Completed lessons showing progress
    prisma.lesson.create({
      data: {
        title: "1А: алфавит и правила чтения",
        description: "Изучили испанский алфавит, правила произношения и чтения",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        startTime: "18:00",
        endTime: "20:00",
        duration: 120,
        isActive: true,
        youtubeLink: "https://youtube.com/watch?v=jkl012",
        transcript:
          "Полная расшифровка урока по теме '1А: алфавит и правила чтения'",
        isPublished: true,
        viewCount: 52,
        averageRating: 4.6,
        totalFeedback: 8,
        teacherId: teachers[0].id,
        groupId: groups[1].id, // Интенсив 19210825
        topicId: topics[24].id, // "1А: алфавит и правила чтения" from intensive course
        nextTopicId: topics[25].id, // "1B: приветствие, цифры" - next topic
        lessonType: "GROUP",
        status: "COMPLETED",
      },
    }),

    // Группа 20020925 - Completed lessons showing progress
    prisma.lesson.create({
      data: {
        title: "1А: алфавит и правила чтения",
        description: "Изучили испанский алфавит, правила произношения и чтения",
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        startTime: "18:00",
        endTime: "20:00",
        duration: 120,
        isActive: true,
        youtubeLink: "https://youtube.com/watch?v=mno345",
        transcript:
          "Полная расшифровка урока по теме '1А: алфавит и правила чтения'",
        isPublished: true,
        viewCount: 48,
        averageRating: 4.8,
        totalFeedback: 7,
        teacherId: teachers[0].id,
        groupId: groups[6].id, // Группа 20020925
        topicId: topics[0].id, // "1А: алфавит и правила чтения" from group course
        nextTopicId: topics[1].id, // "1B: приветствие, цифры" - next topic
        lessonType: "GROUP",
        status: "COMPLETED",
      },
    }),
  ]);

  console.log(
    "✅ Completed lessons with next topics created:",
    completedLessons.length,
  );

  // Create feedback for completed lessons
  console.log("Creating feedback for completed lessons...");
  const completedLessonFeedbacks = await Promise.all([
    // Интенсив 10010925 - Feedback for completed lessons
    prisma.lessonFeedback.create({
      data: {
        rating: 5,
        comment: "Алфавит и правила чтения - отличное начало!",
        isAnonymous: false,
        studentId: students[0].id, // Elena Garcia
        lessonId: completedLessons[0].id, // "1А: алфавит и правила чтения"
      },
    }),
    prisma.lessonFeedback.create({
      data: {
        rating: 4,
        comment: "Приветствие и цифры - понятно объяснили.",
        isAnonymous: false,
        studentId: students[4].id, // Maria Ivanova
        lessonId: completedLessons[1].id, // "1B: приветствие, цифры"
      },
    }),
    prisma.lessonFeedback.create({
      data: {
        rating: 5,
        comment: "Ser и estar - теперь все ясно!",
        isAnonymous: false,
        studentId: students[0].id, // Elena Garcia
        lessonId: completedLessons[2].id, // "1С: являться и находиться"
      },
    }),

    // Интенсив 19210825 - Feedback for completed lessons
    prisma.lessonFeedback.create({
      data: {
        rating: 4,
        comment: "Алфавит и правила чтения - хорошая основа.",
        isAnonymous: false,
        studentId: students[1].id, // Mikhail Petrov
        lessonId: completedLessons[3].id, // "1А: алфавит и правила чтения"
      },
    }),

    // Группа 20020925 - Feedback for completed lessons
    prisma.lessonFeedback.create({
      data: {
        rating: 5,
        comment: "Алфавит и правила чтения - отличный урок!",
        isAnonymous: false,
        studentId: students[2].id, // Anna Sidorova
        lessonId: completedLessons[4].id, // "1А: алфавит и правила чтения"
      },
    }),
  ]);

  console.log(
    "✅ Feedback for completed lessons created:",
    completedLessonFeedbacks.length,
  );

  // Create attendance records for completed lessons
  console.log("Creating attendance for completed lessons...");
  const completedLessonAttendance = await Promise.all([
    // Интенсив 10010925 - Attendance for completed lessons
    prisma.lessonAttendance.create({
      data: {
        lessonId: completedLessons[0].id, // "1А: алфавит и правила чтения"
        studentId: students[0].id, // Elena Garcia
        status: "PRESENT",
        notes: "Активно участвовала в уроке",
      },
    }),
    prisma.lessonAttendance.create({
      data: {
        lessonId: completedLessons[0].id, // "1А: алфавит и правила чтения"
        studentId: students[4].id, // Maria Ivanova
        status: "PRESENT",
        notes: "Хорошо справилась с заданиями",
      },
    }),
    prisma.lessonAttendance.create({
      data: {
        lessonId: completedLessons[1].id, // "1B: приветствие, цифры"
        studentId: students[0].id, // Elena Garcia
        status: "PRESENT",
        notes: "Отличная работа с лексикой",
      },
    }),
    prisma.lessonAttendance.create({
      data: {
        lessonId: completedLessons[1].id, // "1B: приветствие, цифры"
        studentId: students[4].id, // Maria Ivanova
        status: "PRESENT",
        notes: "Хорошо усвоила грамматику",
      },
    }),

    // Интенсив 19210825 - Attendance for completed lessons
    prisma.lessonAttendance.create({
      data: {
        lessonId: completedLessons[3].id, // "1А: алфавит и правила чтения"
        studentId: students[1].id, // Mikhail Petrov
        status: "PRESENT",
        notes: "Отлично справился с произношением",
      },
    }),

    // Группа 20020925 - Attendance for completed lessons
    prisma.lessonAttendance.create({
      data: {
        lessonId: completedLessons[4].id, // "1А: алфавит и правила чтения"
        studentId: students[2].id, // Anna Sidorova
        status: "PRESENT",
        notes: "Хорошо усвоила правила чтения",
      },
    }),
  ]);

  console.log(
    "✅ Attendance for completed lessons created:",
    completedLessonAttendance.length,
  );

  console.log("🎉 Database seeding completed successfully!");

  console.log("\n📋 Test Accounts:");
  console.log("Admin Email:", admin.email);
  console.log("Teacher 1 Email:", teachers[0].email);
  console.log("Teacher 2 Email:", teachers[1].email);
  console.log("Teacher 3 Email:", teachers[2].email);
  console.log("Password: password123");

  console.log("\n📚 Courses Available:");
  console.log("- Испанский с нуля в группе (24 topics)");
  console.log("- Интенсив с нуля до A2 (24 topics)");
  console.log("- Испанский с нуля индивидуально (24 topics)");

  console.log("\n👥 Groups Created:");
  console.log(
    "- 6 Интенсив groups (Интенсив 10010925, Интенсив 19210825, etc.)",
  );
  console.log(
    "- 3 Группа groups (Группа 20020925, Группа 10100925, Группа 10050825)",
  );

  console.log("\n📊 Progress Tracking Demo:");
  console.log("- Интенсив 10010925: 3/24 topics completed (12.5% progress)");
  console.log("  • Last studied: '1С: являться и находиться'");
  console.log("  • Next topic: '1D: артикль, род и множественное число'");
  console.log("- Интенсив 19210825: 1/24 topics completed (4.2% progress)");
  console.log("  • Last studied: '1А: алфавит и правила чтения'");
  console.log("  • Next topic: '1B: приветствие, цифры'");
  console.log("- Группа 20020925: 1/24 topics completed (4.2% progress)");
  console.log("  • Last studied: '1А: алфавит и правила чтения'");
  console.log("  • Next topic: '1B: приветствие, цифры'");

  console.log("\n🎯 What You'll See:");
  console.log("• Course cards showing real progress percentages");
  console.log("• 'Следующий урок' displaying actual topic names");
  console.log("• 'Последняя тема' showing recently completed topics");
  console.log("• Progress bars reflecting real topic completion");
  console.log("• All groups using real school naming convention");
  console.log("• Consistent topic structure across all courses");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
