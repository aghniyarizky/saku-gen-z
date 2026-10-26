"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "material-icons/iconfont/material-icons.css";
import Sidebar from "../../sidebar";
import NavCatatan from "../nav-catatan";
import { useRouter } from "next/navigation";
import Header from "../../header";

interface BudgetingProps {
  onSwitchToAddBudget?: () => void;
  onSwitchToEditBudget?: (id: string) => void;
}

interface BudgetItemBE {
  _id: string;
  Kategori_Budget: string;
  Batas_PerBulan: number;
  Tanggal_Mulai: string;
  Tanggal_Selesai: string;
  terpakai: number;
  tersisa: number;
  persentase: number;
  sisaHari: number;
  statusLabel: string;
}

export default function Budgeting({
  onSwitchToAddBudget,
  onSwitchToEditBudget,
}: BudgetingProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const [ringkasan, setRingkasan] = useState({
    totalBudget: 0,
    totalPengeluaran: 0,
    sisaBudget: 0,
  });

  const [budgetList, setBudgetList] = useState<BudgetItemBE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getKategoriIcon = (kategori: string) => {
    const lower = kategori.toLowerCase();
    if (lower.includes("makan") || lower.includes("kuliner") || lower.includes("pangan")) return "🍜";
    if (lower.includes("trans") || lower.includes("bensin") || lower.includes("kendaraan")) return "🚗";
    if (lower.includes("belanja") || lower.includes("mall") || lower.includes("shopping")) return "🛍️";
    if (lower.includes("hiburan") || lower.includes("main") || lower.includes("game")) return "🎬";
    if (lower.includes("tagihan") || lower.includes("listrik") || lower.includes("air")) return "💡";
    if (lower.includes("kesehatan") || lower.includes("obat")) return "🏥";
    if (lower.includes("pendidikan") || lower.includes("kuliah") || lower.includes("buku")) return "📚";
    return "💰";
  };

  const formatBulanTahun = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchBudgetingData = async () => {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/budgeting`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil data budgeting.");
        }

        const result = await response.json();

        setBudgetList(result.data || []);
        setRingkasan(
          result.summary || {
            totalBudget: 0,
            totalPengeluaran: 0,
            sisaBudget: 0,
          }
        );
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat mengambil data budget.");
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetingData();
  }, []);

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

        <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
          <div className="text-sm font-bold text-gray-900 mb-1">Ringkasan Budget</div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8F9FC] rounded-2xl p-4 flex flex-col justify-center border border-gray-100">
              <span className="text-xs text-gray-500 font-medium mb-1">Total Budget</span>
              <span className="text-base md:text-lg font-bold text-gray-900">
                {formatRupiah(ringkasan.totalBudget)}
              </span>
            </div>

            <div className="bg-[#F8F9FC] rounded-2xl p-4 flex flex-col justify-center border border-gray-100">
              <span className="text-xs text-gray-500 font-medium mb-1">Pengeluaran</span>
              <span className="text-base md:text-lg font-bold text-[#E74C3C]">
                {formatRupiah(ringkasan.totalPengeluaran)}
              </span>
            </div>
          </div>

          <div className="bg-[#F8F9FC] rounded-2xl p-4 border border-gray-100 flex flex-col justify-center">
            <span className="text-xs text-gray-500 font-medium mb-1">Sisa Budget</span>
            <span className="text-base md:text-lg font-bold text-[#05DF72]">
              {formatRupiah(ringkasan.sisaBudget)}
            </span>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between mt-2">
          <div className="text-lg font-bold text-gray-900">
            Budget Saya ({budgetList.length})
          </div>
          {onSwitchToAddBudget ? (
            <button
              type="button"
              onClick={onSwitchToAddBudget}
              className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-[#6C63F2] text-white hover:bg-[#574CE8] shadow-md shadow-[#6C63F2]/20 shrink-0"
            >
              <span className="material-icons select-none leading-none text-white text-base">add</span>
              <span>Tambah</span>
            </button>
          ) : (
            <Link
              href="/?mode=tambahbudget"
              className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-[#6C63F2] text-white hover:bg-[#574CE8] shadow-md shadow-[#6C63F2]/20 shrink-0"
            >
              <span className="material-icons select-none leading-none text-white text-base">add</span>
              <span>Tambah</span>
            </Link>
          )}
        </div>

        {loading && (
          <div className="text-center py-8 text-gray-400 text-sm">Memuat data budget...</div>
        )}

        {error && (
          <div className="text-center py-4 text-red-500 text-sm bg-red-50 rounded-2xl border border-red-100">
            {error}
          </div>
        )}

        {!loading && !error && budgetList.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-3xl border border-gray-100">
            Belum ada data budget. Klik &quot;Tambah&quot; untuk membuat batasan budget baru.
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-4">
            {budgetList.map((item) => {
              const statusColor =
                item.statusLabel === "Melebihi Budget"
                  ? "bg-red-50 text-red-500 border-red-100"
                  : item.statusLabel === "Mendekati Batas"
                  ? "bg-[#FFB700]/10 text-[#FFB700] border-[#FFB700]/20"
                  : "bg-[#05DF72]/10 text-[#05DF72] border-[#05DF72]/20";

              const barColor =
                item.persentase >= 100
                  ? "bg-red-500"
                  : item.persentase >= 70
                  ? "bg-[#FFB700]"
                  : "bg-[#6C63F2]";

              return (
                <div
                  key={item._id}
                  className="bg-white border border-gray-100 rounded-3xl p-5 flex flex-col gap-4 shadow-sm"
                >
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl border border-gray-100">
                        {getKategoriIcon(item.Kategori_Budget)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-base text-gray-900">
                          {item.Kategori_Budget}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <span className="material-icons text-[10px] select-none">calendar_today</span>
                          {formatBulanTahun(item.Tanggal_Mulai)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row items-center gap-2">
                      <span className={`text-[10px] md:text-xs px-3 py-1 rounded-full border font-bold ${statusColor}`}>
                        {item.statusLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSwitchToEditBudget?.(item._id)}
                        className="text-gray-400 hover:text-[#6C63F2] transition-colors cursor-pointer p-1.5 rounded-full hover:bg-gray-50"
                      >
                        <span className="material-icons text-base">edit</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-[#F8F9FC] rounded-2xl flex flex-col justify-center border border-gray-100">
                      <span className="text-xs text-gray-500 font-medium mb-1">Budget</span>
                      <span className="font-bold text-gray-900 text-sm md:text-base">
                        {formatRupiah(item.Batas_PerBulan)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">/ periode</span>
                    </div>

                    <div className="p-3 bg-[#F8F9FC] rounded-2xl flex flex-col justify-center border border-gray-100">
                      <span className="text-xs text-gray-500 font-medium mb-1">Terpakai</span>
                      <span className="font-bold text-[#6C63F2] text-sm md:text-base">
                        {formatRupiah(item.terpakai)}
                      </span>
                      <span className="text-[10px] text-[#6C63F2]/80 font-medium">{item.persentase}%</span>
                    </div>

                    <div className="p-3 bg-[#F8F9FC] rounded-2xl flex flex-col justify-center border border-gray-100 col-span-2">
                      <span className="text-xs text-gray-500 font-medium mb-1">Tersisa</span>
                      <span className="font-bold text-[#05DF72] text-base md:text-lg">
                        {formatRupiah(item.tersisa)}
                      </span>
                      <span className="text-[10px] text-[#05DF72] font-medium">
                        {item.sisaHari} hari lagi
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-xs text-gray-500 font-medium">
                      {item.persentase}% budget terpakai
                    </span>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${barColor} h-full rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(100, item.persentase)}%` }}
                      />
                    </div>
                    <div className="flex flex-row justify-between text-[10px] text-gray-400 font-medium mt-0.5">
                      <span>Rp0</span>
                      <span>{formatRupiah(item.Batas_PerBulan)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}