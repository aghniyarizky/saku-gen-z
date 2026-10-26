"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "material-icons/iconfont/material-icons.css";

interface LandingPageProps {
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
}

export default function LandingPage({
  onNavigateToLogin,
  onNavigateToRegister,
}: LandingPageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#E5E7EF]/50 text-white flex flex-col font-sans selection:bg-[#2EC4B6] selection:text-[#F8F9FC]">

      <header className="fixed top-0 z-50 w-full bg-[#F8F9FC]/90 backdrop-blur-md ">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="px-2 py-1.5 flex items-center justify-center bg-[#6C63F2] rounded-full">
              <span className="material-icons text-white">account_balance_wallet</span>
            </div>
            <span className="text-xl font-bold tracking-tight bg-gray-700 bg-clip-text text-transparent">
              FinZen
            </span>
          </div>

          {/* Desktop Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToLogin}
              className="px-5 py-2 text-sm font-bold bg-[#6C63F2]/15 text-[#6C63F2] rounded-full transition-colors cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={onNavigateToRegister}
              className="px-5 py-2 text-sm font-bold bg-[#6C63F2] hover:bg-[#5c53d4] text-[#F8F9FC] rounded-full shadow-md hover:shadow-[#6C63F2]/20 transition-all active:scale-95 cursor-pointer"
            >
              Mulai 
            </button>
          </div>

        </div>
      </header>

      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-0 right-0 z-50 w-72 h-full bg-[#0B111D] border-l border-gray-800 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          {/* Header Mobile Sidebar */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-800">
            <span className="text-lg font-bold text-[#2EC4B6]">Menu</span>
            <button
              onClick={closeMobileMenu}
              className="p-1 rounded-lg text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Action Buttons inside Sidebar */}
        <div className="flex flex-col gap-3 pt-6 border-t border-gray-800">
          <button
            onClick={() => {
              closeMobileMenu();
              onNavigateToLogin?.();
            }}
            className="w-full py-2.5 text-center font-semibold border bg-[#6C63F2]/15 text-[#6C63F2] hover:border-gray-500 rounded-full transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => {
              closeMobileMenu();
              onNavigateToRegister?.();
            }}
            className="w-full py-2.5 text-center font-bold bg-[#2EC4B6] hover:bg-[#23a89b] text-[#F8F9FC] rounded-full shadow-lg transition-all"
          >
            Mulai 
          </button>
        </div>
      </aside>

      <section className="relative px-6 py-20 lg:py-32 flex flex-col items-center text-center max-w-5xl mx-auto overflow-hidden">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight lg:leading-none">
          <span className="bg-[#1B1B2F] bg-clip-text text-transparent">
          Kelola Keuangan  <span className="bg-[#6C63F2] bg-clip-text text-transparent">Lebih Sehat</span>, <br className="hidden sm:inline" />
          </span>
          <span className="bg-[#1B1B2F] bg-clip-text text-transparent">
            Ambil Keputusan <span className="bg-[#6C63F2] bg-clip-text text-transparent">Lebih Bijak</span>
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl font-bold leading-relaxed">
          Mengelola keuangan bukan sekadar mencatat pengeluaran, tapi juga memahami kondisi finansial agar bisa mengambil keputusan yang lebih tepat di masa depan.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 max-w-full">
          <button
            onClick={onNavigateToRegister}
            className="w-full sm:w-auto px-8 py-3.5 text-base font-bold bg-[#6C63F2] hover:bg-[#5c53d4] text-[#F8F9FC] rounded-full shadow-xl shadow-[#6C63F2]/20 transition-all active:scale-95 cursor-pointer"
          >
            Mulai Sekarang &gt;
          </button>
          <button
            onClick={onNavigateToLogin}
            className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold bg-[#6C63F2]/15 text-[#6C63F2] hover:text-white hover:bg-[#6C63F2] rounded-full transition-all cursor-pointer"
          >
            Sudah punya akun
          </button>
        </div>
      </section>

      <section id="fitur" className="px-6 py-20 border-y">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#6C63F2] text-sm font-extrabold tracking-wide bg-[#6C63F2]/10 px-3.5 py-1 rounded-full border border-[#6C63F2]/30">
              Fitur Utama
            </span>
            <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-gray-700">
              Semua yang Kamu Butuhkan
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-500 font-semibold">
              Mulai dari mencatat pengeluaran sampai mengecek risiko pinjaman, semua bisa dilakukan dalam satu tempat.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 mx-5 md:mx-10 md:grid-cols-2 lg:grid-cols-2 gap-6 relative">
            
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#F8F9FC]  transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-3xl mb-4 group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Anggaran</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-semibold text-justify">
                  Atur budget bulanan sesuai kebutuhan dan lihat sisa anggaranmu secara real-time supaya pengeluaran tetap terkontrol.
                </p>
                <div className="p-px w-full bg-[#6C63F2] rounded-full mt-3"></div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#F8F9FC]  transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-3xl mb-4 group-hover:scale-110 transition-transform">
                  🤖
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Teman Hemat</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-semibold text-justify">
                  Punya pertanyaan soal keuangan? Tanya aja ke AI. Mulai dari cara hemat, ngatur uang bulanan, sampai tips soal pinjaman.
                </p>
                <div className="p-px w-full bg-[#6C63F2] rounded-full mt-3"></div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#F8F9FC]  transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-3xl mb-4 group-hover:scale-110 transition-transform">
                  📋
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Asesmen Pinjaman</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-semibold text-justify">
                  Masih ragu mau pinjam uang atau pakai paylater? AI akan bantu menganalisis apakah keputusan itu aman sesuai kondisi keuanganmu.
                </p>
                <div className="p-px w-full bg-[#F59E0B] rounded-full mt-3"></div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-[#F8F9FC]  transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-3xl mb-4 group-hover:scale-110 transition-transform">
                  🛡️
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Cari Aman</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-semibold text-justify">
                  Tempel pesan SMS atau WhatsApp yang mencurigakan, lalu AI akan membantu mengecek apakah itu penawaran pinjaman yang aman atau berpotensi penipuan.
                </p>
                <div className="p-px w-full bg-[#EF4444] rounded-full mt-3"></div>
              </div>          
            </div>

            {/* Card 5 */}
            <div className="p-6 rounded-2xl bg-[#F8F9FC]  transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-3xl mb-4 group-hover:scale-110 transition-transform">
                  ❤️
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">Financial Health</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-semibold text-justify">
                  Dapatkan skor Financial Health lengkap dengan penjelasan dan saran terpersonalisasi yang bisa membantu kondisi keuanganmu jadi jauh lebih baik.
                </p>
                <div className="p-px w-full bg-[#EF4444] rounded-full mt-3"></div>
              </div>
            </div>

            {/* Card 6 */}
            <div className="p-6 rounded-2xl bg-[#F8F9FC]  transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-3xl mb-4 group-hover:scale-110 transition-transform">
                  📊
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">Catatan Keuangan</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-semibold text-justify">
                  Catat pemasukan, pengeluaran, target tabungan, atau data pinjaman. Bisa manual atau scan struk untuk memantau kondisi keuanganmu.
                </p>
                <div className="p-px w-full bg-[#6C63F2] rounded-full mt-3"></div></div>
            </div>

          </div>
        </div>
      </section>

      <section id="cara-kerja" className="px-6 py-20 max-w-4xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#6C63F2] text-sm font-extrabold tracking-wide bg-[#6C63F2]/10 px-3.5 py-1 rounded-full border border-[#6C63F2]/30">
            Cara Kerja
          </span>
            <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-gray-700">
            Mulai dalam 3 Langkah Mudah
          </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-500 font-semibold">
            Nggak ribet, cukup beberapa langkah untuk mulai mengelola keuanganmu dengan lebih baik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-start">
          
          {/* Step 1 desktop*/}
          <div className="hidden sm:flex p-6 rounded-2xl bg-[#F8F9FC] flex-col relative overflow-hidden">
            <span className="text-xl font-bold text-[#6C63FF] bg-[#EAE8FF] rounded-full px-3 w-fit mb-2 leading-tight">
            01
            </span>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Buat Akun
            </h3>
            <p className="text-sm sm:text-sm text-gray-500 leading-relaxed z-10 font-semibold text-justify">
              Daftar, verifikasi email, lalu lengkapi profilmu.
            </p>
          </div>

          {/* Step 1 mobile */}
          <div className="sm:hidden p-6 rounded-2xl bg-[#F8F9FC] flex flex-col relative overflow-hidden gap-2 items-center">
            <span className="text-xl font-extrabold border border-[#6C63FF] text-[#6C63FF] bg-[#EAE8FF] rounded-2xl p-4 my-2 w-fit items-center flex leading-tight">
            01
            </span>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Buat Akun
            </h3>
            <p className="text-sm sm:text-sm text-gray-500 leading-relaxed z-10 font-semibold text-center">
              Daftar, verifikasi email, lalu lengkapi profilmu.
            </p>
          </div>

          {/* Step 2 desktop */}
          <div className="hidden sm:flex p-6 rounded-2xl bg-[#F8F9FC] flex-col relative overflow-hidden">
            <span className="text-xl font-bold text-[#6C63FF] bg-[#EAE8FF] rounded-full px-3 w-fit mb-2 leading-tight">
              02
            </span>
            <h3 className="text-lg font-bold text-gray-900 mb-2 z-10">Catat Keuanganmu</h3>
            <p className="text-sm sm:text-sm text-gray-500 leading-relaxed z-10 font-semibold text-justify">
              Masukkan pemasukan, pengeluaran, target tabungan atau data pinjaman. Bisa manual atau scan struk.
            </p>
          </div>

          {/* Step 2 mobile */}
          <div className="sm:hidden p-6 rounded-2xl bg-[#F8F9FC] flex flex-col relative overflow-hidden gap-2 items-center">
            <span className="text-xl font-extrabold border border-[#6C63FF] text-[#6C63FF] bg-[#EAE8FF] rounded-2xl p-4 my-2 w-fit items-center flex leading-tight">
              02
            </span>
            <h3 className="text-lg font-bold text-gray-900 mb-2 z-10">Catat Keuanganmu</h3>
            <p className="text-sm sm:text-sm text-gray-500 leading-relaxed z-10 font-semibold text-center">
              Masukkan pemasukan, pengeluaran, target tabungan atau data pinjaman. Bisa manual atau scan struk.
            </p>
          </div>

          {/* Step 3 desktop */}
          <div className="hidden sm:flex p-6 rounded-2xl bg-[#F8F9FC] flex-col relative overflow-hidden">
            <span className="text-xl font-bold text-[#6C63FF] bg-[#EAE8FF] rounded-full px-3 w-fit mb-2 leading-tight">
              03
            </span>
            <h3 className="text-lg font-bold text-gray-900 mb-2 z-10">Lihat Analisis AI</h3>
            <p className="text-sm sm:text-sm text-gray-500 leading-relaxed z-10 font-semibold text-justify">
              Pantau Financial Health, cek rencana pinjaman, dan dapatkan rekomendasi yang sesuai dengan kondisi keuanganmu.
            </p>
          </div>

          {/* Step 3 mobile */}
          <div className="sm:hidden p-6 rounded-2xl bg-[#F8F9FC] flex flex-col relative overflow-hidden gap-2 items-center">
            <span className="text-xl font-extrabold border border-[#6C63FF] text-[#6C63FF] bg-[#EAE8FF] rounded-2xl p-4 my-2 w-fit items-center flex leading-tight">
              03
            </span>
            <h3 className="text-lg font-bold text-gray-900 mb-2 z-10">Lihat Analisis AI</h3>
            <p className="text-sm sm:text-sm text-gray-500 leading-relaxed z-10 font-semibold text-center">
              Pantau Financial Health, cek rencana pinjaman, dan dapatkan rekomendasi yang sesuai dengan kondisi keuanganmu.
            </p>
          </div>

        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto p-8 sm:p-12  text-center flex flex-col items-center relative overflow-hidden">

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight max-w-xl leading-snug text-gray-800">
            <div className="p-2 flex items-center justify-center rounded-full">
                <span className="material-icons text-[#6C63F2]">verified_user</span>
              </div>
            Yuk, Mulai Kelola Keuanganmu dari Sekarang!
          </h2>

          <p className="mt-3 text-sm sm:text-base text-gray-500 font-semibold">
            Dengan FinZen, kamu bisa lebih paham kondisi keuanganmu, lebih siap menghadapi kebutuhan mendadak, dan lebih bijak sebelum mengambil keputusan finansial.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={onNavigateToRegister}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold bg-[#6C63F2] hover:bg-[#5c53d4] text-[#F8F9FC] rounded-full shadow-xl shadow-[#6C63F2]/20 transition-all active:scale-95 cursor-pointer"
            >
              Daftar Sekarang &gt;
            </button>
            <button
              onClick={onNavigateToLogin}
            className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold bg-[#6C63F2]/15 text-[#6C63F2] hover:text-white hover:bg-[#6C63F2] rounded-full transition-all cursor-pointer"
            >
              Masuk
            </button>
          </div>
        </div>
      </section>

      <footer id="tentang" className="py-8 px-6 bg-[#F8F9FC] text-center text-xs text-gray-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-600 text-xs md:text-sm">FinZen</span>
            <span className="font-bold text-gray-600 text-xs md:text-sm">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-gray-600 font-bold text-xs md:text-sm">
            Build for students, by students
          </div>
        </div>
      </footer>

    </div>
  );
}