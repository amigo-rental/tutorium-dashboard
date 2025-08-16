"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";

import { useAuth } from "@/lib/auth/context";
import { apiClient } from "@/lib/utils/api";
import { Group, User, Recording as ApiRecording, Topic } from "@/types";
import { ProtectedRoute } from "@/components/protected-route";
import { TeacherPageSkeleton } from "@/components/dashboard-skeletons";

interface Recording {
  id: string;
  title?: string;
  description?: string;
  lessonType: "group" | "individual";
  groupOrStudent: string | string[];
  date: string;
  youtubeLink: string;
  attachments: string[];
  message: string;
  createdAt: string;
  materials?: string[];
  topicId?: string;
  nextTopicId?: string;
}

export default function TeacherPage() {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingRecording, setEditingRecording] = useState<Recording | null>(
    null,
  );
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    lessonType: "",
    groupOrStudent: "" as string | string[],
    date: "",
    youtubeLink: "",
    attachments: [] as File[],
    message: "",
    materials: [] as string[],
    topicId: "",
    nextTopicId: "",
  });

  // Real data from API
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Attendance state
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedGroupForAttendance, setSelectedGroupForAttendance] =
    useState<Group | null>(null);
  const [attendanceData, setAttendanceData] = useState<
    Record<string, "PRESENT" | "ABSENT" | "LATE" | "EXCUSED">
  >({});
  const [attendanceNotes, setAttendanceNotes] = useState<
    Record<string, string>
  >({});

  // Load data from API
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadTopicsForGroup = async (groupId: string) => {
    try {
      const selectedGroup = groups.find((g) => g.id === groupId);

      if (selectedGroup && selectedGroup.courseId) {
        const topicsResponse = await apiClient.getTopicsByCourse(
          selectedGroup.courseId,
        );

        if (topicsResponse.data) {
          setTopics(topicsResponse.data as Topic[]);
        } else {
          setTopics([]);
        }
      }
    } catch (error) {
      console.error("Error loading topics:", error);
      setTopics([]);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load groups and students in parallel
      const [groupsResponse, studentsResponse, recordingsResponse] =
        await Promise.all([
          apiClient.getGroups(),
          apiClient.getStudents(),
          apiClient.getRecordings(),
        ]);

      if (groupsResponse.data) {
        console.log("Groups loaded:", groupsResponse.data);
        setGroups(groupsResponse.data as Group[]);
      } else {
        console.log("No groups from API");
        setGroups([]);
      }

      if (studentsResponse.data) {
        setStudents(studentsResponse.data as User[]);
      } else {
        setStudents([]);
      }

      if (recordingsResponse.data) {
        // Convert API recordings to frontend format
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
              : (apiRecording.students || []).map((s) => s.name),
          date: apiRecording.date.split("T")[0], // Extract date part
          youtubeLink: apiRecording.youtubeLink,
          attachments: apiRecording.attachments.map((a) => a.originalName),
          message: apiRecording.message || "",
          createdAt: apiRecording.createdAt,
          topicId: apiRecording.topic?.id,
          nextTopicId: "", // This will be set when creating new lessons
        }));

        setRecordings(convertedRecordings);
      } else {
        setRecordings([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      // Set empty arrays on error instead of mock data
      setGroups([]);
      setStudents([]);
      setRecordings([]);
      setTopics([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | string[] | File[],
  ) => {
    console.log(`handleInputChange: ${field} =`, value);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Prepare data for API
      const recordingData = {
        title: formData.title || "Запись урока",
        description: formData.description,
        lessonType: formData.lessonType.toUpperCase() as "GROUP" | "INDIVIDUAL",
        date: formData.date,
        youtubeLink: formData.youtubeLink,
        message: formData.message,
        groupId:
          formData.lessonType === "group"
            ? (formData.groupOrStudent as string)
            : undefined,
        studentIds:
          formData.lessonType === "individual"
            ? (formData.groupOrStudent as string[])
            : undefined,
        materials: formData.materials || [],
        topicId: formData.topicId,
        nextTopicId: formData.nextTopicId,
      };

      // Create recording via API
      const response = await apiClient.createRecording(recordingData);

      if (response.error) {
        console.error("Error creating recording:", response.error);

        return;
      }

      // Reload data to get the new recording
      await loadData();

      // Reset form
      setFormData({
        title: "",
        description: "",
        lessonType: "",
        groupOrStudent: "",
        date: "",
        youtubeLink: "",
        attachments: [],
        message: "",
        materials: [],
        topicId: "",
        nextTopicId: "",
      });
    } catch (error) {
      console.error("Error creating recording:", error);
    }
  };

  // Attendance functions
  const openAttendanceModal = (group: Group) => {
    setSelectedGroupForAttendance(group);
    // Initialize attendance data for all students in the group
    const initialAttendance: Record<
      string,
      "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
    > = {};
    const initialNotes: Record<string, string> = {};

    group.students.forEach((student) => {
      initialAttendance[student.id] = "PRESENT"; // Default to present
      initialNotes[student.id] = "";
    });

    setAttendanceData(initialAttendance);
    setAttendanceNotes(initialNotes);
    setAttendanceModalOpen(true);
  };

  const handleAttendanceChange = (
    studentId: string,
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED",
  ) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleAttendanceNotesChange = (studentId: string, notes: string) => {
    setAttendanceNotes((prev) => ({
      ...prev,
      [studentId]: notes,
    }));
  };

  const submitAttendance = async () => {
    if (!selectedGroupForAttendance) return;

    try {
      // Create attendance records for the lesson
      const attendanceRecords = Object.entries(attendanceData).map(
        ([studentId, status]) => ({
          studentId,
          status,
          notes: attendanceNotes[studentId] || "",
        }),
      );

      // For now, we'll create a temporary lesson ID since this is called before lesson creation
      // In a real implementation, you might want to create the lesson first, then attendance
      const tempLessonId = `temp-${Date.now()}`;

      // Call the API to save attendance
      const response = await apiClient.createAttendance({
        lessonId: tempLessonId,
        attendance: attendanceRecords,
      });

      if (response.error) {
        console.error("Error saving attendance:", response.error);

        return;
      }

      console.log("Attendance submitted successfully:", response.data);
      setAttendanceModalOpen(false);
      setSelectedGroupForAttendance(null);
      setAttendanceData({});
      setAttendanceNotes({});
    } catch (error) {
      console.error("Error saving attendance:", error);
    }
  };

  const handleEdit = (recording: Recording) => {
    setEditingRecording(recording);
    setFormData({
      title: recording.title || "",
      description: recording.description || "",
      lessonType: recording.lessonType,
      groupOrStudent: recording.groupOrStudent,
      date: recording.date,
      youtubeLink: recording.youtubeLink,
      attachments: [],
      message: recording.message,
      materials: recording.materials || [],
      topicId: recording.topicId || "",
      nextTopicId: recording.nextTopicId || "",
    });
    onOpen();
  };

  const handleUpdate = () => {
    if (!editingRecording) return;

    const updatedRecordings = recordings.map((r) =>
      r.id === editingRecording.id
        ? {
            ...editingRecording,
            ...formData,
            lessonType: formData.lessonType as "group" | "individual",
            attachments: formData.attachments.map((f) => f.name),
          }
        : r,
    );

    setRecordings(updatedRecordings);
    onClose();
    setEditingRecording(null);
    setFormData({
      title: "",
      description: "",
      lessonType: "",
      groupOrStudent: "",
      date: "",
      youtubeLink: "",
      attachments: [],
      message: "",
      materials: [],
      topicId: "",
      nextTopicId: "",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getSelectedKeys = () => {
    if (
      formData.lessonType === "individual" &&
      Array.isArray(formData.groupOrStudent)
    ) {
      return formData.groupOrStudent;
    } else if (
      typeof formData.groupOrStudent === "string" &&
      formData.groupOrStudent
    ) {
      return [formData.groupOrStudent];
    }

    return [];
  };

  const getDisplayValue = () => {
    if (
      formData.lessonType === "individual" &&
      Array.isArray(formData.groupOrStudent)
    ) {
      return formData.groupOrStudent;
    } else if (
      typeof formData.groupOrStudent === "string" &&
      formData.groupOrStudent
    ) {
      return [formData.groupOrStudent];
    }

    return [];
  };

  if (isLoading) {
    return <TeacherPageSkeleton />;
  }

  return (
    <ProtectedRoute requiredRole="TEACHER">
      <div className="min-h-screen bg-white lg:ml-4 xl:ml-0">
        {/* Hero Section */}
        <div className="pt-12 mb-8">
          <h1 className="text-5xl font-bold text-black tracking-tight">
            Загрузка записей уроков 📚
          </h1>
          <p className="text-black/70 text-xl font-medium mt-2">
            Добавляйте записи уроков для групп и индивидуальных студентов
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-gradient-to-br from-[#007EFB]/5 via-[#EE7A3F]/5 to-[#FDD130]/5 border border-[#007EFB]/20 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#007EFB]/10 to-[#EE7A3F]/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-[#007EFB]/10 rounded-2xl">
                <svg
                  className="w-7 h-7 text-[#007EFB]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-3xl text-black">
                  Новая запись урока
                </h2>
                <p className="text-black/70 font-medium text-base">
                  Заполните форму для загрузки записи
                </p>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Lesson Type and Group/Student Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Select
                    classNames={{
                      label: "font-bold text-black",
                      trigger:
                        "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                      value: "font-medium text-black",
                    }}
                    label="Тип урока"
                    placeholder="Выберите тип урока"
                    selectedKeys={
                      formData.lessonType ? [formData.lessonType] : []
                    }
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;

                      handleInputChange("lessonType", selected);
                      handleInputChange("groupOrStudent", "");
                      setTopics([]); // Clear topics when lesson type changes
                    }}
                  >
                    <SelectItem key="group" textValue="Групповой урок">
                      Групповой урок
                    </SelectItem>
                    <SelectItem
                      key="individual"
                      textValue="Индивидуальный урок"
                    >
                      Индивидуальный урок
                    </SelectItem>
                  </Select>
                </div>

                <div>
                  {formData.lessonType === "group" ? (
                    <Select
                      classNames={{
                        label: "font-bold text-black",
                        trigger:
                          "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                        value: "font-medium text-black",
                      }}
                      label="Группа"
                      placeholder="Выберите группу"
                      selectedKeys={
                        typeof formData.groupOrStudent === "string" &&
                        formData.groupOrStudent
                          ? [formData.groupOrStudent]
                          : []
                      }
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;

                        handleInputChange("groupOrStudent", selected);
                        loadTopicsForGroup(selected);
                      }}
                    >
                      {groups.map((group) => (
                        <SelectItem key={group.id} textValue={group.name}>
                          {group.name} ({group._count?.students || 0} студентов)
                        </SelectItem>
                      ))}
                    </Select>
                  ) : formData.lessonType === "individual" ? (
                    <Select
                      classNames={{
                        label: "font-bold text-black",
                        trigger:
                          "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none min-h-12 py-2",
                        value: "font-medium text-black",
                      }}
                      isMultiline={true}
                      items={students}
                      label="Студенты"
                      placeholder="Выберите студентов"
                      renderValue={(items) => {
                        return (
                          <div className="flex flex-wrap gap-2">
                            {items.map((item) => (
                              <Chip
                                key={item.key}
                                color="primary"
                                variant="flat"
                              >
                                {item.data?.name || item.key}
                              </Chip>
                            ))}
                          </div>
                        );
                      }}
                      selectedKeys={getSelectedKeys()}
                      selectionMode="multiple"
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys) as string[];

                        handleInputChange("groupOrStudent", selected);
                      }}
                    >
                      {(student) => (
                        <SelectItem key={student.id} textValue={student.name}>
                          <div className="flex gap-2 items-center">
                            <Avatar
                              alt={student.name}
                              className="shrink-0"
                              classNames={{
                                base: "bg-[#007EFB] text-white",
                              }}
                              name={student.avatar}
                              size="sm"
                            />
                            <div className="flex flex-col">
                              <span className="text-small font-medium">
                                {student.name}
                              </span>
                              <span className="text-tiny text-default-400">
                                {student.email}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      )}
                    </Select>
                  ) : null}
                </div>
              </div>

              {/* Topic Selection - Only show for group lessons */}
              {formData.lessonType === "group" &&
                formData.groupOrStudent &&
                topics.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Select
                        classNames={{
                          label: "font-bold text-black",
                          trigger:
                            "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                          value: "font-medium text-black",
                        }}
                        items={topics}
                        label="Тема занятия"
                        placeholder="Выберите тему занятия"
                        selectedKeys={
                          formData.topicId ? [formData.topicId] : []
                        }
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string;

                          handleInputChange("topicId", selected);
                        }}
                      >
                        {(topic) => (
                          <SelectItem key={topic.id} textValue={topic.name}>
                            {topic.name}
                          </SelectItem>
                        )}
                      </Select>
                    </div>

                    <div>
                      <Select
                        classNames={{
                          label: "font-bold text-black",
                          trigger:
                            "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                          value: "font-medium text-black",
                        }}
                        items={[
                          { id: "", name: "Не планировать следующую тему" },
                          ...topics,
                        ]}
                        label="Следующая тема"
                        placeholder="Выберите следующую тему или оставьте пустым"
                        selectedKeys={
                          formData.nextTopicId ? [formData.nextTopicId] : []
                        }
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string;

                          handleInputChange("nextTopicId", selected);
                        }}
                      >
                        {(item) => (
                          <SelectItem key={item.id} textValue={item.name}>
                            {item.name}
                          </SelectItem>
                        )}
                      </Select>
                    </div>
                  </div>
                )}

              {/* Date and YouTube Link */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  classNames={{
                    label: "font-bold text-black",
                    input: "font-medium text-black",
                    inputWrapper:
                      "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                  }}
                  label="Дата урока"
                  placeholder="Выберите дату"
                  type="date"
                  value={formData.date}
                  variant="bordered"
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />

                <Input
                  classNames={{
                    label: "font-bold text-black",
                    input: "font-medium text-black",
                    inputWrapper:
                      "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                  }}
                  label="Ссылка на YouTube"
                  placeholder="https://youtube.com/watch?v=..."
                  type="url"
                  value={formData.youtubeLink}
                  variant="bordered"
                  onChange={(e) =>
                    handleInputChange("youtubeLink", e.target.value)
                  }
                />
              </div>

              {/* File Upload */}
              <div>
                <label
                  className="block text-black font-bold text-sm mb-2"
                  htmlFor="file-upload"
                >
                  Прикрепленные файлы
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-white">
                  <input
                    multiple
                    className="hidden"
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label className="cursor-pointer" htmlFor="file-upload">
                    <div className="text-slate-500 mb-2">
                      <svg
                        className="w-8 h-8 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </div>
                    <p className="text-black font-medium">
                      Нажмите для загрузки файлов
                    </p>
                    <p className="text-black/60 text-sm">
                      или перетащите файлы сюда
                    </p>
                  </label>
                </div>

                {/* File List */}
                {formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-200/60"
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5 text-slate-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                            />
                          </svg>
                          <span className="text-black font-medium text-sm">
                            {file.name}
                          </span>
                        </div>
                        <Button
                          className="text-red-600 hover:bg-red-50"
                          size="sm"
                          variant="light"
                          onClick={() => removeAttachment(index)}
                        >
                          Удалить
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  className="block text-black font-bold text-sm mb-2"
                  htmlFor="message-textarea"
                >
                  Сообщение к уроку
                </label>
                <textarea
                  className="w-full p-3 border border-slate-200/60 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#007EFB] focus:border-transparent bg-white font-medium text-black"
                  id="message-textarea"
                  placeholder="Опишите, что было изучено на уроке, домашнее задание и другие важные моменты..."
                  rows={4}
                  value={formData.message}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("message", e.target.value)
                  }
                />
                <p className="text-black/60 text-sm mt-2">
                  Поддерживаются абзацы и форматирование
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                {/* Show attendance button for group lessons, upload button for individual lessons */}
                {formData.lessonType === "group" && formData.groupOrStudent ? (
                  // Attendance Button for Group Lessons
                  <Button
                    className="bg-[#007EFB] text-white hover:bg-[#007EFB]/90 font-bold px-8 py-3"
                    disabled={
                      !formData.lessonType ||
                      formData.lessonType !== "group" ||
                      !formData.groupOrStudent
                    }
                    onClick={() => {
                      const selectedGroup = groups.find(
                        (g) => g.id === formData.groupOrStudent,
                      );

                      if (selectedGroup) {
                        openAttendanceModal(selectedGroup);
                      } else {
                        console.error(
                          "Group not found:",
                          formData.groupOrStudent,
                          "Available groups:",
                          groups,
                        );
                      }
                    }}
                  >
                    Заполнить посещаемость
                  </Button>
                ) : (
                  // Upload Button for Individual Lessons or when no group selected
                  <Button
                    className="bg-[#007EFB] text-white hover:bg-[#007EFB]/90 font-bold px-8 py-3"
                    disabled={
                      !formData.lessonType ||
                      (formData.lessonType === "group" &&
                        !formData.groupOrStudent) ||
                      (formData.lessonType === "individual" &&
                        (!Array.isArray(formData.groupOrStudent) ||
                          formData.groupOrStudent.length === 0)) ||
                      !formData.date ||
                      !formData.youtubeLink
                    }
                    type="submit"
                  >
                    Загрузить запись
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Recent Recordings */}
        <div>
          <h2 className="text-3xl font-bold text-black mb-6">
            Недавно загруженные записи
          </h2>
          <div className="space-y-4">
            {recordings.map((recording) => (
              <Card
                key={recording.id}
                className="border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <CardBody className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Chip
                          className="font-semibold"
                          color={
                            recording.lessonType === "group"
                              ? "primary"
                              : "secondary"
                          }
                          size="sm"
                          variant="flat"
                        >
                          {recording.lessonType === "group"
                            ? "Группа"
                            : "Индивидуально"}
                        </Chip>
                        <div className="flex items-center gap-2">
                          {Array.isArray(recording.groupOrStudent) ? (
                            recording.groupOrStudent.map((student, index) => (
                              <Chip
                                key={index}
                                color="primary"
                                size="sm"
                                variant="flat"
                              >
                                {student}
                              </Chip>
                            ))
                          ) : (
                            <span className="text-black font-semibold">
                              {recording.groupOrStudent}
                            </span>
                          )}
                        </div>
                        <span className="text-black/60 font-medium">
                          {formatDate(recording.date)}
                        </span>
                      </div>

                      <div className="mb-3">
                        <a
                          className="text-[#007EFB] hover:text-[#007EFB]/80 font-medium inline-flex items-center gap-2"
                          href={recording.youtubeLink}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                            />
                          </svg>
                          Смотреть запись на YouTube
                        </a>
                      </div>

                      {recording.attachments.length > 0 && (
                        <div className="mb-3">
                          <p className="text-black/70 font-medium text-sm mb-2">
                            Прикрепленные файлы:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {recording.attachments.map((file, index) => (
                              <Chip
                                key={index}
                                className="bg-slate-100 text-slate-700 font-medium"
                                size="sm"
                                variant="flat"
                              >
                                {file}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      )}

                      {recording.message && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/50">
                          <p className="text-black font-medium whitespace-pre-wrap">
                            {recording.message}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      className="text-[#007EFB] hover:bg-[#007EFB]/10 font-medium"
                      variant="light"
                      onClick={() => handleEdit(recording)}
                    >
                      Редактировать
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Edit Modal */}
        <Modal isOpen={isOpen} size="4xl" onClose={onClose}>
          <ModalContent className="bg-white border border-slate-200/60 rounded-3xl">
            <ModalHeader className="text-black font-bold text-2xl pb-2">
              Редактировать запись урока
            </ModalHeader>
            <ModalBody className="pt-6">
              <form className="space-y-6">
                {/* Lesson Type and Group/Student Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Select
                      classNames={{
                        label: "font-bold text-black",
                        trigger:
                          "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                        value: "font-medium text-black",
                      }}
                      label="Тип урока"
                      placeholder="Выберите тип урока"
                      selectedKeys={
                        formData.lessonType ? [formData.lessonType] : []
                      }
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;

                        handleInputChange("lessonType", selected);
                        handleInputChange("groupOrStudent", "");
                      }}
                    >
                      <SelectItem key="group" textValue="Групповой урок">
                        Групповой урок
                      </SelectItem>
                      <SelectItem
                        key="individual"
                        textValue="Индивидуальный урок"
                      >
                        Индивидуальный урок
                      </SelectItem>
                    </Select>
                  </div>

                  <div>
                    {formData.lessonType === "group" ? (
                      <Select
                        classNames={{
                          label: "font-bold text-black",
                          trigger:
                            "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                          value: "font-medium text-black",
                        }}
                        label="Группа"
                        placeholder="Выберите группу"
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
                          <SelectItem key={group.name} textValue={group.name}>
                            {group.name} ({group._count?.students || 0}{" "}
                            студентов)
                          </SelectItem>
                        ))}
                      </Select>
                    ) : formData.lessonType === "individual" ? (
                      <Select
                        classNames={{
                          label: "font-bold text-black",
                          trigger:
                            "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none min-h-12 py-2",
                          value: "font-medium text-black",
                        }}
                        isMultiline={true}
                        items={students}
                        label="Студенты"
                        placeholder="Выберите студентов"
                        renderValue={(items) => {
                          return (
                            <div className="flex flex-wrap gap-2">
                              {items.map((item) => (
                                <Chip
                                  key={item.key}
                                  color="primary"
                                  variant="flat"
                                >
                                  {item.data?.name || item.key}
                                </Chip>
                              ))}
                            </div>
                          );
                        }}
                        selectedKeys={getSelectedKeys()}
                        selectionMode="multiple"
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys) as string[];

                          handleInputChange("groupOrStudent", selected);
                        }}
                      >
                        {(student) => (
                          <SelectItem
                            key={student.name}
                            textValue={student.name}
                          >
                            <div className="flex gap-2 items-center">
                              <Avatar
                                alt={student.name}
                                className="shrink-0"
                                classNames={{
                                  base: "bg-[#007EFB] text-white",
                                }}
                                name={student.avatar}
                                size="sm"
                              />
                              <div className="flex flex-col">
                                <span className="text-small font-medium">
                                  {student.name}
                                </span>
                                <span className="text-tiny text-default-400">
                                  {student.email}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        )}
                      </Select>
                    ) : null}
                  </div>
                </div>

                {/* Date and YouTube Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    classNames={{
                      label: "font-bold text-black",
                      input: "font-medium text-black",
                      inputWrapper:
                        "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                    }}
                    label="Дата урока"
                    placeholder="Выберите дату"
                    type="date"
                    value={formData.date}
                    variant="bordered"
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />

                  <Input
                    classNames={{
                      label: "font-bold text-black",
                      input: "font-medium text-black",
                      inputWrapper:
                        "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
                    }}
                    label="Ссылка на YouTube"
                    placeholder="https://youtube.com/watch?v=..."
                    type="url"
                    value={formData.youtubeLink}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChange("youtubeLink", e.target.value)
                    }
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    className="block text-black font-bold text-sm mb-2"
                    htmlFor="edit-message-textarea"
                  >
                    Сообщение к уроку
                  </label>
                  <textarea
                    className="w-full p-3 border border-slate-200/60 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#007EFB] focus:border-transparent bg-white font-medium text-black"
                    id="edit-message-textarea"
                    placeholder="Опишите, что было изучено на уроке, домашнее задание и другие важные моменты..."
                    rows={4}
                    value={formData.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleInputChange("message", e.target.value)
                    }
                  />
                </div>
              </form>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onClick={onClose}>
                Отмена
              </Button>
              <Button
                className="bg-[#007EFB] text-white hover:bg-[#007EFB]/90 font-bold"
                onClick={handleUpdate}
              >
                Сохранить изменения
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Attendance Modal */}
        <Modal
          isOpen={attendanceModalOpen}
          size="2xl"
          onClose={() => setAttendanceModalOpen(false)}
        >
          <ModalContent>
            <ModalHeader className="text-black font-bold text-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-black font-bold text-xl">
                    Заполнить посещаемость
                  </h3>
                  <p className="text-black/60 font-medium text-sm">
                    Группа: {selectedGroupForAttendance?.name}
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              {selectedGroupForAttendance && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                    <p className="text-slate-700 font-medium text-sm">
                      Отметьте посещаемость студентов для урока от{" "}
                      {formData.date}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {selectedGroupForAttendance.students.map((student) => (
                      <div
                        key={student.id}
                        className="bg-white border border-slate-200/60 rounded-2xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar
                              alt={student.name}
                              className="shrink-0"
                              classNames={{
                                base: "bg-[#007EFB] text-white",
                              }}
                              name={student.avatar}
                              size="sm"
                            />
                            <div>
                              <h4 className="font-semibold text-slate-900 text-sm">
                                {student.name}
                              </h4>
                              <p className="text-slate-600 text-xs">
                                {student.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Attendance Status Buttons */}
                            <div className="flex gap-1">
                              <Button
                                className="min-w-0 px-2 py-1 text-xs"
                                color={
                                  attendanceData[student.id] === "PRESENT"
                                    ? "success"
                                    : "default"
                                }
                                size="sm"
                                variant={
                                  attendanceData[student.id] === "PRESENT"
                                    ? "solid"
                                    : "bordered"
                                }
                                onClick={() =>
                                  handleAttendanceChange(student.id, "PRESENT")
                                }
                              >
                                Присутствует
                              </Button>
                              <Button
                                className="min-w-0 px-2 py-1 text-xs"
                                color={
                                  attendanceData[student.id] === "ABSENT"
                                    ? "danger"
                                    : "default"
                                }
                                size="sm"
                                variant={
                                  attendanceData[student.id] === "ABSENT"
                                    ? "solid"
                                    : "bordered"
                                }
                                onClick={() =>
                                  handleAttendanceChange(student.id, "ABSENT")
                                }
                              >
                                Отсутствует
                              </Button>
                              <Button
                                className="min-w-0 px-2 py-1 text-xs"
                                color={
                                  attendanceData[student.id] === "LATE"
                                    ? "warning"
                                    : "default"
                                }
                                size="sm"
                                variant={
                                  attendanceData[student.id] === "LATE"
                                    ? "solid"
                                    : "bordered"
                                }
                                onClick={() =>
                                  handleAttendanceChange(student.id, "LATE")
                                }
                              >
                                Опоздал
                              </Button>
                              <Button
                                className="min-w-0 px-2 py-1 text-xs"
                                color={
                                  attendanceData[student.id] === "EXCUSED"
                                    ? "secondary"
                                    : "default"
                                }
                                size="sm"
                                variant={
                                  attendanceData[student.id] === "EXCUSED"
                                    ? "solid"
                                    : "bordered"
                                }
                                onClick={() =>
                                  handleAttendanceChange(student.id, "EXCUSED")
                                }
                              >
                                Уважительно
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Notes Field */}
                        <div className="mt-3">
                          <Input
                            classNames={{
                              input: "text-xs",
                              inputWrapper: "bg-slate-50 border-slate-200/60",
                            }}
                            placeholder="Дополнительные заметки (необязательно)"
                            size="sm"
                            value={attendanceNotes[student.id] || ""}
                            variant="bordered"
                            onChange={(e) =>
                              handleAttendanceNotesChange(
                                student.id,
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onClick={() => setAttendanceModalOpen(false)}
              >
                Отмена
              </Button>
              <Button
                className="bg-green-600 text-white hover:bg-green-700 font-bold"
                onClick={submitAttendance}
              >
                Сохранить посещаемость
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
