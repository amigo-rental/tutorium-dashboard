"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";

import { apiClient } from "@/lib/utils/api";
import { useAuth } from "@/lib/auth/context";
import { ProtectedRoute } from "@/components/protected-route";

interface Topic {
  id: string;
  name: string;
  description: string;
  order: number;
}

interface Course {
  id: string;
  name: string;
  description: string;
  level: string;
  duration: number;
  totalTopics: number;
  totalGroups: number;
  topics: Topic[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching courses with apiClient...");

      const response = await apiClient.getCourses();

      if (response.error) {
        throw new Error(response.error);
      }

      console.log("Courses response:", response.data);
      setCourses((response.data as Course[]) || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "A1":
        return "success";
      case "A2":
        return "primary";
      case "B1":
        return "secondary";
      case "B2":
        return "warning";
      case "C1":
      case "C2":
        return "danger";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Error loading courses
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button color="primary" onClick={fetchCourses}>
              Try Again
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Available Courses
          </h1>
          <p className="text-gray-600">
            Explore our comprehensive language learning courses with structured
            topics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="h-full">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {course.name}
                  </h3>
                  <Chip
                    color={getLevelColor(course.level) as any}
                    size="sm"
                    variant="flat"
                  >
                    {course.level}
                  </Chip>
                </div>
                <p className="text-sm text-gray-600">{course.description}</p>
              </CardHeader>

              <CardBody className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{course.duration} weeks</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Topics:</span>
                    <span className="font-medium">{course.totalTopics}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Groups:</span>
                    <span className="font-medium">{course.totalGroups}</span>
                  </div>
                </div>

                {course.topics.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Course Topics:
                    </h4>
                    <div className="space-y-2">
                      {course.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className="flex items-start space-x-2 text-sm"
                        >
                          <span className="text-gray-500 font-mono min-w-[20px]">
                            {topic.order}.
                          </span>
                          <div>
                            <span className="font-medium text-gray-900">
                              {topic.name}
                            </span>
                            {topic.description && (
                              <p className="text-gray-600 text-xs mt-1">
                                {topic.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>

              <CardFooter className="pt-0">
                <Button
                  className="w-full"
                  color="primary"
                  size="sm"
                  variant="flat"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses available
            </h3>
            <p className="text-gray-600">
              Check back later for new course offerings.
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
