"use client";

import { Avatar } from "@heroui/avatar";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 lg:ml-4 xl:ml-0">
      {/* Hero Section */}
      <div className="pt-12 mb-8">
        <h1 className="text-5xl font-bold text-black dark:text-white tracking-tight">Настройки ⚙️</h1>
        <p className="text-black/70 dark:text-white/70 text-xl font-medium mt-2">Управляй своим профилем и аккаунтом</p>
      </div>

      {/* Profile Section */}
      <div className="bg-gradient-to-br from-[#007EFB]/5 via-[#EE7A3F]/5 to-[#FDD130]/5 border border-[#007EFB]/20 rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#007EFB]/10 to-[#EE7A3F]/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#007EFB]/10 rounded-2xl">
                <svg className="w-7 h-7 text-[#007EFB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-3xl text-black dark:text-white">Профиль</h2>
                <p className="text-black/70 dark:text-white/70 font-medium text-base">Обнови свои личные данные</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <Avatar 
                size="lg" 
                name="Елена Гарсия" 
                className="text-white bg-[#007EFB] border-2 border-white" 
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <Button 
              variant="light" 
              className="font-bold text-[#007EFB] hover:text-[#007EFB]/80 hover:bg-[#007EFB]/10"
            >
              Изменить фото
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input 
                label="Имя" 
                placeholder="Введите имя" 
                variant="bordered" 
                classNames={{
                  label: "font-bold text-black dark:text-white",
                  input: "font-medium text-black dark:text-white",
                  inputWrapper: "bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-600/60 focus-within:border-[#007EFB] shadow-none"
                }}
              />
            <Input 
              label="Фамилия" 
              placeholder="Введите фамилию" 
              variant="bordered" 
              classNames={{
                label: "font-bold text-black dark:text-white",
                input: "font-medium text-black dark:text-white",
                inputWrapper: "bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-600/60 focus-within:border-[#007EFB] shadow-none"
              }}
            />
            <Input 
              label="Email" 
              type="email" 
              placeholder="you@tutorium.io" 
              variant="bordered" 
              classNames={{
                label: "font-bold text-black dark:text-white",
                input: "font-medium text-black dark:text-white",
                inputWrapper: "bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-600/60 focus-within:border-[#007EFB] shadow-none"
              }}
            />
            <Input 
              label="Телефон" 
              type="tel" 
              placeholder="+34 600 000 000" 
              variant="bordered" 
              classNames={{
                label: "font-bold text-black dark:text-white",
                input: "font-medium text-black dark:text-white",
                inputWrapper: "bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-600/60 focus-within:border-[#007EFB] shadow-none"
              }}
            />
          </div>
          
          <div className="flex justify-end mt-8">
            <Button 
              className="font-bold text-white bg-[#007EFB] hover:bg-[#007EFB]/90 px-8"
              size="lg"
            >
              Сохранить изменения
            </Button>
          </div>
        </div>
      </div>

      {/* Connected Apps Section */}
      <div className="bg-gradient-to-br from-[#EE7A3F]/5 via-[#FDD130]/5 to-[#00B67A]/5 border border-[#EE7A3F]/20 rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#EE7A3F]/10 to-[#FDD130]/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#EE7A3F]/10 rounded-2xl">
              <svg className="w-7 h-7 text-[#EE7A3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-3xl text-black">Подключенные приложения</h2>
              <p className="text-black/70 font-medium text-base">Управляй интеграциями и уведомлениями</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0088CC] rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321-.023.436-.065.121-.042.358-.24.358-.563s-.237-.521-.358-.563c-.115-.042-.336-.063-.436-.065-.224-.003-.483.145-.687.31l-.314.31c-.17.17-.367.336-.367.336s-.367.166-.367-.336c0-.17.17-.336.367-.336l.314-.31c.204-.165.463-.313.687-.31zm-4.962 0c.224-.003.483.145.687.31l.314.31c.17.17.367.336.367.336s.367.166.367-.336c0-.17-.17-.336-.367-.336l-.314-.31c-.204-.165-.463-.313-.687-.31-.1.002-.321.023-.436.065-.121.042-.358.24-.358.563s.237.521.358.563c.115.042.336.063.436.065z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-black text-lg">Telegram</h3>
                    <p className="text-black/70 font-medium text-sm">Переподключи свой аккаунт Telegram через бота</p>
                  </div>
                </div>
                <Button 
                  className="font-bold text-white bg-[#0088CC] hover:bg-[#0088CC]/90 px-6"
                >
                  Переподключить
                </Button>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#007EFB] rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-black text-lg">Email уведомления</h3>
                    <p className="text-black/70 font-medium text-sm">Управляй важными обновлениями и напоминаниями</p>
                  </div>
                </div>
                <Button 
                  variant="light" 
                  className="font-bold text-[#007EFB] hover:text-[#007EFB]/80 hover:bg-[#007EFB]/10 px-6"
                >
                  Управлять
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Settings Section */}
      <div className="bg-gradient-to-br from-[#00B67A]/5 via-[#007EFB]/5 to-[#EE7A3F]/5 border border-[#00B67A]/20 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00B67A]/10 to-[#007EFB]/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#00B67A]/10 rounded-2xl">
              <svg className="w-7 h-7 text-[#00B67A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
                          <div>
                <h2 className="font-bold text-3xl text-black dark:text-white">Дополнительные настройки</h2>
                <p className="text-black/70 dark:text-white/70 font-medium text-base">Персонализируй свой опыт обучения</p>
              </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#007EFB]/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#007EFB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-black dark:text-white text-base">Темная тема</h3>
                  <p className="text-black/70 dark:text-white/70 font-medium text-sm">
                    {theme === 'dark' ? 'Темный режим активен' : 'Переключи на темный режим'}
                  </p>
                </div>
              </div>
              <Button 
                variant="light" 
                className="w-full font-bold text-[#007EFB] hover:text-[#007EFB]/80 hover:bg-[#007EFB]/10"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? 'Выключить' : 'Включить'}
              </Button>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#EE7A3F]/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#EE7A3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V4a1 1 0 00-1-1H5a1 1 0 00-1 1v1zm0 6h6V9H4v2zm0 4h6v-2H4v2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-black dark:text-white text-base">Язык интерфейса</h3>
                  <p className="text-black/70 dark:text-white/70 font-medium text-sm">Измени язык приложения</p>
                </div>
              </div>
              <Button 
                variant="light" 
                className="w-full font-bold text-[#EE7A3F] hover:text-[#EE7A3F]/80 hover:bg-[#EE7A3F]/10"
              >
                Русский
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


