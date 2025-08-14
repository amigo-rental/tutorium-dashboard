"use client";

import type { Selection, SortDescriptor } from "@heroui/table";
import type { ChipProps } from "@heroui/chip";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import {
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Chip } from "@heroui/chip";
import { User } from "@heroui/user";
import { Pagination } from "@heroui/pagination";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

import { useAuth } from "@/lib/auth/context";
import { apiClient } from "@/lib/utils/api";
import { User as UserType, Group } from "@/types";
import { ProtectedRoute } from "@/components/protected-route";
import { LEVEL_OPTIONS } from "@/lib/constants/levels";

// Icons
const PlusIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 4v16m8-8H4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const VerticalDotsIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M19 9l-7 7-7-7"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const OpenLockIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const ClosedLockIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M8 11V7a4 4 0 118 0v4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

// Types and constants
interface UserWithStats extends UserType {
  averageRating?: number;
  totalFeedbacks?: number;
  lastActiveDate?: string;
  group?: Group;
  groups?: Group[]; // Support multiple groups
  courses?: any[];
}

const columns = [
  { name: "USER", uid: "user", sortable: true },
  { name: "ROLE", uid: "role", sortable: true },
  { name: "GROUP", uid: "group" },
  { name: "RATING", uid: "rating", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const statusOptions = [
  { name: "Active", uid: "active" },
  { name: "Inactive", uid: "inactive" },
];

const roleOptions = [
  { name: "All", uid: "all" },
  { name: "Admin", uid: "ADMIN" },
  { name: "Teacher", uid: "TEACHER" },
  { name: "Student", uid: "STUDENT" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  inactive: "danger",
};

const roleColorMap: Record<string, ChipProps["color"]> = {
  ADMIN: "danger",
  TEACHER: "primary",
  STUDENT: "secondary",
};

const INITIAL_VISIBLE_COLUMNS = [
  "user",
  "role",
  "group",
  "rating",
  "status",
  "actions",
];

function capitalize(str: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
}

export default function AdminPage() {
  const { user } = useAuth();

  // Data state
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Table state
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [roleFilter, setRoleFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "user",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  // Modal state
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<UserWithStats>>({
    name: "",
    email: "",
    role: "STUDENT",
    isActive: true,
  });

  // Load data
  useEffect(() => {
    console.log("🔐 Auth state changed:", {
      user: user?.email,
    });
    if (user) {
      console.log("✅ Authentication available, loading admin data...");
      loadData();
    } else {
      console.log("❌ No authentication or user found");
    }
  }, [user]);

  // Debug effect to monitor data changes
  useEffect(() => {
    console.log("Admin: Groups state changed:", groups);
    console.log("Admin: Courses state changed:", courses);
  }, [groups, courses]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Loading admin data...");
      console.log("👤 Current user:", user);

      // Allow all authenticated users to access admin page
      if (!user) {
        console.error("🚫 No user found - authentication required");
        alert("Please log in to access this page");

        return;
      }

      console.log(`✅ User ${user.email} (${user.role}) accessing admin page`);

      // Load data based on user role
      let usersResponse, groupsResponse, coursesResponse;

      if (user.role === "ADMIN") {
        // Admin can see all users, groups, and courses
        [usersResponse, groupsResponse, coursesResponse] = await Promise.all([
          apiClient.getAllUsers(),
          apiClient.getGroups(),
          apiClient.getCourses(),
        ]);
      } else {
        // Non-admin users can only see groups and courses
        [groupsResponse, coursesResponse] = await Promise.all([
          apiClient.getGroups(),
          apiClient.getCourses(),
        ]);
        usersResponse = { data: [] }; // Empty users for non-admin
      }

      console.log("📊 API Responses:", {
        users: usersResponse,
        groups: groupsResponse,
        courses: coursesResponse,
      });

      // Set groups data
      if (groupsResponse.data) {
        const groupsData = Array.isArray(groupsResponse.data)
          ? groupsResponse.data
          : [];

        console.log("👥 Groups loaded:", groupsData);
        setGroups(groupsData);
      } else {
        console.log("⚠️ No groups from API, response:", groupsResponse);
        setGroups([]);
      }

      // Set courses data
      if (coursesResponse.data) {
        const coursesData = Array.isArray(coursesResponse.data)
          ? coursesResponse.data
          : [];

        console.log("📚 Courses loaded:", coursesData);
        setCourses(coursesData);
      } else {
        console.log("⚠️ No courses from API, response:", coursesResponse);
        setCourses([]);
      }

      // Set users data with enhanced information
      if (usersResponse.data) {
        const groupsData = Array.isArray(groupsResponse.data)
          ? groupsResponse.data
          : [];
        const usersWithStats = (usersResponse.data as UserType[]).map(
          (user) => ({
            ...user,
            group:
              user.group ||
              groupsData.find((g: Group) => g.id === user.groupId),
            groups: user.group
              ? [user.group]
              : user.groupId
                ? [groupsData.find((g: Group) => g.id === user.groupId)].filter(
                    Boolean,
                  )
                : [],
            averageRating: (user as any).averageRating || undefined,
            totalFeedbacks: 0,
            lastActiveDate: user.updatedAt,
            courses: (user as any).enrolledCourses || [],
          }),
        );

        console.log("👤 Users with stats:", usersWithStats);
        setUsers(usersWithStats);
      } else if (usersResponse.error) {
        console.error("🚨 API Error loading users:", usersResponse.error);
        alert(`Error loading users: ${usersResponse.error}`);
        setUsers([]);
      } else {
        console.log("⚠️ No users from API, response:", usersResponse);
        setUsers([]);
      }

      console.log("✅ Admin data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading admin data:", error);
      // Set empty arrays to prevent undefined errors
      setGroups([]);
      setCourses([]);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Table logic
  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    console.log("🔍 Filtering users - Input users:", users.length);
    let filteredUsers = [...users];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(filterValue.toLowerCase()) ||
          user.email.toLowerCase().includes(filterValue.toLowerCase()),
      );
      console.log("🔍 After search filter:", filteredUsers.length);
    }

    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredUsers = filteredUsers.filter((user) =>
        Array.from(statusFilter).includes(
          user.isActive ? "active" : "inactive",
        ),
      );
      console.log("🔍 After status filter:", filteredUsers.length);
    }

    if (
      roleFilter !== "all" &&
      Array.from(roleFilter).length !== roleOptions.length
    ) {
      filteredUsers = filteredUsers.filter((user) =>
        Array.from(roleFilter).includes(user.role),
      );
      console.log("🔍 After role filter:", filteredUsers.length);
    }

    console.log("🔍 Final filtered users:", filteredUsers.length);

    return filteredUsers;
  }, [users, filterValue, statusFilter, roleFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageItems = filteredItems.slice(start, end);

    console.log(
      "📄 Page items:",
      pageItems.length,
      "Start:",
      start,
      "End:",
      end,
    );

    return pageItems;
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    const sorted = [...items].sort((a: UserWithStats, b: UserWithStats) => {
      let first: any;
      let second: any;

      switch (sortDescriptor.column) {
        case "user":
          first = a.name;
          second = b.name;
          break;
        case "role":
          first = a.role;
          second = b.role;
          break;
        case "rating":
          first = a.averageRating || 0;
          second = b.averageRating || 0;
          break;
        case "status":
          first = a.isActive;
          second = b.isActive;
          break;
        default:
          first = a[sortDescriptor.column as keyof UserWithStats];
          second = b[sortDescriptor.column as keyof UserWithStats];
      }

      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });

    console.log("📊 Sorted items for table:", sorted.length);

    return sorted;
  }, [sortDescriptor, items]);

  // Handlers
  const handleUserClick = (user: UserWithStats) => {
    setSelectedUser(user);
  };

  const handleEditUser = (user: UserWithStats) => {
    console.log("handleEditUser called with user:", user);
    console.log("Current groups state:", groups);
    console.log("Current courses state:", courses);

    // Initialize the user with proper groups and courses arrays
    const userWithArrays = {
      ...user,
      groups: user.group ? [user.group] : [], // Convert single group to array
      courses: user.courses || [], // Ensure courses array exists
    };

    // If user is a student, try to fetch their enrolled courses
    if (user.role === "STUDENT" && user.groupId) {
      // Find the user's current group
      const currentGroup = groups.find((g) => g.id === user.groupId);

      console.log("Found current group:", currentGroup);
      if (currentGroup && currentGroup.course) {
        // Add the course from their group to their courses
        userWithArrays.courses = [currentGroup.course];
        console.log("Added course from group:", currentGroup.course);
      }
    }

    console.log("Editing user with data:", userWithArrays);
    setEditingUser(userWithArrays);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await apiClient.deleteUser(userId);
      const updatedUsers = users.filter((u) => u.id !== userId);

      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      alert("Please fill all required fields");

      return;
    }

    try {
      const userData = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as "ADMIN" | "TEACHER" | "STUDENT",
        groupId: newUser.groupId || undefined,
        isActive: newUser.isActive ?? true,
        level: newUser.level || undefined,
      };

      // Create user via API (this would need to be implemented)
      const response = await apiClient.createUser(userData);

      if (response.data) {
        // Refresh the user list
        await loadData();
      }

      setNewUser({
        name: "",
        email: "",
        role: "STUDENT",
        isActive: true,
      });
      setIsCreatingUser(false);
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    }
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      // Prepare the primary group (first selected group)
      const primaryGroupId =
        editingUser.groups && editingUser.groups.length > 0
          ? editingUser.groups[0].id
          : undefined;

      // Prepare course IDs for API
      const courseIds = editingUser.courses?.map((c: any) => c.id) || [];

      // Update user via API
      await apiClient.updateUser({
        id: editingUser.id,
        firstName: editingUser.name.split(" ")[0],
        lastName: editingUser.name.split(" ").slice(1).join(" "),
        email: editingUser.email,
        role: editingUser.role,
        groupId: primaryGroupId,
        level: editingUser.level,
        isActive: editingUser.isActive,
        courseIds: courseIds,
      });

      // TODO: Update multiple group assignments when API supports it
      // Course assignments are now handled ✅

      // Update local state
      const updatedUsers = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              ...editingUser,
              group:
                editingUser.groups && editingUser.groups.length > 0
                  ? editingUser.groups[0]
                  : undefined,
              groupId: primaryGroupId,
            }
          : u,
      );

      setUsers(updatedUsers);
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  // Render functions
  const renderCell = React.useCallback(
    (user: UserWithStats, columnKey: React.Key) => {
      const cellValue = user[columnKey as keyof UserWithStats];

      switch (columnKey) {
        case "user":
          return (
            <User
              avatarProps={{
                radius: "full",
                size: "sm",
                src: user.avatar,
                name: user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join(""),
                classNames: {
                  base: "bg-[#007EFB] text-white font-semibold",
                },
              }}
              classNames={{
                name: "text-black font-semibold",
                description: "text-slate-600 font-medium",
              }}
              description={user.email}
              name={user.name}
            />
          );
        case "role":
          return (
            <div className="flex flex-col gap-2">
              <Chip
                className="capitalize border-none font-semibold"
                color={roleColorMap[user.role]}
                size="sm"
                variant="flat"
              >
                {user.role === "ADMIN"
                  ? "Администратор"
                  : user.role === "TEACHER"
                    ? "Преподаватель"
                    : "Студент"}
              </Chip>
              {user.level && (
                <Chip
                  className="capitalize font-medium"
                  color="default"
                  size="sm"
                  variant="bordered"
                >
                  {user.level === "beginner"
                    ? "Начинающий"
                    : user.level === "elementary"
                      ? "Элементарный"
                      : user.level === "intermediate"
                        ? "Средний"
                        : user.level === "advanced"
                          ? "Продвинутый"
                          : user.level}
                </Chip>
              )}
            </div>
          );
        case "group":
          return (
            <div className="flex flex-col">
              {user.groups && user.groups.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {user.groups.slice(0, 2).map((group) => (
                    <Chip
                      key={group.id}
                      className="font-medium"
                      color="primary"
                      size="sm"
                      variant="flat"
                    >
                      {group.name}
                    </Chip>
                  ))}
                  {user.groups.length > 2 && (
                    <Chip
                      className="font-medium"
                      color="default"
                      size="sm"
                      variant="bordered"
                    >
                      +{user.groups.length - 2} еще
                    </Chip>
                  )}
                </div>
              ) : user.group ? (
                <Chip
                  className="font-medium"
                  color="primary"
                  size="sm"
                  variant="flat"
                >
                  {user.group.name}
                </Chip>
              ) : (
                <Chip
                  className="font-medium"
                  color="default"
                  size="sm"
                  variant="bordered"
                >
                  Не назначена
                </Chip>
              )}
            </div>
          );
        case "rating":
          return user.averageRating ? (
            <Chip
              className="font-semibold"
              color="warning"
              size="sm"
              variant="flat"
            >
              {user.averageRating.toFixed(1)} ⭐
            </Chip>
          ) : (
            <Chip
              className="font-medium"
              color="default"
              size="sm"
              variant="bordered"
            >
              Нет оценок
            </Chip>
          );
        case "status":
          return (
            <Chip
              className="capitalize font-semibold"
              color={statusColorMap[user.isActive ? "active" : "inactive"]}
              size="sm"
              variant="flat"
            >
              {user.isActive ? "Активен" : "Неактивен"}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown className="bg-background border-1 border-default-200">
                <DropdownTrigger>
                  <Button isIconOnly radius="full" size="sm" variant="light">
                    <VerticalDotsIcon />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key="view"
                    onClick={() => handleUserClick(user)}
                  >
                    View
                  </DropdownItem>
                  <DropdownItem key="edit" onClick={() => handleEditUser(user)}>
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return String(cellValue || "");
      }
    },
    [groups],
  );

  // Table controls
  const onRowsPerPageChange = React.useCallback((e: any) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            classNames={{
              base: "w-full sm:max-w-[44%]",
              inputWrapper: "border-1",
            }}
            placeholder="Search by name or email..."
            size="sm"
            startContent={<SearchIcon />}
            value={filterValue}
            variant="bordered"
            onClear={() => setFilterValue("")}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon />}
                  size="sm"
                  variant="flat"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Status Filter"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon />}
                  size="sm"
                  variant="flat"
                >
                  Role
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Role Filter"
                closeOnSelect={false}
                selectedKeys={roleFilter}
                selectionMode="multiple"
                onSelectionChange={setRoleFilter}
              >
                {roleOptions.map((role) => (
                  <DropdownItem key={role.uid} className="capitalize">
                    {capitalize(role.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              className="bg-[#007EFB] text-white"
              endContent={<PlusIcon />}
              size="sm"
              onClick={() => setIsCreatingUser(true)}
            >
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {users.length} users
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small ml-2"
              value={rowsPerPage}
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    roleFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    users.length,
    hasSearchFilter,
    rowsPerPage,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
          classNames={{
            cursor: "bg-[#007EFB] text-white",
          }}
          color="primary"
          isDisabled={hasSearchFilter}
          page={page}
          total={pages}
          variant="light"
          onChange={setPage}
        />
        <span className="text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${items.length} selected`}
        </span>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-slate-200 rounded w-1/3 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-slate-200 rounded" />
              ))}
            </div>
            <div className="h-96 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white lg:ml-4 xl:ml-0">
        {/* Hero Section */}
        <div className="pt-12 mb-8">
          <h1 className="text-5xl font-bold text-black tracking-tight">
            {user?.role === "ADMIN"
              ? "Управление пользователями"
              : "Просмотр системы"}{" "}
            👨‍💼
          </h1>
          <p className="text-black/70 text-xl font-medium mt-2">
            {user?.role === "ADMIN"
              ? "Просмотр и управление всеми пользователями системы"
              : "Просмотр групп и курсов в системе"}
          </p>
        </div>

        {/* Main Content */}
        {/* Debug Info */}
        <div className="bg-slate-100 p-4 rounded-lg mb-4 text-sm">
          <strong>Debug Info:</strong>
          <br />• Users loaded: {users.length}{" "}
          {user?.role !== "ADMIN" ? "(Admin only)" : ""}
          <br />• Groups available: {groups.length}
          <br />• Courses available: {courses.length}
          <br />• Filtered items: {filteredItems.length}
          <br />• Auth: {user?.email || "Not logged in"} (
          {user?.role || "No role"})
        </div>

        <div className="space-y-8 lg:space-y-12">
          {/* Users Section */}
          <section className="relative">
            <div className="flex items-center justify-between mb-8 lg:mb-10">
              <div className="flex items-center gap-4">
                {user?.role === "ADMIN" && (
                  <Button
                    className="bg-[#007EFB] text-white font-semibold"
                    color="primary"
                    size="lg"
                    variant="flat"
                    onClick={() => setIsCreatingUser(true)}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                    Добавить пользователя
                  </Button>
                )}
              </div>
            </div>

            <Table
              isCompact
              removeWrapper
              aria-label="Admin users table"
              bottomContent={bottomContent}
              bottomContentPlacement="outside"
              classNames={{
                wrapper: ["max-h-[600px]"],
                th: [
                  "bg-slate-50",
                  "text-slate-700",
                  "border-b",
                  "border-slate-200",
                  "font-semibold",
                  "text-sm",
                ],
                td: ["py-3", "border-b", "border-slate-100"],
              }}
              selectedKeys={selectedKeys}
              selectionMode="multiple"
              sortDescriptor={sortDescriptor}
              topContent={topContent}
              topContentPlacement="outside"
              onSelectionChange={setSelectedKeys}
              onSortChange={setSortDescriptor}
            >
              <TableHeader columns={headerColumns}>
                {(column: any) => (
                  <TableColumn
                    key={column.uid}
                    align={column.uid === "actions" ? "center" : "start"}
                    allowsSorting={column.sortable}
                  >
                    {column.name}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody
                emptyContent={
                  user?.role === "ADMIN"
                    ? "No users found"
                    : "Groups and courses are available in the dropdowns above"
                }
                items={sortedItems}
              >
                {(item: any) => (
                  <TableRow key={item.id}>
                    {(columnKey: any) => (
                      <TableCell>{renderCell(item, columnKey)}</TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </section>
        </div>

        {/* User Details Modal */}
        <Modal
          isOpen={!!selectedUser}
          size="2xl"
          onClose={() => setSelectedUser(null)}
        >
          <ModalContent className="bg-white border border-slate-200/60 rounded-3xl">
            <ModalHeader className="text-black font-bold text-xl">
              User Details
            </ModalHeader>
            <ModalBody>
              {selectedUser && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#007EFB] rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black">
                        {selectedUser.name}
                      </h3>
                      <p className="text-black/70">{selectedUser.email}</p>
                      <Chip
                        className="mt-2"
                        color={roleColorMap[selectedUser.role]}
                        variant="flat"
                      >
                        {selectedUser.role === "ADMIN"
                          ? "Администратор"
                          : selectedUser.role === "TEACHER"
                            ? "Преподаватель"
                            : "Студент"}
                      </Chip>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-black/70 text-sm">Level</p>
                      <p className="font-semibold text-black">
                        {selectedUser.level || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-black/70 text-sm">Group</p>
                      <p className="font-semibold text-black">
                        {selectedUser.groupId
                          ? groups.find((g) => g.id === selectedUser.groupId)
                              ?.name
                          : "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-black/70 text-sm">Registration Date</p>
                      <p className="font-semibold text-black">
                        {new Date(selectedUser.createdAt).toLocaleDateString(
                          "en-US",
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-black/70 text-sm">Status</p>
                      <Chip
                        color={selectedUser.isActive ? "success" : "danger"}
                        size="sm"
                        variant="flat"
                      >
                        {selectedUser.isActive ? "Active" : "Inactive"}
                      </Chip>
                    </div>
                  </div>

                  {selectedUser.averageRating && (
                    <div>
                      <h4 className="font-semibold text-black mb-3">Rating</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-black">
                          {selectedUser.averageRating.toFixed(1)}
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-5 h-5 ${
                                star <= selectedUser.averageRating!
                                  ? "text-yellow-400 fill-current"
                                  : "text-default-300"
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  if (selectedUser) {
                    handleEditUser(selectedUser);
                    setSelectedUser(null);
                  }
                }}
              >
                Edit
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={!!editingUser}
          size="4xl"
          onClose={() => setEditingUser(null)}
        >
          <ModalContent className="bg-white border border-slate-200/60 rounded-3xl">
            <ModalHeader className="text-black font-bold text-xl">
              Edit User - {editingUser?.name}
            </ModalHeader>
            <ModalBody>
              {editingUser && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-black mb-4">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Name"
                        value={editingUser.name}
                        variant="bordered"
                        onChange={(e: any) =>
                          setEditingUser({
                            ...editingUser,
                            name: e.target.value,
                          })
                        }
                      />
                      <Input
                        label="Email"
                        value={editingUser.email}
                        variant="bordered"
                        onChange={(e: any) =>
                          setEditingUser({
                            ...editingUser,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <Select
                          classNames={{
                            label: "font-semibold text-black",
                            trigger: "font-medium",
                          }}
                          label="Role"
                          selectedKeys={[editingUser.role]}
                          variant="bordered"
                          onSelectionChange={(keys) => {
                            const selectedRole = Array.from(keys)[0] as
                              | "ADMIN"
                              | "TEACHER"
                              | "STUDENT";

                            setEditingUser({
                              ...editingUser,
                              role: selectedRole,
                            });
                          }}
                        >
                          <SelectItem key="ADMIN">Administrator</SelectItem>
                          <SelectItem key="TEACHER">Teacher</SelectItem>
                          <SelectItem key="STUDENT">Student</SelectItem>
                        </Select>
                      </div>

                      {editingUser.role === "STUDENT" && (
                        <>
                          <div>
                            <Select
                              classNames={{
                                label: "font-semibold text-black",
                                trigger: "font-medium",
                              }}
                              label="Level"
                              selectedKeys={
                                editingUser.level ? [editingUser.level] : []
                              }
                              variant="bordered"
                              onSelectionChange={(keys) => {
                                const selectedLevel = Array.from(
                                  keys,
                                )[0] as string;

                                setEditingUser({
                                  ...editingUser,
                                  level: selectedLevel || undefined,
                                });
                              }}
                            >
                              {LEVEL_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  textValue={option.label}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </Select>
                          </div>

                          <div>
                            <Select
                              classNames={{
                                label: "font-semibold text-black",
                                trigger: "font-medium",
                              }}
                              label="Groups"
                              selectedKeys={
                                editingUser.groups?.map((g) => g.id) || []
                              }
                              selectionMode="multiple"
                              variant="bordered"
                              onSelectionChange={(keys) => {
                                const selectedGroupIds = Array.from(
                                  keys,
                                ) as string[];
                                const selectedGroups = groups.filter((g) =>
                                  selectedGroupIds.includes(g.id),
                                );

                                setEditingUser({
                                  ...editingUser,
                                  groups: selectedGroups,
                                  groupId:
                                    selectedGroups.length > 0
                                      ? selectedGroups[0].id
                                      : undefined,
                                });
                              }}
                            >
                              {groups && groups.length > 0 ? (
                                groups.map((group) => (
                                  <SelectItem key={group.id}>
                                    {group.name} ({group.level}) -{" "}
                                    {group._count?.students || 0} студентов
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem key="no-groups" isDisabled>
                                  {isLoading
                                    ? "Загрузка групп..."
                                    : "Нет доступных групп"}
                                </SelectItem>
                              )}
                            </Select>
                            {editingUser.groups &&
                              editingUser.groups.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs text-slate-600 mb-2">
                                    Selected Groups:
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {editingUser.groups.map((group) => (
                                      <Chip
                                        key={group.id}
                                        className="font-medium"
                                        color="primary"
                                        size="sm"
                                        variant="flat"
                                        onClose={() => {
                                          const newGroups =
                                            editingUser.groups?.filter(
                                              (g) => g.id !== group.id,
                                            ) || [];

                                          setEditingUser({
                                            ...editingUser,
                                            groups: newGroups,
                                            groupId:
                                              newGroups.length > 0
                                                ? newGroups[0].id
                                                : undefined,
                                          });
                                        }}
                                      >
                                        {group.name}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        </>
                      )}

                      <div className="flex items-center gap-3 mt-6">
                        <Checkbox
                          classNames={{
                            label: "font-semibold text-black",
                          }}
                          isSelected={editingUser.isActive}
                          onValueChange={(checked) =>
                            setEditingUser({
                              ...editingUser,
                              isActive: checked,
                            })
                          }
                        >
                          Dashboard Access
                        </Checkbox>
                      </div>
                    </div>
                  </div>

                  {/* User Statistics */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-black mb-4">
                      User Statistics
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#007EFB]">
                          {editingUser.totalFeedbacks || 0}
                        </div>
                        <div className="text-sm text-slate-600">
                          Total Feedback
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#00B67A]">
                          {editingUser.averageRating
                            ? editingUser.averageRating.toFixed(1)
                            : "—"}
                        </div>
                        <div className="text-sm text-slate-600">
                          Average Rating
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#FDD130]">
                          {new Date(editingUser.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-slate-600">Joined</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#EE7A3F]">
                          {new Date(
                            editingUser.lastActiveDate || editingUser.updatedAt,
                          ).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-slate-600">
                          Last Active
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Avatar Upload */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-black mb-4">
                      Profile Picture
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#007EFB] rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {editingUser.avatar ? (
                          <img
                            alt={editingUser.name}
                            className="w-full h-full rounded-full object-cover"
                            src={editingUser.avatar}
                          />
                        ) : (
                          editingUser.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        )}
                      </div>
                      <div>
                        <Button size="sm" variant="bordered">
                          Upload New Photo
                        </Button>
                        <p className="text-xs text-slate-600 mt-1">
                          JPG, PNG up to 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Course Management */}
                  {editingUser.role === "STUDENT" && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-black mb-4">
                        Course Management
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Select
                            classNames={{
                              label: "font-semibold text-black",
                              trigger: "font-medium",
                            }}
                            label="Available Courses"
                            selectedKeys={
                              editingUser.courses?.map((c: any) => c.id) || []
                            }
                            selectionMode="multiple"
                            variant="bordered"
                            onSelectionChange={(keys) => {
                              const selectedCourseIds = Array.from(
                                keys,
                              ) as string[];
                              const selectedCourses = courses.filter((c) =>
                                selectedCourseIds.includes(c.id),
                              );

                              setEditingUser({
                                ...editingUser,
                                courses: selectedCourses,
                              });
                            }}
                          >
                            {courses && courses.length > 0 ? (
                              courses.map((course) => (
                                <SelectItem key={course.id}>
                                  <div>
                                    <div className="font-medium">
                                      {course.name}
                                    </div>
                                    {course.description && (
                                      <div className="text-xs text-slate-500">
                                        {course.description}
                                      </div>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem key="no-courses" isDisabled>
                                {isLoading
                                  ? "Загрузка курсов..."
                                  : "Нет доступных курсов"}
                              </SelectItem>
                            )}
                          </Select>
                        </div>

                        {editingUser.courses &&
                          editingUser.courses.length > 0 && (
                            <div>
                              <div className="text-xs text-slate-600 mb-2">
                                Enrolled Courses:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {editingUser.courses.map((course: any) => (
                                  <Chip
                                    key={course.id}
                                    className="font-medium"
                                    color="success"
                                    size="sm"
                                    variant="flat"
                                    onClose={() => {
                                      setEditingUser({
                                        ...editingUser,
                                        courses:
                                          editingUser.courses?.filter(
                                            (c: any) => c.id !== course.id,
                                          ) || [],
                                      });
                                    }}
                                  >
                                    {course.name}
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button color="primary" onClick={handleSaveUser}>
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Create User Modal */}
        <Modal
          isOpen={isCreatingUser}
          size="2xl"
          onClose={() => setIsCreatingUser(false)}
        >
          <ModalContent className="bg-white border border-slate-200/60 rounded-3xl">
            <ModalHeader className="text-black font-bold text-xl">
              Create New User
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    isRequired
                    label="Name *"
                    placeholder="Enter name"
                    value={newUser.name || ""}
                    variant="bordered"
                    onChange={(e: any) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                  />
                  <Input
                    isRequired
                    label="Email *"
                    placeholder="Enter email"
                    type="email"
                    value={newUser.email || ""}
                    variant="bordered"
                    onChange={(e: any) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    isRequired
                    label="Role *"
                    selectedKeys={newUser.role ? [newUser.role] : []}
                    variant="bordered"
                    onSelectionChange={(keys) => {
                      const selectedRole = Array.from(keys)[0] as
                        | "ADMIN"
                        | "TEACHER"
                        | "STUDENT";

                      setNewUser({ ...newUser, role: selectedRole });
                    }}
                  >
                    <SelectItem key="ADMIN">Administrator</SelectItem>
                    <SelectItem key="TEACHER">Teacher</SelectItem>
                    <SelectItem key="STUDENT">Student</SelectItem>
                  </Select>

                  {newUser.role === "STUDENT" && (
                    <Select
                      label="Group"
                      selectedKeys={newUser.groupId ? [newUser.groupId] : []}
                      variant="bordered"
                      onSelectionChange={(keys) => {
                        const selectedGroupId = Array.from(keys)[0] as string;

                        setNewUser({ ...newUser, groupId: selectedGroupId });
                      }}
                    >
                      {groups && groups.length > 0 ? (
                        groups.map((group) => (
                          <SelectItem key={group.id}>
                            {group.name} ({group.level})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem key="no-groups" isDisabled>
                          {isLoading
                            ? "Загрузка групп..."
                            : "Нет доступных групп"}
                        </SelectItem>
                      )}
                    </Select>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    checked={newUser.isActive ?? true}
                    className="rounded border-slate-300"
                    id="newUserActive"
                    type="checkbox"
                    onChange={(e: any) =>
                      setNewUser({ ...newUser, isActive: e.target.checked })
                    }
                  />
                  <label className="text-black" htmlFor="newUserActive">
                    Active User
                  </label>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onClick={() => setIsCreatingUser(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#007EFB] hover:bg-[#007EFB]/90"
                color="primary"
                onClick={handleCreateUser}
              >
                Create User
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
