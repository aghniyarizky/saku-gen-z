"use client";

import { useState, useEffect } from "react";
import 'material-icons/iconfont/material-icons.css';

interface VerifyOTPProps {
  email: string;
  onSuccess: () => void;
  onBackToRegister?: () => void;
}

export default function VerifyOTPComponent({ email, onSuccess, onBackToRegister }: VerifyOTPProps) {
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 Menit

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const maskEmail = (userEmail: string) => {
    if (!userEmail || !userEmail.includes("@")) return "email Anda";
    const [name, domain] = userEmail.split("@");
    const maskedName = name.length > 2 ? `${name[0]}****${name[name.length - 1]}` : `${name[0]}****`;
    return `${maskedName}@${domain}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode }),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || "Verifikasi OTP gagal.");

      if (resData.data) {
        localStorage.setItem("token", resData.data);
      }

      setSuccess("Akun berhasil diaktifkan! Mengalihkan...");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || "Gagal mengirim ulang OTP.");

      setSuccess("Kode OTP baru telah dikirim ke email!");
      setCountdown(300);
      setOtpCode("");
    } catch (err: any) {
      setError(err.message);
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
           Masukkan Kode <span className="bg-linear-to-r from-[#6C63F2] to-[#1dae9f] bg-clip-text text-transparent">
              OTP
            </span>
          </h1>

          <p className="text-gray-600 text-sm font-semibold leading-relaxed mb-10">
            Kami telah mengirimkan kode OTP ke{" "}
            <span className="text-[#6C63F2] font-semibold">{maskEmail(email)}</span>. Masukkan kode tersebut untuk memverifikasi akun Anda.
          </p>

          <div className="space-y-4">
            {[
              { icon: "mark_email_read", text: "Cek inbox atau folder spam" },
              { icon: "timer", text: "Kode berlaku sementara" },
              { icon: "verified_user", text: "Akunmu jadi lebih aman" },
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
                onClick={onBackToRegister}
                className="flex items-center justify-center w-full aspect-square bg-[#3E3E3E] rounded-full border-2 border-white cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <span className="material-icons text-lg text-white">arrow_back</span>
              </div>
            </div>

            <div className="lg:hidden">
              <h2 className="bg-linear-to-r from-[#B4B4B5] to-white bg-clip-text text-transparent text-[32px] font-extrabold tracking-tight text-center">
                Masukkan Kode
                <span className="bg-linear-to-r from-[#6C63F2] to-[#BEEDE8] bg-clip-text text-transparent pl-2 text-center">
                  OTP
                </span>
              </h2>

              <p className="text-sm mt-3 text-gray-600 font-semibold mb-7 text-center tracking-normal">
                Kami telah mengirimkan kode OTP ke{" "}
                <span className="text-[#6C63F2] font-sm">{maskEmail(email)}</span>. Masukkan kode tersebut untuk memverifikasi akun Anda.
              </p>
            </div>

            <div className="w-full border-2 border-gray-200 rounded-xl p-px mb-8 mt-2 lg:mt-8">
              <div className="w-full rounded-xl p-3 text-white">
                <div className="flex flex-row gap-3 w-full items-center">
                  <div className="w-auto flex items-center justify-center font-bold text-gray-400 rounded-lg px-2.5 py-0.5 text-sm">
                    <span className="material-icons text-lg text-[#6C63F2]">info</span>
                  </div>
                  <div className="flex-1 text-xs md:text-sm text-gray-600 leading-relaxed font-medium">
                    Tidak menemukan email kode? Coba cek folder **Spam** atau **Promosi**.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl w-full">
              {error && (
                <div className="p-3 mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-xl backdrop-blur-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 mb-4 text-sm text-[#6C63F2] bg-emerald-950/40 border border-[#6C63F2] rounded-xl backdrop-blur-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleVerify} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold tracking-wider text-gray-700">Kode OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="XXXXXX"
                    className="w-full px-4 py-3 rounded-full border-2 border-gray-400  text-center tracking-[0.5em] text-lg font-bold text-[#6C63F2] backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#6C63F2] focus:border-transparent transition-all placeholder:tracking-normal placeholder:text-sm placeholder:font-normal"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="text-center text-xs text-gray-300 my-1">
                  {countdown > 0 ? (
                    <p>Kode kedaluwarsa dalam <span className="text-[#6C63F2] font-semibold">{formatTime(countdown)}</span></p>
                  ) : (
                    <p className="text-red-400 font-semibold">Kode OTP telah kedaluwarsa.</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={loading || countdown === 0} 
                  className="w-full py-2.5 mt-2 bg-[#6C63F2] hover:bg-[#5a52d0] text-white font-bold rounded-full shadow-lg shadow-blue-950/50 transition-all active:scale-[0.98] cursor-pointer disabled:bg-gray-500 disabled:text-gray-300"
                >
                  {loading ? "Memverifikasi..." : "Verifikasi Akun"}
                </button>
              </form>

              <div className="text-sm text-center mt-6">
                <button 
                  type="button" 
                  onClick={handleResend} 
                  disabled={loading || countdown > 0} 
                  className={`text-xs font-semibold bg-transparent border-none cursor-pointer transition-colors ${
                  countdown === 0 
                    ? "text-[#6C63F2] hover:underline cursor-pointer" 
                    : "text-gray-500 cursor-not-allowed"
                }`}
                >
                  Kirim Ulang OTP
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}