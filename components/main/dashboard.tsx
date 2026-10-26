"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "material-icons/iconfont/material-icons.css";
import Sidebar from "./sidebar";
import TargetNabungWidget from "./catatan-keuangan/target-nabung/target-nabung-widget";
import Header from "./header";
import TombolAksi from "./catatan-keuangan/tombol-aksi";

interface Summary {
  saldo: number;
  totalPemasukan: number;
  totalPengeluaran: number;
}

interface TransactionItem {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: string;
  icon: string;
  iconColor: string;
}

interface PinjamanDashboard {
  _id: string;
  namaPlatform: string;
  jatuhTempo: string;
  cicilanBulanan: number;
  statusPinjaman: string;
}

interface FinancialHealthSummary {
  skorTotal: number;
  grade: string;
  updatedAt: string;
}

const CATEGORY_ICON: Record<string, string> = {
  makanan: "ramen_dining",
  transportasi: "directions_car",
  belanja: "shopping_bag",
  tagihan: "payments",
  hiburan: "local_movies",
  freelance: "work",
  gaji: "paid",
  kesehatan: "medical_services",
  investasi: "trending_up",
  tabungan: "savings",
};

const getIconForCategory = (kategori: string) => {
  const key = (kategori || "").toLowerCase();
  return CATEGORY_ICON[key] || "receipt_long";
};

const formatTanggal = (isoDate: string) => {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
};

const formatRupiah = (val: number) =>
  `Rp${Math.abs(val).toLocaleString("id-ID")}`;

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const [userName, setUserName] = useState("Pengguna");
  const [summary, setSummary] = useState<Summary>({
    saldo: 0,
    totalPemasukan: 0,
    totalPengeluaran: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([]);
  const [listPinjaman, setListPinjaman] = useState<PinjamanDashboard[]>([]);
  const [financialHealth, setFinancialHealth] = useState<FinancialHealthSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`, {
            method: "GET",
            headers,
          });

          if (res.ok) {
            const result = await res.json();
            const data = result.data;

            setUserName(data.nama || "Pengguna");
            localStorage.setItem("user", JSON.stringify({ username: data.nama }));

            setSummary({
              saldo: data.ringkasan?.saldo ?? 0,
              totalPemasukan: data.ringkasan?.totalPemasukan ?? 0,
              totalPengeluaran: data.ringkasan?.totalPengeluaran ?? 0,
            });

            const mappedTransactions: TransactionItem[] = (data.transaksiTerakhir || []).map((item: any) => ({
              id: item._id,
              title: item.catatan,
              category: item.kategori,
              date: formatTanggal(item.tanggal),
              amount: item.tipe === "pemasukan" ? item.nominal : -item.nominal,
              type: item.tipe,
              icon: getIconForCategory(item.kategori),
              iconColor: item.tipe === "pemasukan" ? "text-[#05DF72]" : "text-[#E74C3C]",
            }));
            setRecentTransactions(mappedTransactions);

            if (data.financialHealth) {
              setFinancialHealth({
                skorTotal: data.financialHealth.skorTotal,
                grade: data.financialHealth.grade,
                updatedAt: data.financialHealth.updatedAt,
              });
            }
          } else {
            console.warn("Gagal ambil dashboard utama, tapi lanjut ambil pinjaman...");
          }
        } catch (err) {
          console.error("Error fetch dashboard:", err);
        }

        try {
          const resPinjaman = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/pinjaman`, {
            method: "GET",
            headers,
          });

          if (resPinjaman.ok) {
            const pinjamanResult = await resPinjaman.json();
            const items: PinjamanDashboard[] = pinjamanResult.data || [];
            
            const aktif = items.filter((p) => p.statusPinjaman !== "Lunas");
            
            const sorted = aktif.sort(
              (a, b) => new Date(a.jatuhTempo).getTime() - new Date(b.jatuhTempo).getTime()
            );

            setListPinjaman(sorted);
          }
        } catch (err) {
          console.error("Error fetch pinjaman:", err);
        }

      } catch (err: unknown) {
        const errorObj = err as Error;
        setError(errorObj.message || "Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="w-full h-full p-4 md:p-6 py-8 flex flex-col bg-[#F8F9FC] text-gray-800 overflow-y-auto overflow-x-hidden relative font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="lg:max-w-5xl lg:mx-auto lg:w-full flex flex-col gap-5">
        
        <div className="w-full flex flex-row items-center justify-between">
          <Header
            title="Dashboard"
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onProfileClick={() => router.push("/?mode=profile-edit")}
          />
        </div>

        <div className="bg-gradient-to-r from-[#6C63F2] to-[#574CE8] rounded-[24px] p-5 md:p-6 shadow-md shadow-[#6C63F2]/20">
          <h2 className="text-white text-lg font-medium mb-3">
            Halo, {userName}! 👋
          </h2>
          <div className="mb-5">
            <p className="text-white/80 text-sm mb-1">Saldo Sekarang</p>
            <span className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">
              {loading ? "..." : formatRupiah(summary.saldo)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-[16px] p-3 flex flex-col justify-center">
              <div className="flex flex-row items-center gap-2 mb-1">
                <div className="p-1 flex items-center justify-center bg-[#05DF72]/15 rounded-full">
                  <span className="material-icons text-[#05DF72] text-[14px]!">north_east</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">Pemasukan</span>
              </div>
              <div className="text-sm md:text-base font-bold text-gray-900">
                {loading ? "..." : formatRupiah(summary.totalPemasukan)}
              </div>
            </div>

            <div className="bg-white rounded-[16px] p-3 flex flex-col justify-center">
              <div className="flex flex-row items-center gap-2 mb-1">
                <div className="p-1 flex items-center justify-center bg-[#E74C3C]/15 rounded-full">
                  <span className="material-icons text-[#E74C3C] text-[14px]!">south_west</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">Pengeluaran</span>
              </div>
              <div className="text-sm md:text-base font-bold text-gray-900">
                {loading ? "..." : formatRupiah(summary.totalPengeluaran)}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <TombolAksi />
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-4 md:p-5 flex flex-col justify-between shadow-sm">
            <div className="flex flex-row items-center gap-2 mb-4">
              <div className="flex items-center justify-center p-2 bg-[#E8E6FD] rounded-full shrink-0">
                <span className="material-icons text-[#6c63f2] text-sm select-none">account_balance_wallet</span>
              </div>
              <div className="text-xs md:text-sm text-gray-700 font-bold">Financial Health</div>
            </div>
            <div className="flex flex-row items-end gap-1 mb-3">
              <div className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-none">
                {loading ? "..." : financialHealth ? financialHealth.skorTotal : "-"}
              </div>
              <div className="text-xs md:text-sm font-semibold text-gray-400">/100</div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#6c63f2] transition-all duration-700"
                style={{ width: loading || !financialHealth ? "0%" : `${Math.min(100, Math.max(0, financialHealth.skorTotal))}%` }}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#6c63f2] to-[#574CE8] rounded-3xl p-4 md:p-5 flex flex-col justify-between shadow-sm text-white cursor-pointer hover:opacity-90 transition-opacity">
            <div className="flex items-center justify-center p-2.5 aspect-square bg-white rounded-full w-fit mb-3">
              <span className="material-icons text-[#6c63f2] text-sm select-none">psychology</span>
            </div>
            <div>
              <div className="text-sm md:text-base font-bold mb-1">Tanya ZenAI</div>
              <div className="text-xs text-white/80">Ngobrol soal uang</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between mb-4">
            <div className="text-base font-bold text-gray-900">Transaksi Terakhir</div>
            <button
              onClick={() => router.push("/?mode=transaksi")}
              className="text-[#6C63F2] text-xs md:text-sm font-semibold hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="text-center text-sm text-gray-400 py-4">Memuat transaksi...</div>
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => {
                const isIncome = tx.type === "pemasukan";
                return (
                  <div key={tx.id} className="flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-full shrink-0">
                        <span className={`material-icons text-lg ${isIncome ? "text-[#05DF72]" : "text-[#E74C3C]"}`}>
                          {tx.icon}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">{tx.title}</div>
                        <div className="text-xs text-gray-400">{tx.category} • {tx.date}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${isIncome ? "text-[#05DF72]" : "text-[#E74C3C]"}`}>
                      {isIncome ? "+" : "-"}{formatRupiah(tx.amount)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-sm text-gray-400 py-4">Belum ada transaksi.</div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <div className="flex flex-row items-center justify-between mb-4">
            <div className="text-base font-bold text-gray-900">Cicilan Mendatang</div>
            <button
              onClick={() => router.push("/?mode=kelolapinjaman")}
              className="text-[#6C63F2] text-xs md:text-sm font-semibold hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="text-center text-sm text-gray-400 py-4">Memuat pinjaman...</div>
            ) : listPinjaman.length > 0 ? (
              listPinjaman.slice(0, 2).map((pj) => {
                const tanggalJatuhTempo = new Date(pj.jatuhTempo).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <div key={pj._id} className="bg-gray-50 rounded-2xl p-4 flex flex-row justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-gray-800 mb-0.5">{pj.namaPlatform}</div>
                      <div className="text-xs text-gray-400">Jatuh tempo {tanggalJatuhTempo}</div>
                    </div>
                    <div className="text-sm font-bold text-[#E74C3C]">
                      {formatRupiah(pj.cicilanBulanan)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-sm text-gray-400 py-4">Tidak ada cicilan aktif.</div>
            )}
          </div>
        </div>

        <TargetNabungWidget />

      </div>
    </div>
  );
}