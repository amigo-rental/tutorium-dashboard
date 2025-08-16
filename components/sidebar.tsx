"use client";

import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { useAuth } from "@/lib/auth/context";

// Helper function to get level label
const getLevelLabel = (level: string) => {
  switch (level) {
    case "beginner":
      return "С нуля";
    case "elementary":
      return "Начинающий";
    case "intermediate":
      return "Продолжающий";
    case "advanced":
      return "Продвинутый";
    default:
      return level;
  }
};

// Icons - simple SVG components
const DashboardIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
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
);

const BookIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const TutorIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 14l9-5-9-5-9 5 9 5z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M12 14l9-5-9-5-9 5 9 5z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const UploadIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
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
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const MenuIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M4 6h16M4 12h16M4 18h16"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const LogoutIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

// Navigation items for different user roles
const getNavigationItems = (userRole: string) => {
  switch (userRole) {
    case "STUDENT":
      return [
        { name: "Главная", href: "/dashboard", icon: DashboardIcon },
        { name: "Группы", href: "/groups", icon: BookIcon },
        { name: "Настройки", href: "/settings", icon: SettingsIcon },
      ];
    case "TEACHER":
      return [
        { name: "Тьютор", href: "/tutor", icon: TutorIcon },
        { name: "Группы", href: "/groups", icon: BookIcon },
        { name: "Загрузчик", href: "/uploader", icon: UploadIcon },
        { name: "Настройки", href: "/settings", icon: SettingsIcon },
      ];
    case "ADMIN":
      return [
        { name: "Админ", href: "/admin", icon: SettingsIcon },
        { name: "Настройки", href: "/settings", icon: SettingsIcon },
      ];
    default:
      return [
        { name: "Главная", href: "/dashboard", icon: DashboardIcon },
        { name: "Настройки", href: "/settings", icon: SettingsIcon },
      ];
  }
};

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile menu button */}
      <Button
        isIconOnly
        className="lg:hidden fixed top-4 left-4 z-50"
        variant="light"
        onPress={onToggle}
      >
        <MenuIcon className="w-6 h-6" />
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          aria-label="Закрыть меню"
          className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          role="button"
          tabIndex={0}
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle();
            }
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-40 lg:z-0",
          "w-72 lg:w-80 xl:w-72",
          "transform lg:transform-none transition-transform duration-300 ease-in-out",
          "bg-white lg:bg-transparent",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <Card className="h-full rounded-none lg:rounded-3xl lg:m-4 lg:h-[calc(100vh-2rem)] border-slate-200/50 shadow-sm">
          <CardBody className="p-6 flex flex-col bg-white">
            {/* Navigation */}
            <nav className="flex-1">
              <ul className="space-y-2">
                {getNavigationItems(user?.role || "").map((item: any) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.name}>
                      <NextLink
                        className={clsx(
                          "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                          isActive
                            ? "bg-[#007EFB] text-white"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                        )}
                        href={item.href}
                        onClick={() => {
                          // Close mobile menu when navigating
                          if (window.innerWidth < 1024) {
                            onToggle();
                          }
                        }}
                      >
                        <Icon
                          className={clsx(
                            "w-5 h-5 flex-shrink-0 transition-transform duration-300",
                            isActive ? "scale-110" : "group-hover:scale-105",
                          )}
                        />
                        <span className="font-semibold">{item.name}</span>
                      </NextLink>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User Profile Section - Dynamic */}
            <div className="mt-auto pt-6 border-t border-slate-200/50">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <Avatar
                      className="text-white bg-[#007EFB] border-2 border-white"
                      name={user?.name || "User"}
                      size="md"
                      src={user?.avatar}
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-black text-base truncate">
                      {user?.name || "User"}
                    </h3>
                    <p className="text-black/70 font-medium text-sm truncate">
                      {user?.role === "TEACHER"
                        ? "Преподаватель"
                        : user?.role === "STUDENT"
                          ? `Ученик${user?.level ? ` • ${getLevelLabel(user.level)}` : ""}`
                          : user?.role === "ADMIN"
                            ? "Администратор"
                            : "Пользователь"}
                    </p>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="space-y-2">
                  <Button
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 font-medium flex items-center gap-2"
                    size="sm"
                    variant="light"
                    onClick={logout}
                  >
                    <LogoutIcon className="w-4 h-4" />
                    Выход
                  </Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </aside>
    </>
  );
}
