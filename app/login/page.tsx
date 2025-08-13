"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { useAuth } from "@/lib/auth/context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("TEACHER");

  const { login, register, user, token } = useAuth();
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState("/dashboard");

  // Get redirect parameter from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get("redirect");
      if (redirect) {
        setRedirectTo(redirect);
      }
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (token && user) {
      window.location.href = redirectTo;
    }
  }, [token, user, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let result;

      if (isRegistering) {
        result = await register(name, email, password, role);
      } else {
        result = await login(email, password);
      }

      if (result.success) {
        // Force immediate redirect after successful login
        window.location.href = redirectTo;
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
  };

  if (token && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#007EFB] to-[#EE7A3F] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl text-white font-bold">T</span>
          </div>
          <h2 className="text-4xl font-bold text-black tracking-tight">
            {isRegistering ? "Создать аккаунт" : "Добро пожаловать"}
          </h2>
          <p className="text-black/70 text-lg font-medium mt-3">
            {isRegistering
              ? "Присоединяйтесь к Tutorium для изучения языков"
              : "Войдите в свой аккаунт Tutorium"}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {isRegistering && (
            <>
            <Input
              required
              classNames={{
                label: "font-bold text-black",
                input: "font-medium text-black",
                inputWrapper:
                  "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
              }}
              label="Полное имя"
              placeholder="Введите ваше полное имя"
              value={name}
              variant="bordered"
              onChange={(e) => setName(e.target.value)}
            />

            <div>
              <label
                className="block text-black font-bold text-sm mb-2"
                htmlFor="role-select"
              >
                Роль
              </label>
              <select
                required
                className="w-full px-4 py-3 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007EFB] focus:border-transparent bg-white font-medium text-black"
                id="role-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="TEACHER">Преподаватель</option>
                <option value="STUDENT">Студент</option>
                <option value="ADMIN">Администратор</option>
              </select>
            </div>
          </>
        )}

          <Input
            required
            classNames={{
              label: "font-bold text-black",
              input: "font-medium text-black",
              inputWrapper:
                "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
            }}
            label="Email"
            placeholder="Введите ваш email"
            type="email"
            value={email}
            variant="bordered"
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            required
            classNames={{
              label: "font-bold text-black",
              input: "font-medium text-black",
              inputWrapper:
                "bg-white border-slate-200/60 focus-within:border-[#007EFB] shadow-none",
            }}
            label="Пароль"
            placeholder="Введите ваш пароль"
            type="password"
            value={password}
            variant="bordered"
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 font-medium text-sm">{error}</p>
            </div>
          )}

          <Button
            className="w-full bg-[#007EFB] text-white hover:bg-[#007EFB]/90 font-bold py-4 text-lg rounded-xl transition-all duration-200"
            disabled={isLoading}
            type="submit"
          >
            {isLoading
              ? "Загрузка..."
              : isRegistering
                ? "Создать аккаунт"
                : "Войти"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button
            className="text-[#007EFB] hover:text-[#007EFB]/80 font-bold text-base transition-colors"
            type="button"
            onClick={toggleMode}
          >
            {isRegistering
              ? "Уже есть аккаунт? Войти"
              : "Нет аккаунта? Зарегистрироваться"}
          </button>
        </div>

        {/* Test Account Info */}
        <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200/60">
          <h3 className="font-bold text-black mb-3">
            Тестовый аккаунт
          </h3>
          <div className="text-sm text-black/70 space-y-2">
            <p>
              <strong className="text-black">Email:</strong> teacher@tutorium.com
            </p>
            <p>
              <strong className="text-black">Пароль:</strong> password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
