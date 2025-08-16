// ✅ FIXED: Added textValue prop to all SelectItems in modal to match working "уровень" Select pattern
// ✅ FIXED: Updated all Select components and inputs to use consistent font-medium text weight
// ✅ FIXED: Updated "текущие продукты" section to use font-medium (500+) instead of lighter weights
"use client";

import { Avatar } from "@heroui/avatar";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Checkbox } from "@heroui/checkbox";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { useDisclosure } from "@heroui/use-disclosure";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";

import { useAuth } from "@/lib/auth/context";
import { ProtectedRoute } from "@/components/protected-route";
import { apiClient } from "@/lib/utils/api";
import { LEVEL_OPTIONS } from "@/lib/constants/levels";
import { User as UserType, Group, StudentProduct } from "@/types";

interface UserWithStats extends UserType {
  averageRating?: number;
  totalFeedbacks?: number;
  lastActiveDate?: string;
  group?: Group;
  groups?: Group[];
  courses?: any[];
  products?: StudentProduct[];
}

export default function UserEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  // Product management state
  const {
    isOpen: isAddingProduct,
    onOpen: onAddProductOpen,
    onOpenChange: onAddProductOpenChange,
  } = useDisclosure();
  const [newProduct, setNewProduct] = useState({
    type: "GROUP" as "GROUP" | "COURSE" | "INDIVIDUAL",
    groupId: "",
    courseId: "",
    teacherId: "",
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
          (u: UserWithStats) => u.role === "TEACHER" && u.isActive,
        );

        setTeachers(teachersList);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setMessage({ type: "error", text: "Ошибка загрузки данных" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveUser = async () => {
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      // Prepare the primary group (first selected group)
      const primaryGroupId =
        user.groups && user.groups.length > 0 ? user.groups[0].id : undefined;

      // Prepare course IDs for API
      const courseIds = user.courses?.map((c: any) => c.id) || [];

      // Update user via API
      await apiClient.updateUser({
        id: user.id,
        firstName: user.name.split(" ")[0],
        lastName: user.name.split(" ").slice(1).join(" "),
        email: user.email,
        role: user.role,
        groupId: primaryGroupId,
        level: user.level,
        isActive: user.isActive,
        courseIds: courseIds,
      });

      setMessage({ type: "success", text: "Пользователь успешно обновлен!" });
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage({ type: "error", text: "Ошибка при обновлении пользователя" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProduct = async () => {
    if (!user) return;

    try {
      let productData: any = {};

      switch (newProduct.type) {
        case "GROUP":
          if (!newProduct.groupId) {
            setMessage({ type: "error", text: "Выберите группу" });

            return;
          }
          // For groups, we don't need courseId since groups are already linked to courses
          productData = {
            type: "GROUP",
            groupId: newProduct.groupId,
          };
          break;

        case "COURSE":
          if (!newProduct.courseId) {
            setMessage({ type: "error", text: "Выберите курс" });

            return;
          }
          productData = {
            type: "COURSE",
            courseId: newProduct.courseId,
          };
          break;

        case "INDIVIDUAL":
          if (!newProduct.teacherId || !newProduct.courseId) {
            setMessage({
              type: "error",
              text: "Выберите преподавателя и курс",
            });

            return;
          }
          productData = {
            type: "INDIVIDUAL",
            teacherId: newProduct.teacherId,
            courseId: newProduct.courseId,
          };
          break;
      }

      // Create the product object based on type
      let newProductToAdd: any = {
        id: `temp-${Date.now()}`, // Temporary ID for UI
        product: {
          id: `product-${Date.now()}`,
          type: productData.type,
          name: (() => {
            switch (productData.type) {
              case "GROUP":
                const group = groups.find((g) => g.id === productData.groupId);

                return group ? group.name : "Неизвестная группа";
              case "COURSE":
                const course = courses.find(
                  (c) => c.id === productData.courseId,
                );

                return course ? course.name : "Неизвестный курс";
              case "INDIVIDUAL":
                const teacher = teachers.find(
                  (t) => t.id === productData.teacherId,
                );
                const courseForIndividual = courses.find(
                  (c) => c.id === productData.courseId,
                );

                return teacher && courseForIndividual
                  ? `Индивидуальные занятия с ${teacher.name} - ${courseForIndividual.name}`
                  : "Индивидуальные занятия";
              default:
                return "Неизвестный продукт";
            }
          })(),
          description: "",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Product-specific data
          ...(productData.type === "GROUP" && {
            groupProduct: {
              groupId: productData.groupId,
              group: groups.find((g) => g.id === productData.groupId),
              teacherId:
                groups.find((g) => g.id === productData.groupId)?.teacherId ||
                "",
              teacher: teachers.find(
                (t) =>
                  t.id ===
                  groups.find((g) => g.id === productData.groupId)?.teacherId,
              ),
              courseId:
                groups.find((g) => g.id === productData.groupId)?.courseId ||
                "",
              course: groups.find((g) => g.id === productData.groupId)?.course,
            },
          }),
          ...(productData.type === "COURSE" && {
            courseProduct: {
              courseId: productData.courseId,
              course: courses.find((c) => c.id === productData.courseId),
            },
          }),
          ...(productData.type === "INDIVIDUAL" && {
            individualProduct: {
              teacherId: productData.teacherId,
              teacher: teachers.find((t) => t.id === productData.teacherId),
              courseId: productData.courseId,
              course: courses.find((c) => c.id === productData.courseId),
            },
          }),
        },
        enrolledAt: new Date().toISOString(),
      };

      // Add the product to the user's products array
      const updatedUser = { ...user };

      if (!updatedUser.products) {
        updatedUser.products = [];
      }
      updatedUser.products.push(newProductToAdd);
      setUser(updatedUser);

      // Reset form
      setNewProduct({
        type: "GROUP",
        groupId: "",
        courseId: "",
        teacherId: "",
      });

      // Create the product first
      const productResponse = await apiClient.createProduct({
        type: productData.type,
        name: newProductToAdd.product.name,
        description: newProductToAdd.product.description,
        groupId: productData.groupId,
        courseId: productData.courseId,
        teacherId: productData.teacherId,
      });

      if (productResponse.error) {
        throw new Error(productResponse.error);
      }

      if (!productResponse.data) {
        throw new Error("Failed to create product");
      }

      // Type assertion since we know the structure from our API
      const createdProduct = productResponse.data as { id: string };

      // Then enroll the student in the product
      const enrollmentResponse = await apiClient.enrollStudentInProduct({
        studentId: user.id,
        productId: createdProduct.id,
      });

      if (enrollmentResponse.error) {
        // If enrollment fails, we should ideally delete the created product
        throw new Error(enrollmentResponse.error);
      }

      setMessage({ type: "success", text: "Продукт успешно добавлен!" });

      // Reload user data to get the latest products
      await loadData();
    } catch (error) {
      console.error("Error adding product:", error);
      setMessage({ type: "error", text: "Ошибка при добавлении продукта" });
    }
  };

  const handleRemoveProduct = async (enrollmentId: string) => {
    if (!user) return;

    try {
      // Call API to remove the enrollment
      const response = await apiClient.removeStudentFromProduct(enrollmentId);

      if (response.error) {
        throw new Error(response.error);
      }

      setMessage({ type: "success", text: "Продукт успешно удален!" });

      // Reload user data to get the latest products
      await loadData();
    } catch (error) {
      console.error("Error removing product:", error);
      setMessage({ type: "error", text: "Ошибка при удалении продукта" });
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
        {/* Hero Section */}
        <div className="pt-12 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              isIconOnly
              className="p-3 hover:bg-slate-100 rounded-xl transition-colors"
              variant="light"
              onClick={() => router.back()}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </Button>
            <div>
              <h1 className="text-5xl font-bold text-black tracking-tight">
                Редактирование пользователя 👤
              </h1>
              <p className="text-black/70 text-xl font-medium mt-2">
                Управление профилем и продуктами пользователя
              </p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-8 p-6 rounded-2xl border ${
              message.type === "success"
                ? "bg-green-50 border-green-200/60 text-green-700"
                : "bg-red-50 border-red-200/60 text-red-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  message.type === "success" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {message.type === "success" ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                )}
              </div>
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gradient-to-br from-[#007EFB]/5 via-[#EE7A3F]/5 to-[#FDD130]/5 border border-[#007EFB]/20 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#007EFB]/10 to-[#EE7A3F]/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#007EFB]/10 rounded-2xl">
                    <svg
                      className="w-7 h-7 text-[#007EFB]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-bold text-3xl text-black">
                      Основная информация
                    </h2>
                    <p className="text-black/70 font-medium text-base">
                      Личные данные пользователя
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <Avatar
                    className="text-white bg-[#007EFB] border-2 border-white"
                    name={user.name}
                    size="lg"
                    src={user.avatar}
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-black">{user.name}</h3>
                  <Chip
                    color={
                      user.role === "ADMIN"
                        ? "danger"
                        : user.role === "TEACHER"
                          ? "primary"
                          : "secondary"
                    }
                    size="sm"
                    variant="flat"
                  >
                    {user.role === "ADMIN"
                      ? "Администратор"
                      : user.role === "TEACHER"
                        ? "Преподаватель"
                        : "Студент"}
                  </Chip>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  classNames={{
                    label: "font-bold text-black",
                    input: "font-medium text-black",
                    inputWrapper:
                      "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                  }}
                  label="Имя"
                  placeholder="Введите имя"
                  value={formData.name}
                  variant="bordered"
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                <Input
                  classNames={{
                    label: "font-bold text-black",
                    input: "font-medium text-black",
                    inputWrapper:
                      "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                  }}
                  label="Email"
                  placeholder="you@tutorium.io"
                  type="email"
                  value={formData.email}
                  variant="bordered"
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                <Select
                  classNames={{
                    label: "font-bold text-black",
                    trigger:
                      "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                    value: "font-medium text-black",
                  }}
                  label="Роль"
                  selectedKeys={[formData.role]}
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const selectedRole = Array.from(keys)[0] as
                      | "ADMIN"
                      | "TEACHER"
                      | "STUDENT";

                    handleInputChange("role", selectedRole);
                  }}
                >
                  <SelectItem key="ADMIN">Администратор</SelectItem>
                  <SelectItem key="TEACHER">Преподаватель</SelectItem>
                  <SelectItem key="STUDENT">Студент</SelectItem>
                </Select>

                {formData.role === "STUDENT" && (
                  <Select
                    classNames={{
                      label: "font-bold text-black",
                      trigger:
                        "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                      value: "font-medium text-black",
                    }}
                    label="Уровень"
                    placeholder="Выберите уровень"
                    selectedKeys={formData.level ? [formData.level] : []}
                    variant="bordered"
                    onSelectionChange={(keys) => {
                      const selectedLevel = Array.from(keys)[0] as string;

                      handleInputChange("level", selectedLevel);
                    }}
                  >
                    {LEVEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} textValue={option.label}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}

                <div className="flex items-center gap-3 md:col-span-2">
                  <Checkbox
                    classNames={{
                      label: "font-medium text-black",
                    }}
                    isSelected={formData.isActive}
                    onValueChange={(checked) =>
                      handleInputChange("isActive", checked)
                    }
                  >
                    Активный пользователь
                  </Checkbox>
                </div>
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

          {/* Product Management */}
          {formData.role === "STUDENT" && (
            <div className="bg-gradient-to-br from-[#00B67A]/5 via-[#007EFB]/5 to-[#EE7A3F]/5 border border-[#00B67A]/20 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00B67A]/10 to-[#007EFB]/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#00B67A]/10 rounded-2xl">
                      <svg
                        className="w-7 h-7 text-[#00B67A]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-bold text-3xl text-black">
                        Управление продуктами
                      </h2>
                      <p className="text-black/70 font-medium text-base">
                        Курсы, группы и индивидуальные занятия
                      </p>
                    </div>
                  </div>
                  <Button
                    className="font-bold text-white bg-[#00B67A] hover:bg-[#00B67A]/90 px-8"
                    size="lg"
                    onPress={() => {
                      // Reset form when opening modal
                      setNewProduct({
                        type: "GROUP",
                        groupId: "",
                        courseId: "",
                        teacherId: "",
                      });
                      onAddProductOpen();
                    }}
                  >
                    Добавить продукт
                  </Button>
                </div>
                {/* Current Products */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-black mb-4">
                    Текущие продукты
                  </h3>
                  {user.products && user.products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {user.products.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Chip
                              color={
                                product.product.type === "GROUP"
                                  ? "primary"
                                  : product.product.type === "COURSE"
                                    ? "success"
                                    : "warning"
                              }
                              size="sm"
                              variant="flat"
                            >
                              {product.product.type === "GROUP"
                                ? "Группа"
                                : product.product.type === "COURSE"
                                  ? "Курс"
                                  : "Индивидуально"}
                            </Chip>
                            <Button
                              color="danger"
                              size="sm"
                              variant="light"
                              onClick={() => handleRemoveProduct(product.id)}
                            >
                              Удалить
                            </Button>
                          </div>

                          <h4 className="font-semibold text-black mb-2">
                            {product.product.name}
                          </h4>

                          {product.product.type === "GROUP" &&
                            product.product.groupProduct && (
                              <div className="text-base font-medium text-slate-700">
                                <p>
                                  Группа:{" "}
                                  {product.product.groupProduct.group?.name ||
                                    "Неизвестная группа"}
                                </p>
                                <p>
                                  Курс:{" "}
                                  {product.product.groupProduct.course?.name ||
                                    "Курс не назначен"}
                                </p>
                              </div>
                            )}

                          {product.product.type === "COURSE" &&
                            product.product.courseProduct && (
                              <div className="text-base font-medium text-slate-700">
                                <p>
                                  Курс:{" "}
                                  {product.product.courseProduct.course?.name ||
                                    "Неизвестный курс"}
                                </p>
                                <p>
                                  Уровень:{" "}
                                  {product.product.courseProduct.course
                                    ?.level || "Неизвестный уровень"}
                                </p>
                              </div>
                            )}

                          {product.product.type === "INDIVIDUAL" &&
                            product.product.individualProduct && (
                              <div className="text-base font-medium text-slate-700">
                                <p>
                                  Преподаватель:{" "}
                                  {product.product.individualProduct.teacher
                                    ?.name || "Неизвестный преподаватель"}
                                </p>
                                <p>
                                  Курс:{" "}
                                  {product.product.individualProduct.course
                                    ?.name || "Неизвестный курс"}
                                </p>
                              </div>
                            )}

                          <div className="mt-3 text-sm font-medium text-slate-600">
                            Добавлен:{" "}
                            {new Date(product.enrolledAt).toLocaleDateString(
                              "ru-RU",
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl">
                      <p className="text-slate-600 font-medium">
                        У пользователя пока нет продуктов
                      </p>
                    </div>
                  )}
                </div>

                {/* Add Product Modal */}
                <Modal
                  classNames={{
                    base: "bg-white",
                    header: "border-b border-slate-200/60 pb-6",
                    body: "py-8",
                    footer: "border-t border-slate-200/60 pt-6",
                  }}
                  isOpen={isAddingProduct}
                  placement="top-center"
                  size="2xl"
                  onOpenChange={onAddProductOpenChange}
                >
                  <ModalContent>
                    {(onClose) => (
                      <>
                        <ModalHeader className="flex flex-col gap-1">
                          <h3 className="text-2xl font-bold text-black">
                            Добавить продукт
                          </h3>
                          <p className="text-sm text-black/70 font-medium">
                            Выберите тип продукта и заполните необходимые поля
                          </p>
                        </ModalHeader>
                        <ModalBody>
                          <div className="space-y-8 py-4">
                            <Select
                              classNames={{
                                label: "font-bold text-black",
                                trigger:
                                  "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                                value: "font-medium text-black",
                              }}
                              label="Тип продукта"
                              selectedKeys={[newProduct.type]}
                              variant="bordered"
                              onSelectionChange={(keys) => {
                                const selectedType = Array.from(keys)[0] as
                                  | "GROUP"
                                  | "COURSE"
                                  | "INDIVIDUAL";

                                // Reset other fields when type changes
                                setNewProduct({
                                  type: selectedType,
                                  groupId: "",
                                  courseId: "",
                                  teacherId: "",
                                });
                              }}
                            >
                              <SelectItem key="GROUP" textValue="Группа">
                                Группа
                              </SelectItem>
                              <SelectItem key="COURSE" textValue="Курс">
                                Курс
                              </SelectItem>
                              <SelectItem
                                key="INDIVIDUAL"
                                textValue="Индивидуальные занятия"
                              >
                                Индивидуальные занятия
                              </SelectItem>
                            </Select>

                            {/* Course selection is only required for COURSE and INDIVIDUAL types */}
                            {(newProduct.type === "COURSE" ||
                              newProduct.type === "INDIVIDUAL") && (
                              <Select
                                key={`course-${newProduct.type}`}
                                classNames={{
                                  label: "font-bold text-black",
                                  trigger:
                                    "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                                  value: "font-medium text-black",
                                }}
                                label="Курс"
                                placeholder="Выберите курс"
                                selectedKeys={
                                  newProduct.courseId
                                    ? [newProduct.courseId]
                                    : []
                                }
                                variant="bordered"
                                onSelectionChange={(keys) => {
                                  const selectedCourseId = Array.from(
                                    keys,
                                  )[0] as string;

                                  setNewProduct({
                                    ...newProduct,
                                    courseId: selectedCourseId || "",
                                  });
                                }}
                              >
                                {courses.map((course) => (
                                  <SelectItem
                                    key={course.id}
                                    textValue={`${course.name} (${course.level})`}
                                  >
                                    {course.name} ({course.level})
                                  </SelectItem>
                                ))}
                              </Select>
                            )}

                            {newProduct.type === "GROUP" && (
                              <Select
                                key="group-select"
                                classNames={{
                                  label: "font-bold text-black",
                                  trigger:
                                    "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                                  value: "font-medium text-black",
                                }}
                                label="Группа"
                                placeholder="Выберите группу"
                                selectedKeys={
                                  newProduct.groupId ? [newProduct.groupId] : []
                                }
                                variant="bordered"
                                onSelectionChange={(keys) => {
                                  const selectedGroupId = Array.from(
                                    keys,
                                  )[0] as string;

                                  setNewProduct({
                                    ...newProduct,
                                    groupId: selectedGroupId || "",
                                  });
                                }}
                              >
                                {groups.map((group) => (
                                  <SelectItem
                                    key={group.id}
                                    textValue={`${group.name} - ${group.course?.name || "Курс не назначен"}`}
                                  >
                                    {group.name} -{" "}
                                    {group.course?.name || "Курс не назначен"}
                                  </SelectItem>
                                ))}
                              </Select>
                            )}

                            {newProduct.type === "INDIVIDUAL" && (
                              <Select
                                key="teacher-select"
                                classNames={{
                                  label: "font-bold text-black",
                                  trigger:
                                    "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                                  value: "font-medium text-black",
                                }}
                                label="Преподаватель"
                                placeholder="Выберите преподавателя"
                                selectedKeys={
                                  newProduct.teacherId
                                    ? [newProduct.teacherId]
                                    : []
                                }
                                variant="bordered"
                                onSelectionChange={(keys) => {
                                  const selectedTeacherId = Array.from(
                                    keys,
                                  )[0] as string;

                                  setNewProduct({
                                    ...newProduct,
                                    teacherId: selectedTeacherId || "",
                                  });
                                }}
                              >
                                {teachers.map((teacher) => (
                                  <SelectItem
                                    key={teacher.id}
                                    textValue={`${teacher.name} (${teacher.email})`}
                                  >
                                    {teacher.name} ({teacher.email})
                                  </SelectItem>
                                ))}
                              </Select>
                            )}
                          </div>
                        </ModalBody>
                        <ModalFooter>
                          <Button
                            className="font-medium"
                            variant="light"
                            onPress={onClose}
                          >
                            Отмена
                          </Button>
                          <Button
                            className="font-bold text-white bg-[#00B67A] hover:bg-[#00B67A]/90"
                            onPress={() => {
                              handleAddProduct();
                              onClose();
                            }}
                          >
                            Добавить
                          </Button>
                        </ModalFooter>
                      </>
                    )}
                  </ModalContent>
                </Modal>
              </div>
            </div>
          )}

          {/* User Statistics */}
          <div className="bg-gradient-to-br from-[#FDD130]/5 via-[#EE7A3F]/5 to-[#007EFB]/5 border border-[#FDD130]/20 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FDD130]/10 to-[#EE7A3F]/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-[#FDD130]/10 rounded-2xl">
                  <svg
                    className="w-7 h-7 text-[#FDD130]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-3xl text-black">
                    Статистика пользователя
                  </h2>
                  <p className="text-black/70 font-medium text-base">
                    Активность и прогресс
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-white border border-[#007EFB]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#007EFB]/40 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#007EFB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-[#007EFB]/10 rounded-xl">
                        <svg
                          className="w-6 h-6 text-[#007EFB]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
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
                        <svg
                          className="w-6 h-6 text-[#00B67A]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
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
                        <svg
                          className="w-6 h-6 text-[#FDD130]"
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
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-black mb-1">
                      {new Date(user.createdAt).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
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
                        <svg
                          className="w-6 h-6 text-[#EE7A3F]"
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
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-black mb-1">
                      {new Date(
                        user.lastActiveDate || user.updatedAt,
                      ).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </div>
                    <div className="text-black font-medium text-base">
                      Активность
                    </div>
                    <div className="text-black/70 font-medium text-xs mt-1">
                      Последняя
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
