"use client";

import { useState, useEffect } from "react";
import "material-icons/iconfont/material-icons.css";
import Sidebar from "../../sidebar";
import NavCatatan from "../nav-catatan";
import Header from "../../header";
import { useRouter } from "next/navigation";

interface TransaksiProps {
  onSwitchToScan?: () => void;
  onSwitchToAdd?: () => void;
  onSwitchToEdit?: (id: number | string) => void;
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

interface Summary {
  saldo: number;
  totalPemasukan: number;
  totalPengeluaran: number;
}

const CATEGORY_ICON: Record<string, string> = {
  makanan: "ramen_dining",
  transportasi: "directions_car",
  belanja: "shopping_bag",
  tagihan: "payments",
  hiburan: "local_movies",
  freelance: "work",
  gaji: "account_balance_wallet",
  "part-time": "badge",
  investasi: "trending_up",
  kesehatan: "medical_services",
  tabungan: "savings",
  lainnya: "receipt_long",
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

export default function Transaksi({
  onSwitchToScan,
  onSwitchToAdd,
  onSwitchToEdit,
}: TransaksiProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterType, setFilterType] = useState<
    "semua" | "pemasukan" | "pengeluaran"
  >("semua");

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [summary, setSummary] = useState<Summary>({
    saldo: 0,
    totalPemasukan: 0,
    totalPengeluaran: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // <--- Maksimal 10 per halaman

  const router = useRouter();

  const fetchTransaksi = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      const teksResponse = await response.text();

      if (!response.ok) {
        console.error("ERROR AMBIL TRANSAKSI:", teksResponse);
        try {
          const parsedError = JSON.parse(teksResponse);
          throw new Error(
            parsedError.message || "Gagal mengambil data transaksi.",
          );
        } catch {
          throw new Error("Terjadi kesalahan pada server backend.");
        }
      }

      const resData = JSON.parse(teksResponse);

      setSummary({
        saldo: resData.summary?.saldo ?? 0,
        totalPemasukan: resData.summary?.totalPemasukan ?? 0,
        totalPengeluaran: resData.summary?.totalPengeluaran ?? 0,
      });

      const mapped: TransactionItem[] = (resData.data || []).map(
        (item: any) => ({
          id: item._id,
          title: item.Catatan_Transaksi,
          category: item.kategori,
          date: formatTanggal(item.tanggal),
          amount: item.tipe === "pemasukan" ? item.nominal : -item.nominal,
          type: item.tipe,
          icon: getIconForCategory(item.kategori),
          iconColor:
            item.tipe === "pemasukan" ? "text-[#05DF72]" : "text-[#E74C3C]",
        }),
      );

      setTransactions(mapped);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchTransaksi();
    };
    loadData();
  }, []);

  const handleDeleteTransaksi = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/${deleteId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!res.ok) {
        throw new Error("Gagal menghapus transaksi.");
      }

      setDeleteId(null);
      await fetchTransaksi();
    } catch (err: unknown) {
      const errorObj = err as Error;
      alert(errorObj.message || "Terjadi kesalahan saat menghapus.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTransactions = transactions.filter((item) => {
    if (filterType === "pemasukan") return item.type === "pemasukan";
    if (filterType === "pengeluaran") return item.type === "pengeluaran";
    return true;
  });

  // --- LOGIKA PAGINATION BARU (MAKS 10) ---
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const groupedTransactions = currentTransactions.reduce(
    (acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = [];
      }
      acc[item.date].push(item);
      return acc;
    },
    {} as Record<string, TransactionItem[]>,
  );
  // ----------------------------------------

  const handleFilterChange = (type: "semua" | "pemasukan" | "pengeluaran") => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const currentDate = new Intl.DateTimeFormat("id-ID", {
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="w-full h-full p-4 md:p-6 py-8 flex flex-col bg-[#F8F9FC] text-gray-800 overflow-y-auto overflow-x-hidden relative font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="lg:max-w-5xl lg:mx-auto lg:w-full flex flex-col gap-5">
        
        <div className="w-full flex flex-row items-center justify-between">
          <Header
            title="Catatan Keuangan"
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onProfileClick={() => router.push("/?mode=profile-edit")}
          />
        </div>

        <NavCatatan />

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-5">
          <div>
            <div className="flex flex-row items-center justify-between mb-2">
              <span className="text-sm text-gray-500 font-semibold">Saldo Sekarang</span>
              <span className="px-3 py-1 bg-[#F3F2FE] text-[#6C63F2] text-[10px] md:text-xs font-bold rounded-full">
                {currentDate}
              </span>
            </div>
            <span className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight block">
              {loading ? "..." : formatRupiah(summary.saldo)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="bg-[#F8F9FC] rounded-2xl p-4 flex flex-col justify-center border border-gray-100">
              <span className="text-xs text-gray-500 font-medium mb-1">Pemasukan</span>
              <span className="text-sm md:text-base font-bold text-[#05DF72]">
                {loading ? "..." : formatRupiah(summary.totalPemasukan)}
              </span>
            </div>

            <div className="bg-[#F8F9FC] rounded-2xl p-4 flex flex-col justify-center border border-gray-100">
              <span className="text-xs text-gray-500 font-medium mb-1">Pengeluaran</span>
              <span className="text-sm md:text-base font-bold text-[#E74C3C]">
                {loading ? "..." : formatRupiah(summary.totalPengeluaran)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
            <div className="flex flex-row items-center gap-1 p-1 bg-gray-50 rounded-xl">
              <button
                type="button"
                onClick={() => handleFilterChange("semua")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  filterType === "semua"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("pemasukan")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  filterType === "pemasukan"
                    ? "bg-white text-[#05DF72] shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("pengeluaran")}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  filterType === "pengeluaran"
                    ? "bg-white text-[#E74C3C] shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Pengeluaran
              </button>
            </div>

            <div className="flex flex-row items-center gap-2">
              <button
                type="button"
                onClick={onSwitchToScan}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shrink-0"
              >
                <span className="material-icons text-[#6C63F2] text-sm select-none">
                  qr_code_scanner
                </span>
                <span>Scan Struk</span>
              </button>

              <button
                type="button"
                onClick={onSwitchToAdd}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-[#6C63F2] text-white hover:bg-[#574CE8] shadow-md shadow-[#6C63F2]/20 shrink-0"
              >
                <span className="material-icons text-sm select-none">
                  add
                </span>
                <span>Tambah</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {loading ? (
              <div className="py-8 text-center text-sm text-gray-400">
                Memuat data transaksi...
              </div>
            ) : Object.keys(groupedTransactions).length > 0 ? (
              Object.keys(groupedTransactions).map((dateKey) => {
                const items = groupedTransactions[dateKey];

                return (
                  <div key={dateKey} className="flex flex-col gap-3">
                    <h2 className="text-sm font-bold text-gray-500 tracking-wide">
                      {dateKey}
                    </h2>

                    <div className="flex flex-col gap-3">
                      {items.map((item) => {
                        const isIncome = item.type === "pemasukan";
                        const formattedAmount = isIncome
                          ? `+${formatRupiah(item.amount)}`
                          : `-${formatRupiah(item.amount)}`;

                        return (
                          <div
                            key={item.id}
                            className="bg-gray-50 rounded-2xl px-4 py-3 flex flex-row items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full shrink-0 shadow-sm">
                                <span className={`material-icons text-lg ${item.iconColor}`}>
                                  {item.icon}
                                </span>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-bold truncate text-gray-800">
                                  {item.title}
                                </div>
                                <div className="text-xs text-gray-400 truncate mt-0.5">
                                  {item.category}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div
                                className={`text-sm font-bold text-right ${isIncome ? "text-[#05DF72]" : "text-[#E74C3C]"}`}
                              >
                                {formattedAmount}
                              </div>

                              <button
                                type="button"
                                onClick={() => onSwitchToEdit?.(item.id)}
                                className="text-gray-400 hover:text-[#6C63F2] transition-colors cursor-pointer p-1.5 rounded-full hover:bg-white"
                                title="Edit Transaksi"
                              >
                                <span className="material-icons text-base">edit</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-sm text-gray-400 bg-gray-50 rounded-2xl">
                Tidak ada transaksi untuk kategori ini.
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100 text-xs text-gray-500">
                <div>
                  Halaman{" "}
                  <span className="font-bold text-gray-800">{currentPage}</span> dari{" "}
                  <span className="font-bold text-gray-800">{totalPages}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span className="material-icons text-sm block select-none">
                      chevron_left
                    </span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
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
                      ),
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span className="material-icons text-sm block select-none">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}