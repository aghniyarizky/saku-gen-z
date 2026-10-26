'use client';

import { useState, useEffect } from "react";
import 'material-icons/iconfont/material-icons.css';
import Sidebar from '../../sidebar';
import { useRouter } from "next/navigation";

import Header from "../../header";

interface HasilKalkulasi {
  jumlahPinjaman: number;
  bungaPerBulan: number;
  tenorCicilan: number;
  dendaPerHari: number;
  deadlineTarget?: string;
  totalBunga: number;
  totalPembayaran: number;
  totalBayarPerBulan: number;
  bungaEfektifTahunan: number;
  levelRisiko: "Rendah" | "Sedang" | "Tinggi";
  analisisAI: string;
  createdAt?: string;
}

export default function KalkulatorBunga() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [jumlahPinjaman, setJumlahPinjaman] = useState<string>("");
  const [bungaPerBulan, setBungaPerBulan] = useState<string>("");
  const [tenorCicilan, setTenorCicilan] = useState<string>("");
  const [dendaPerHari, setDendaPerHari] = useState<string>("");
  const [deadlineTarget, setDeadlineTarget] = useState<string>("");

  const [hasilKalkulasi, setHasilKalkulasi] = useState<HasilKalkulasi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const renderAnalisis = (text: string) => {
    const parts = text.split("**");
    return parts.map((part, i) =>
      i % 2 === 1 ? <b key={i}>{part}</b> : <span key={i}>{part}</span>
    );
  };

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") || "";
    }
    return "";
  };

  const fetchLatestSimulasi = async () => {
    setLoading(true);
    setError("");

    try {
      const token = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kalkulator-bunga/output`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || "Gagal mengambil data simulasi.");

      if (resData.data) {
        setHasilKalkulasi(resData.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestSimulasi();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kalkulator-bunga`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          jumlahPinjaman,
          bungaPerBulan,
          tenorCicilan,
          dendaPerHari,
          deadlineTarget,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Gagal menghitung simulasi.");
      }

      if (!response.body) {
        throw new Error("Tidak ada respons dari server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          try {
            const payload = JSON.parse(line.slice(6));

            if (payload.type === "done") {
              setHasilKalkulasi(payload.data);
            } else if (payload.type === "error") {
              throw new Error(payload.error || payload.message || "Gagal menghitung simulasi");
            }
          } catch {
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJumlahPinjaman("");
    setBungaPerBulan("");
    setTenorCicilan("");
    setDendaPerHari("");
    setDeadlineTarget("");
    setHasilKalkulasi(null);
    setError("");
  };

  return (
    <div className="w-full h-full p-4 md:p-6 py-8 flex flex-col bg-[#F8F9FC] text-gray-800 overflow-y-auto overflow-x-hidden relative font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="lg:max-w-5xl lg:mx-auto lg:w-full flex flex-col gap-5">
        <Header
          title="Kalkulator Bunga"
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onProfileClick={() => router.push("/?mode=profile-edit")}
        />

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900">Hitung cicilan pinjaman</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Masukkan jumlah pinjaman, bunga bulanan, tenor, dan denda harian untuk melihat perkiraan pembayaran.
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-bold text-gray-900 mb-1">Data Pinjaman</h2>
          
          <div>
            <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Pinjaman</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-sm font-semibold text-gray-500">Rp</span>
              <input
                type="number"
                value={jumlahPinjaman}
                onChange={(e) => setJumlahPinjaman(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm pl-12 pr-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors placeholder:text-gray-400"
                placeholder="Contoh: 5.000.000"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Bunga bulanan (%)</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-sm font-semibold text-gray-500">%</span>
              <input
                type="number"
                step="0.1"
                value={bungaPerBulan}
                onChange={(e) => setBungaPerBulan(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm pl-12 pr-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors placeholder:text-gray-400"
                placeholder="Contoh: 5"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Tenor</label>
            <div className="relative">
              <select
                value={tenorCicilan}
                onChange={(e) => setTenorCicilan(e.target.value)}
                className={`appearance-none bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer pr-10 ${
                  tenorCicilan === "" ? "text-gray-400" : "text-gray-800"
                }`}
                required
              >
                <option value="" disabled hidden></option>
                <option value="1">1 Bulan</option>
                <option value="3">3 Bulan</option>
                <option value="6">6 Bulan</option>
                <option value="12">12 Bulan</option>
                <option value="24">24 Bulan</option>
              </select>
              <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">
                expand_more
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Denda harian</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-sm font-semibold text-gray-500">Rp</span>
              <input
                type="number"
                value={dendaPerHari}
                onChange={(e) => setDendaPerHari(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm pl-12 pr-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors placeholder:text-gray-400"
                placeholder="Contoh: 15.000"
              />
            </div>
          </div>

          <div className="flex flex-row gap-3 mt-2">
            <button
              type="button"
              onClick={handleReset}
              className="w-1/3 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 rounded-xl bg-[#6C63F2] text-sm font-bold text-white hover:bg-[#574CE8] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Menghitung..." : "Hitung"}
            </button>
          </div>
        </form>

        <div className="bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex flex-row items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Hasil Perkiraan</h2>
            {!hasilKalkulasi && (
              <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] md:text-xs font-bold rounded-full">
                Belum dihitung
              </span>
            )}
          </div>

          {!hasilKalkulasi && !loading && (
            <div className="bg-[#F8F9FC] border border-gray-100 rounded-2xl p-4 flex flex-col">
              <span className="text-sm font-bold text-gray-800 mb-1">Lengkapi data lalu hitung</span>
              <span className="text-xs text-gray-500 leading-relaxed">
                Masukkan pinjaman, bunga bulanan, tenor, dan denda harian untuk melihat perkiraan cicilan.
              </span>
            </div>
          )}

          {loading && (
            <div className="bg-[#F8F9FC] border border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[120px]">
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-[#6C63F2] animate-spin mb-2" />
              <span className="text-xs text-gray-500">Menghitung perkiraan...</span>
            </div>
          )}

          <div className="flex flex-col gap-3 mt-1">
            <div className="flex flex-row justify-between items-center text-sm">
              <span className="text-gray-500">Total bunga</span>
              <span className="font-bold text-gray-900">
                {hasilKalkulasi ? formatRupiah(hasilKalkulasi.totalBunga) : "—"}
              </span>
            </div>
            <div className="flex flex-row justify-between items-center text-sm">
              <span className="text-gray-500">Total pembayaran</span>
              <span className="font-bold text-gray-900">
                {hasilKalkulasi ? formatRupiah(hasilKalkulasi.totalPembayaran) : "—"}
              </span>
            </div>
            <div className="flex flex-row justify-between items-center text-sm">
              <span className="text-gray-500">Bayar per bulan</span>
              <span className="font-bold text-gray-900">
                {hasilKalkulasi ? formatRupiah(hasilKalkulasi.totalBayarPerBulan) : "—"}
              </span>
            </div>
            <div className="flex flex-row justify-between items-center text-sm">
              <div className="flex flex-row items-center gap-1">
                <span className="text-gray-500">Bunga efektif</span>
                <span className="material-icons text-gray-400 text-sm">info</span>
              </div>
              <span className="font-bold text-gray-900">
                {hasilKalkulasi ? `${hasilKalkulasi.bungaEfektifTahunan.toFixed(1)}% per Tahun` : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-sm flex flex-col gap-5 mb-8">
          <h2 className="text-base font-bold text-gray-900">Asumsi</h2>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-[#F3F2FE] rounded-full shrink-0 mt-0.5">
                <span className="material-icons text-[#6C63F2] text-sm">info</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">Pinjaman</span>
                <span className="text-xs text-gray-500 mt-0.5">Jumlah utang pokok yang akan dipinjam.</span>
              </div>
            </div>

            <div className="flex flex-row items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-[#F3F2FE] rounded-full shrink-0 mt-0.5">
                <span className="material-icons text-[#6C63F2] text-sm">info</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">Bunga bulanan</span>
                <span className="text-xs text-gray-500 mt-0.5">Persentase bunga per bulan, bukan per tahun.</span>
              </div>
            </div>

            <div className="flex flex-row items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-[#F3F2FE] rounded-full shrink-0 mt-0.5">
                <span className="material-icons text-[#6C63F2] text-sm">info</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">Tenor</span>
                <span className="text-xs text-gray-500 mt-0.5">Jangka waktu pembayaran dalam bulan.</span>
              </div>
            </div>

            <div className="flex flex-row items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-[#F3F2FE] rounded-full shrink-0 mt-0.5">
                <span className="material-icons text-[#6C63F2] text-sm">info</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">Denda harian</span>
                <span className="text-xs text-gray-500 mt-0.5">Biaya tambahan per hari jika pembayaran terlambat.</span>
              </div>
            </div>
          </div>
        </div>

        {hasilKalkulasi && (
          <div className="bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-sm flex flex-col gap-4 mb-8">
            <div className="flex flex-row items-center gap-3">
              <div className="flex items-center justify-center p-2 bg-[#F3F2FE] rounded-full shrink-0">
                <span className="material-icons text-[#6C63F2] select-none leading-none">insights</span>
              </div>
              <div className="text-base font-bold text-gray-900">
                Analisis AI ({hasilKalkulasi.levelRisiko})
              </div>
            </div>
            <div className="text-sm text-gray-600 leading-relaxed text-justify">
              {renderAnalisis(hasilKalkulasi.analisisAI)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}