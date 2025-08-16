"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { useDisclosure } from "@heroui/use-disclosure";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

import { ProtectedRoute } from "@/components/protected-route";
import { apiClient } from "@/lib/utils/api";

interface Product {
  id: string;
  name: string;
  type: "GROUP" | "INDIVIDUAL_LESSONS" | "SELF_STUDY";
  description?: string;
  isActive: boolean;
  maxLessons?: number;
  validityDays?: number;
  price?: number;
  course: {
    id: string;
    name: string;
    level: string;
  };
  _count: {
    studentEnrollments: number;
  };
}

interface Course {
  id: string;
  name: string;
  level: string;
  description?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "GROUP" as const,
    description: "",
    courseId: "",
    maxLessons: "",
    validityDays: "",
    price: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsResponse, coursesResponse] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getCourses(),
      ]);

      if (productsResponse.error) {
        throw new Error(productsResponse.error);
      }

      if (coursesResponse.error) {
        throw new Error(coursesResponse.error);
      }

      setProducts((productsResponse.data as Product[]) || []);
      setCourses((coursesResponse.data as Course[]) || []);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await apiClient.createProduct({
        ...formData,
        maxLessons: formData.maxLessons ? parseInt(formData.maxLessons) : null,
        validityDays: formData.validityDays ? parseInt(formData.validityDays) : null,
        price: formData.price ? parseFloat(formData.price) : null,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Reset form and close modal
      setFormData({
        name: "",
        type: "GROUP",
        description: "",
        courseId: "",
        maxLessons: "",
        validityDays: "",
        price: "",
      });
      onClose();
      
      // Reload data
      await loadData();
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "GROUP":
        return "Группа";
      case "INDIVIDUAL_LESSONS":
        return "Индивидуальные уроки";
      case "SELF_STUDY":
        return "Самостоятельное изучение";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "GROUP":
        return "primary";
      case "INDIVIDUAL_LESSONS":
        return "secondary";
      case "SELF_STUDY":
        return "success";
      default:
        return "default";
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
            Error loading products
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button color="primary" onClick={loadData}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-white lg:ml-4 xl:ml-0">
        {/* Hero Section */}
        <div className="pt-12 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-black tracking-tight">
                Управление продуктами 🎯
              </h1>
              <p className="text-black/70 text-xl font-medium mt-2">
                Создавайте и управляйте различными типами продуктов обучения
              </p>
            </div>
            <Button
              color="primary"
              size="lg"
              onClick={onOpen}
              className="bg-[#007EFB] hover:bg-[#007EFB]/90"
            >
              + Создать продукт
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="border border-slate-200/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-black">
                    {product.name}
                  </h3>
                  <Chip
                    color={getTypeColor(product.type)}
                    size="sm"
                    variant="flat"
                  >
                    {getTypeLabel(product.type)}
                  </Chip>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-3">
                  {product.description && (
                    <p className="text-slate-600 text-sm">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Курс</span>
                    <span className="text-black font-medium">
                      {product.course.name} ({product.course.level})
                    </span>
                  </div>

                  {product.maxLessons && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 font-medium">Макс. уроков</span>
                      <span className="text-black font-medium">
                        {product.maxLessons}
                      </span>
                    </div>
                  )}

                  {product.validityDays && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 font-medium">Срок действия</span>
                      <span className="text-black font-medium">
                        {product.validityDays} дней
                      </span>
                    </div>
                  )}

                  {product.price && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 font-medium">Цена</span>
                      <span className="text-black font-medium">
                        {product.price} ₽
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Студентов</span>
                    <span className="text-black font-medium">
                      {product._count.studentEnrollments}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Статус</span>
                    <Chip
                      color={product.isActive ? "success" : "danger"}
                      size="sm"
                      variant="flat"
                    >
                      {product.isActive ? "Активен" : "Неактивен"}
                    </Chip>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Create Product Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            <form onSubmit={handleSubmit}>
              <ModalHeader className="text-black font-bold text-xl">
                Создать новый продукт
              </ModalHeader>
              <ModalBody className="space-y-4">
                <Input
                  label="Название продукта"
                  placeholder="Например: Индивидуальные уроки A1"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />

                <Select
                  label="Тип продукта"
                  placeholder="Выберите тип"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  required
                >
                  <SelectItem key="GROUP">
                    Группа
                  </SelectItem>
                  <SelectItem key="INDIVIDUAL_LESSONS">
                    Индивидуальные уроки
                  </SelectItem>
                  <SelectItem key="SELF_STUDY">
                    Самостоятельное изучение
                  </SelectItem>
                </Select>

                <Select
                  label="Курс (трек обучения)"
                  placeholder="Выберите курс"
                  value={formData.courseId}
                  onChange={(e) =>
                    setFormData({ ...formData, courseId: e.target.value })
                  }
                  required
                >
                  {courses.map((course) => (
                    <SelectItem key={course.id}>
                      {course.name} ({course.level})
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  label="Описание"
                  placeholder="Описание продукта..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Максимум уроков"
                    placeholder="24"
                    type="number"
                    value={formData.maxLessons}
                    onChange={(e) =>
                      setFormData({ ...formData, maxLessons: e.target.value })
                    }
                  />

                  <Input
                    label="Срок действия (дни)"
                    placeholder="180"
                    type="number"
                    value={formData.validityDays}
                    onChange={(e) =>
                      setFormData({ ...formData, validityDays: e.target.value })
                    }
                  />

                  <Input
                    label="Цена (₽)"
                    placeholder="12000"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onClick={onClose}>
                  Отмена
                </Button>
                <Button type="submit" color="primary">
                  Создать продукт
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
