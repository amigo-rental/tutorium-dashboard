const API_BASE = "/api";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: "include", // Include cookies in requests
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to parse error response as JSON, fallback to text if it fails
        let errorMessage = "An error occurred";

        try {
          const errorData = await response.json();

          errorMessage = errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, try to get text
          try {
            const errorText = await response.text();

            if (errorText.includes("404")) {
              errorMessage = "API endpoint not found";
            } else if (errorText.includes("500")) {
              errorMessage = "Internal server error";
            } else {
              errorMessage = `HTTP ${response.status}: ${errorText.substring(0, 100)}`;
            }
          } catch {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }

        return { error: errorMessage };
      }

      // Only try to parse JSON if response is ok
      const data = await response.json();

      return { data, message: data.message };
    } catch (error) {
      console.error("API request failed:", error);

      return { error: "Network error occurred" };
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async register(
    name: string,
    email: string,
    password: string,
    role = "TEACHER",
  ) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  // Groups
  async getGroups() {
    return this.request("/groups");
  }

  async getUserGroups() {
    return this.request("/groups/user");
  }

  async getAllGroups() {
    return this.request("/groups/all");
  }

  async createGroup(groupData: {
    name: string;
    description?: string;
    level: string;
    maxStudents?: number;
  }) {
    return this.request("/groups", {
      method: "POST",
      body: JSON.stringify(groupData),
    });
  }

  // Students
  async getStudents() {
    return this.request("/students");
  }

  async createStudent(studentData: {
    name: string;
    email: string;
    level: string;
    groupId?: string;
    avatar?: string;
  }) {
    return this.request("/students", {
      method: "POST",
      body: JSON.stringify(studentData),
    });
  }

  // Recordings
  async getRecordings() {
    return this.request("/recordings");
  }

  async createRecording(recordingData: {
    lessonType: "GROUP" | "INDIVIDUAL";
    date: string;
    youtubeLink: string;
    message?: string;
    groupId?: string;
    studentIds?: string[];
  }) {
    return this.request("/recordings", {
      method: "POST",
      body: JSON.stringify(recordingData),
    });
  }

  // File Uploads
  async uploadFiles(lessonId: string, files: File[]) {
    const formData = new FormData();

    formData.append("lessonId", lessonId);

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(`${API_BASE}/uploads`, {
        method: "POST",
        credentials: "include", // Include cookies in requests
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || "Upload failed" };
      }

      return { data, message: data.message };
    } catch (error) {
      console.error("File upload failed:", error);

      return { error: "Upload failed" };
    }
  }

  // Dashboard Data
  async getUpcomingLessons() {
    return this.request("/lessons/upcoming");
  }

  async getUserCourses() {
    return this.request("/courses/user");
  }

  async getRecentLessons() {
    return this.request("/lessons/recent");
  }

  // User Profile
  async getUser() {
    return this.request("/users/profile");
  }

  async updateUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    level?: string;
    id?: string;
    role?: string;
    groupId?: string;
    isActive?: boolean;
    courseIds?: string[];
  }) {
    // If ID is provided, use admin endpoint, otherwise use user profile endpoint
    const endpoint = userData.id
      ? `/admin/users/${userData.id}`
      : "/users/update";

    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  // Feedback methods
  async getFeedback(lessonId?: string) {
    const endpoint = lessonId ? `/feedback?lessonId=${lessonId}` : "/feedback";

    return this.request(endpoint);
  }

  async getUserFeedback() {
    return this.request("/feedback/user");
  }

  async createFeedback(data: {
    rating: number;
    comment?: string;
    isAnonymous?: boolean;
    lessonId: string;
  }) {
    return this.request("/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteFeedback(feedbackId: string) {
    return this.request(`/feedback?id=${feedbackId}`, {
      method: "DELETE",
    });
  }

  // Attendance methods
  async createAttendance(data: {
    lessonId: string;
    attendance: {
      studentId: string;
      status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
      notes?: string;
    }[];
  }) {
    return this.request("/attendance", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAttendance(
    attendanceId: string,
    data: {
      status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
      notes?: string;
    },
  ) {
    return this.request(`/attendance/${attendanceId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getLessonAttendance(lessonId: string) {
    return this.request(`/attendance/lesson/${lessonId}`);
  }

  async getStudentAttendance(
    studentId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const params = new URLSearchParams();

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    return this.request(
      `/attendance/student/${studentId}?${params.toString()}`,
    );
  }

  // Admin methods
  async getAllUsers() {
    return this.request("/admin/users");
  }

  async createUser(userData: {
    name: string;
    email: string;
    role: "ADMIN" | "TEACHER" | "STUDENT";
    groupId?: string;
    isActive: boolean;
    level?: string;
  }) {
    return this.request("/admin/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, {
      method: "DELETE",
    });
  }

  async getAdminStats() {
    return this.request("/admin/stats");
  }

  // Teacher methods
  async getTeacherStats(teacherId: string) {
    return this.request(`/teachers/${teacherId}/stats`);
  }

  async getTeacherLessons(teacherId: string, status?: string) {
    const params = new URLSearchParams();

    if (status) params.append("status", status);

    return this.request(`/teachers/${teacherId}/lessons?${params.toString()}`);
  }

  async getTeacherGroups(teacherId: string) {
    return this.request(`/teachers/${teacherId}/groups`);
  }

  async getTeacherStudents(teacherId: string) {
    return this.request(`/teachers/${teacherId}/students`);
  }

  async getTeacherFeedback(teacherId: string) {
    return this.request(`/teachers/${teacherId}/feedback`);
  }

  async getCourses() {
    return this.request("/courses");
  }

  async getTopicsByCourse(courseId: string) {
    return this.request(`/topics?courseId=${courseId}`);
  }

  async assignCourseToUser(userId: string, courseId: string) {
    return this.request(`/admin/users/${userId}/courses`, {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });
  }

  async removeCourseFromUser(userId: string, courseId: string) {
    return this.request(`/admin/users/${userId}/courses/${courseId}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
