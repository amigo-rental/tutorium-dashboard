const API_BASE = "/api";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      // Also set as cookie for middleware access
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      // Try localStorage first
      this.token = localStorage.getItem("auth_token");
      if (!this.token) {
        // Fallback to cookie
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
        if (tokenCookie) {
          this.token = tokenCookie.split('=')[1];
        }
      }
    }

    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      // Clear cookie
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
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
  async uploadFiles(recordingId: string, files: File[]) {
    const formData = new FormData();

    formData.append("recordingId", recordingId);

    files.forEach((file) => {
      formData.append("files", file);
    });

    const token = this.getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}/uploads`, {
        method: "POST",
        headers,
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
  async updateUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    level?: string;
  }) {
    return this.request("/users/update", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  // Feedback methods
  async getFeedback() {
    return this.request("/feedback");
  }

  async createFeedback(data: {
    rating: number;
    comment?: string;
    isAnonymous?: boolean;
    recordingId: string;
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
}

export const apiClient = new ApiClient();
