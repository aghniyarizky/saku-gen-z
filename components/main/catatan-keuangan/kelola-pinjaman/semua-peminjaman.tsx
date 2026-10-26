"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "material-icons/iconfont/material-icons.css";
import Sidebar from "../../sidebar";
import NavCatatan from "../nav-catatan";
import Header from "../../header";

interface PinjamanItem {
  _id: string;
  namaPlatform: string;
  jenisPinjaman: string;
  totalPinjaman: number;
  tenorCicilan: number;
  cicilanBulanan: number;
  totalYangHarusDibayar: number;
  jatuhTempo: string;
  persenBunga?: number;
  statusPinjaman: string;
  progress: number;
}

export default function SemuaPinjaman() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const [daftarPinjaman, setDaftarPinjaman] = useState<PinjamanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatTanggal = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchPinjamanData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/pinjaman`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data pinjaman.");
      }

      const result = await response.json();
      setDaftarPinjaman(result.data || []);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Terjadi kesalahan saat mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPinjamanData();
  }, []);

  // Logika Pagination
  const totalPages = Math.ceil(daftarPinjaman.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = daftarPinjaman.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full h-full p-4 md:p-6 py-8 flex flex-col bg-[#F8F9FC] text-gray-800 overflow-y-auto overflow-x-hidden relative font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="lg:max-w-5xl lg:mx-auto lg:w-full flex flex-col gap-5">
        <Header
          title="Catatan Keuangan"
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onProfileClick={() => router.push("/?mode=profile-edit")}
        />

        <NavCatatan />

        <div className="flex flex-row items-center gap-4">
          <button 
            type="button"
            onClick={() => router.push("/?mode=kelolapinjaman")}
            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            <span className="material-icons text-xl select-none">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Semua Pinjaman</h1>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-400 text-sm">Memuat data pinjaman...</div>
        )}

        {error && (
          <div className="text-center py-4 text-red-500 text-sm bg-red-50 rounded-2xl border border-red-100">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-4">
            {currentItems.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-gray-100 rounded-3xl p-5 flex flex-col gap-4 shadow-sm"
              >
                <div className="flex flex-row items-start justify-between">
                  <div className="flex flex-col gap-0.5">
                    <div className="font-bold text-base text-gray-900">{item.namaPlatform}</div>
                    <div className="text-xs text-gray-500 font-medium">
                      Principal {formatRupiah(item.totalPinjaman)}
                    </div>
                  </div>
                  <div className="flex items-center text-sm font-semibold text-[#6C63F2] cursor-pointer">
                    <button
                      type="button"
                      onClick={() => router.push(`/?mode=editpinjaman&id=${item._id}`)}
                      className="transition-colors cursor-pointer p-2 rounded-full bg-[#F3F2FE] hover:bg-[#E8E6FD]"
                    >
                      <span className="material-icons text-base">edit</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#F3F2FE] text-[#6C63F2] font-bold">
                    {item.jenisPinjaman || "Bunga Tetap"}
                  </span>
                  {item.persenBunga !== undefined && item.persenBunga > 0 && (
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#FFB700]/10 text-[#FFB700] font-bold">
                      Bunga {item.persenBunga}% /bulan
                    </span>
                  )}
                  {item.statusPinjaman === "Lunas" && (
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#05DF72]/10 text-[#05DF72] font-bold">
                      Lunas
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mt-1">
                  <div className="p-3.5 bg-[#F8F9FC] rounded-2xl border border-gray-100">
                    <span className="text-gray-500 block font-medium mb-1">Sisa tagihan</span>
                    <span className="font-bold text-sm text-[#E74C3C]">
                      {formatRupiah(item.totalYangHarusDibayar)}
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#F8F9FC] rounded-2xl border border-gray-100">
                    <span className="text-gray-500 block font-medium mb-1">Cicilan bulanan</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {formatRupiah(item.cicilanBulanan)}
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#F8F9FC] rounded-2xl border border-gray-100">
                    <span className="text-gray-500 block font-medium mb-1">Jatuh tempo</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {formatTanggal(item.jatuhTempo)}
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#F8F9FC] rounded-2xl border border-gray-100">
                    <span className="text-gray-500 block font-medium mb-1">Status pembayaran</span>
                    <span className="font-bold text-sm text-[#05DF72]">
                      {item.progress}% terbayar
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                <div>
                  Halaman <span className="font-bold text-gray-800">{currentPage}</span> dari <span className="font-bold text-gray-800">{totalPages}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span className="material-icons text-sm block select-none">chevron_left</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          currentPage === page
                            ? "bg-[#6C63F2] text-white"
                            : "hover:bg-gray-100 text-gray-500"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span className="material-icons text-sm block select-none">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}