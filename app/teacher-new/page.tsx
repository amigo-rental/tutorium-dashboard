"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";

import { useAuth } from "@/lib/auth/context";
import { apiClient } from "@/lib/utils/api";
import { Group, User, Recording as ApiRecording } from "@/types";
import { ProtectedRoute } from "@/components/protected-route";

interface FrontendRecording {
  id: string;
  lessonType: "group" | "individual";
  groupOrStudent: string | string[];
  date: string;
  youtubeLink: string;
  attachments: string[];
  message: string;
  createdAt: string;
}

export default function TeacherNewPage() {
  const { user, token } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [recordings, setRecordings] = useState<FrontendRecording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    lessonType: "",
    groupOrStudent: "" as string | string[],
    date: "",
    youtubeLink: "",
    message: "",
  });

  // Load data from API
  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [groupsResponse, studentsResponse, recordingsResponse] =
        await Promise.all([
          apiClient.getGroups(),
          apiClient.getStudents(),
          apiClient.getRecordings(),
        ]);

      if (groupsResponse.data) {
        setGroups(groupsResponse.data as Group[]);
      }

      if (studentsResponse.data) {
        setStudents(studentsResponse.data as User[]);
      }

      if (recordingsResponse.data) {
        const convertedRecordings = (
          recordingsResponse.data as ApiRecording[]
        ).map((apiRecording: ApiRecording) => ({
          id: apiRecording.id,
          lessonType: apiRecording.lessonType.toLowerCase() as
            | "group"
            | "individual",
          groupOrStudent:
            apiRecording.lessonType === "GROUP"
              ? apiRecording.group?.name || "Unknown Group"
              : apiRecording.students.map((s) => s.name),
          date: apiRecording.date.split("T")[0],
          youtubeLink: apiRecording.youtubeLink,
          attachments: apiRecording.attachments.map((a) => a.originalName),
          message: apiRecording.message || "",
          createdAt: apiRecording.createdAt,
        }));

        setRecordings(convertedRecordings);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData.lessonType || !formData.date || !formData.youtubeLink) {
        setError("Please fill in all required fields");

        return;
      }

      // Validate date format (should be YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      if (!dateRegex.test(formData.date)) {
        setError("Invalid date format. Please use YYYY-MM-DD format.");

        return;
      }

      // Validate group/student selection
      if (formData.lessonType === "group" && !formData.groupOrStudent) {
        setError("Please select a group");

        return;
      }

      if (
        formData.lessonType === "individual" &&
        (!Array.isArray(formData.groupOrStudent) ||
          formData.groupOrStudent.length === 0)
      ) {
        setError("Please select at least one student");

        return;
      }

      // Only include fields that have values
      const recordingData: any = {
        lessonType: formData.lessonType.toUpperCase() as "GROUP" | "INDIVIDUAL",
        date: formData.date, // This should be in YYYY-MM-DD format from the date input
        youtubeLink: formData.youtubeLink,
        message: formData.message || undefined,
      };

      // Add groupId only if it's a group lesson and has a value
      if (formData.lessonType === "group" && formData.groupOrStudent) {
        recordingData.groupId = formData.groupOrStudent as string;
      }

      // Add studentIds only if it's an individual lesson and has values
      if (
        formData.lessonType === "individual" &&
        Array.isArray(formData.groupOrStudent) &&
        formData.groupOrStudent.length > 0
      ) {
        recordingData.studentIds = formData.groupOrStudent as string[];
      }

      console.log("Sending recording data:", recordingData);

      const response = await apiClient.createRecording(recordingData);

      if (response.error) {
        setError(response.error);

        return;
      }

      setError(null); // Clear any previous errors
      await loadData();

      setFormData({
        lessonType: "",
        groupOrStudent: "",
        date: "",
        youtubeLink: "",
        message: "",
      });
      setError(null); // Clear any errors
    } catch (error) {
      console.error("Error creating recording:", error);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p>Please log in to access the teacher dashboard.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p>Please wait while we load your data.</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">
          Teacher Dashboard
        </h1>
        <p className="text-black/70">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border border-slate-200 rounded-xl">
          <CardBody className="p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-black">{groups.length}</h3>
              <p className="text-black/70">Groups</p>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-slate-200 rounded-xl">
          <CardBody className="p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-black">
                {students.length}
              </h3>
              <p className="text-black/70">Students</p>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-slate-200 rounded-xl">
          <CardBody className="p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-black">
                {recordings.length}
              </h3>
              <p className="text-black/70">Recordings</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Create Recording Form */}
      <Card className="mb-8 border border-slate-200 rounded-xl">
        <CardBody className="p-6">
          <h2 className="text-2xl font-bold text-black mb-6">
            Create New Recording
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Lesson Type"
                placeholder="Select lesson type"
                selectedKeys={formData.lessonType ? [formData.lessonType] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;

                  handleInputChange("lessonType", selected);
                  handleInputChange("groupOrStudent", "");
                }}
              >
                <SelectItem key="group">Group Lesson</SelectItem>
                <SelectItem key="individual">Individual Lesson</SelectItem>
              </Select>

              {formData.lessonType === "group" ? (
                <Select
                  label="Group"
                  placeholder="Select group"
                  selectedKeys={
                    typeof formData.groupOrStudent === "string" &&
                    formData.groupOrStudent
                      ? [formData.groupOrStudent]
                      : []
                  }
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;

                    handleInputChange("groupOrStudent", selected);
                  }}
                >
                  {groups.map((group) => (
                    <SelectItem key={group.id} textValue={group.name}>
                      {group.name}
                    </SelectItem>
                  ))}
                </Select>
              ) : formData.lessonType === "individual" ? (
                <Select
                  label="Students"
                  placeholder="Select students"
                  selectedKeys={
                    Array.isArray(formData.groupOrStudent)
                      ? formData.groupOrStudent
                      : []
                  }
                  selectionMode="multiple"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys) as string[];

                    handleInputChange("groupOrStudent", selected);
                  }}
                >
                  {students.map((student) => (
                    <SelectItem key={student.id} textValue={student.name}>
                      <div className="flex gap-2 items-center">
                        <Avatar
                          name={student.avatar || student.name}
                          size="sm"
                        />
                        <span>{student.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
              />

              <Input
                label="YouTube Link"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.youtubeLink}
                onChange={(e) =>
                  handleInputChange("youtubeLink", e.target.value)
                }
              />
            </div>

            <div>
              <label 
                htmlFor="message-textarea" 
                className="block text-sm font-medium text-black mb-2"
              >
                Message
              </label>
              <textarea
                id="message-textarea"
                className="w-full p-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lesson notes, homework, etc..."
                rows={4}
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
              />
            </div>

            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={
                !formData.lessonType || !formData.date || !formData.youtubeLink
              }
              type="submit"
            >
              Create Recording
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Recordings List */}
      <Card className="border border-slate-200 rounded-xl">
        <CardBody className="p-6">
          <h2 className="text-2xl font-bold text-black mb-6">
            Recent Recordings
          </h2>

          <div className="space-y-4">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                className="border border-slate-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Chip
                    color={
                      recording.lessonType === "group" ? "primary" : "secondary"
                    }
                    size="sm"
                  >
                    {recording.lessonType === "group" ? "Group" : "Individual"}
                  </Chip>

                  <span className="text-black/70">
                    {new Date(recording.date).toLocaleDateString()}
                  </span>
                </div>

                <div className="mb-3">
                  <a
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    href={recording.youtubeLink}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    📺 Watch on YouTube
                  </a>
                </div>

                {Array.isArray(recording.groupOrStudent) ? (
                  <div className="mb-3">
                    <p className="text-sm text-black/70 mb-2">Students:</p>
                    <div className="flex flex-wrap gap-2">
                      {recording.groupOrStudent.map((student, index) => (
                        <Chip key={index} size="sm" variant="flat">
                          {student}
                        </Chip>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-black font-medium mb-3">
                    Group: {recording.groupOrStudent}
                  </p>
                )}

                {recording.message && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-black">{recording.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
      </div>
    </ProtectedRoute>
  );
}
