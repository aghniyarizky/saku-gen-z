"use client";

import { useState } from "react";
import 'material-icons/iconfont/material-icons.css';

interface LoginProps {
  onSwitchToRegister: () => void;
  onSwitchLanding: () => void;
  onLoginSuccess?: (data: any) => void;
}

export default function LoginPage({ onSwitchToRegister, onSwitchLanding, onLoginSuccess }: LoginProps) {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = true;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password,
        }),
      });

      const teksResponse = await response.text();

      if (!response.ok) {
        console.error("ISI ERROR LOGIN DARI SERVER:", teksResponse);

        let message = "Terjadi kesalahan pada server backend.";
        try {
          const parsedError = JSON.parse(teksResponse);
          message = parsedError.message || message;
        } catch {
        }

        throw new Error(message);
      }

      const resData = JSON.parse(teksResponse);
      setSuccess(true);
      
      if (resData.data) {
        localStorage.setItem("token", resData.data);
      }

      const loggedInUser = resData.user?.username || resData.username || formData.identifier;
      localStorage.setItem("username", loggedInUser);

      if (resData.user) {
        localStorage.setItem("user", JSON.stringify(resData.user));
      }

      const userEmail = formData.identifier;
      setFormData({ identifier: "", password: "" });

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(userEmail);
        }
      }, 1000);

    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-[#6C63F2]/5">

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center px-14">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#6C63F2]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#6C63F2]/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-[#2EC4B6]/20 bg-[#6C63F2]">
              <span className="material-icons text-wh text-xl">account_balance_wallet</span>
            </div>
            <span className="text-gray-600 font-extrabold text-lg tracking-tight">FinZen</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-gray-600 bg-clip-text mb-4">
            Kelola Keuanganmu, <br />
            <span className="bg-linear-to-r from-[#6C63F2] to-[#1dae9f] bg-clip-text text-transparent">
              Bikin Lebih Sehat.
            </span>
          </h1>

          <p className="text-gray-600 text-sm font-semibold leading-relaxed mb-10">
            Pantau pemasukan, pengeluaran, dan target tabunganmu sebagai mahasiswa
            dalam satu dashboard yang simpel dan intuitif.
          </p>

          <div className="space-y-4">
            {[
              { icon: "insights", text: "Ringkasan keuangan real-time" },
              { icon: "savings", text: "Target nabung yang bisa dipantau" },
              { icon: "shield", text: "Data kamu aman & terenkripsi" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-9 h-9 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="material-icons text-[#6C63F2] text-base">{item.icon}</span>
                </div>
                <span className="text-gray-600 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 min-h-screen px-8 py-12 flex flex-col justify-center bg-[#F8F9FC] relative overflow-hidden">
        <div className="absolute top-6 left-0 right-0 w-full px-8">
          <div className="w-full lg:max-w-md lg:mx-auto">
            <div className="w-10 mb-5">
              <div
                onClick={onSwitchLanding}
                className="flex items-center justify-center w-full aspect-square bg-[#3E3E3E] rounded-full border-2 border-white cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <span className="material-icons text-lg text-white">arrow_back</span>
              </div>
            </div>

            <h2 className="text-4xl font-extrabold tracking-tight text-center leading-snug text-[#6C63F2]">
              Yuk, Lanjut Kelola Keuanganmu!
            </h2>

            <p className="text-sm mt-3 text-gray-600 font-medium text-center leading-snug">
              Masuk ke FinZen dan lihat perkembangan finansialmu <br /> dengan mudah.
            </p>

            <div className="p-4">
              <div className="w-full from-transparent via-gray-400 to-transparent rounded-full p-px mb-4">
                <div className="relative w-full bg-[#E5E7EF] rounded-full p-1 text-white overflow-hidden">

                  <div
                    className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-full transition-transform duration-300 ease-out ${
                      isLogin ? "translate-x-0" : "translate-x-full"
                    }`}
                  />

                  <div className="relative flex flex-row items-center w-full z-10">
                    <div className="w-1/2">
                      <button
                        type="button"
                        className={`w-full text-center py-2 font-semibold transition-colors duration-300 cursor-pointer ${
                          isLogin ? "text-gray-500" : "text-gray-400 hover:text-white"
                        }`}
                      >
                        Login
                      </button>
                    </div>

                    <div className="w-1/2">
                      <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className={`w-full text-center py-2 font-semibold transition-colors duration-300 cursor-pointer ${
                          !isLogin ? "text-white" : "text-gray-500 hover:text-gray-600"
                        }`}
                      >
                        Register
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {error && (
                <div className="p-3 mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-xl backdrop-blur-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 mb-4 text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-900 rounded-xl backdrop-blur-sm">
                  Login berhasil! Mengalihkan ke dashboard...
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold tracking-wider text-gray-800">Username / Email</label>
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-400 backdrop-blur-md focus-within:ring-2 focus-within:ring-[#6C63F2] focus-within:border-transparent transition-all">
                    <span className="material-icons text-gray-300 text-sm select-none">person</span>
                    <input
                      type="text"
                      name="identifier"
                      value={formData.identifier}
                      onChange={handleChange}
                      placeholder="Masukkan Username/Email Anda"
                      className="w-full bg-transparent text-xs text-gray-600 placeholder-gray-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold tracking-wider text-gray-800">Password</label>
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-400 backdrop-blur-md focus-within:ring-2 focus-within:ring-[#6C63F2] focus-within:border-transparent transition-all">
                    <span className="material-icons text-gray-300 text-sm select-none">lock</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Masukkan Password Anda"
                      className={`w-full bg-transparent text-gray-600 placeholder-gray-400 focus:outline-none placeholder:text-xs ${
                        showPassword
                          ? "text-xs tracking-normal"
                          : "text-base tracking-widest placeholder-shown:tracking-normal"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-300 hover:text-gray-600 transition-colors focus:outline-none flex items-center cursor-pointer"
                    >
                      <span className="material-icons text-xs select-none">
                        {showPassword ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between font-urbanist">
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      className="w-4 h-4 rounded bg-[#1B1B1B] border-gray-600 accent-[#6C63F2] cursor-pointer transition-all"
                    />
                    <span>Ingat Saya</span>
                  </label>

                  <a href="#" className="text-xs text-[#6C63F2] hover:underline font-medium">
                    Lupa Password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 mt-2 bg-[#6C63F2] hover:bg-[#5a52d9] text-white font-bold rounded-full shadow-lg shadow-blue-950/50 transition-all active:scale-[0.98] cursor-pointer disabled:bg-gray-600"
                >
                  {loading ? "Memproses..." : "Masuk"}
                </button>

              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}