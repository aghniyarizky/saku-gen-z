'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import 'material-icons/iconfont/material-icons.css';
import Sidebar from '../../sidebar';
import { useRouter } from "next/navigation";
import NavCatatan from '../nav-catatan';
import Header from "../../header";

interface TargetNabungProps {
  onSwitchToAddTarget?: () => void;
  onSwitchToEditTarget?: (id: string) => void;
}

interface TargetTabungBE {
  _id: string;
  icon: string;
  namaTarget: string;
  targetNominal: number;
  terkumpulNominal: number;
  deadlineTarget: string;
  status: string;
  persentase: number;
  sisaHari: number;
}

export default function TargetNabung({ 
  onSwitchToAddTarget, 
  onSwitchToEditTarget 
}: TargetNabungProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [ringkasan, setRingkasan] = useState({ totalMenabung: 0, totalTarget: 0 });
  const [listTarget, setListTarget] = useState<TargetTabungBE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTarget, setSelectedTarget] = useState<TargetTabungBE | null>(null);
  const [nominalSetor, setNominalSetor] = useState("");
  const [sumberDana, setSumberDana] = useState("Tunai");
  const [loadingSetor, setLoadingSetor] = useState(false);
  const [errorSetor, setErrorSetor] = useState("");
  const router = useRouter();

  const sumberDanaOptions = [
    "Tunai", "Gopay", "DANA", "ShopeePay", "Bank Mandiri", "BSI", "BRI", "BTN", "BSA", "OVO", "Lainnya"
  ];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const fetchTargetData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/target-tabung`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data target tabung.");
      }

      const result = await response.json();
      setListTarget(result.data || []);
      setRingkasan(result.summary || { totalMenabung: 0, totalTarget: 0 });
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Terjadi kesalahan saat mengambil data target tabung.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargetData();
  }, []);

  const handleSetorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget) return;

    const nominal = Number(nominalSetor);
    if (!nominal || nominal <= 0) {
      setErrorSetor("Nominal setor harus lebih dari 0.");
      return;
    }

    setLoadingSetor(true);
    setErrorSetor("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/target-tabung/${selectedTarget._id}/setor`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nominalSetor: nominal,
          Sumber_Dana: sumberDana,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || "Gagal menyetor tabungan.");
      }

      setSelectedTarget(null);
      setNominalSetor("");
      setSumberDana("Tunai");
      await fetchTargetData();
    } catch (err: unknown) {
      const errorObj = err as Error;
      setErrorSetor(errorObj.message || "Terjadi kesalahan saat menyimpan setoran.");
    } finally {
      setLoadingSetor(false);
    }
  };

  return (
    <div className="w-full h-full p-4 md:p-6 py-8 flex flex-col bg-[#F8F9FC] text-gray-800 overflow-y-auto overflow-x-hidden relative font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="lg:max-w-5xl lg:mx-auto lg:w-full flex flex-col gap-5">
        <Header
          title="Catatan Keuangan"
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onProfileClick={() => router.push("/?mode=profile-edit")}
        />

        <NavCatatan />

        <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
          <div className="text-sm font-bold text-gray-900 mb-1">Ringkasan Nabung</div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8F9FC] rounded-2xl p-4 flex flex-col justify-center border border-gray-100">
              <span className="text-xs text-gray-500 font-medium mb-1">Total Menabung</span>
              <span className="text-base md:text-lg font-bold text-gray-900">
                {formatRupiah(ringkasan.totalMenabung)}
              </span>
            </div>

            <div className="bg-[#F8F9FC] rounded-2xl p-4 flex flex-col justify-center border border-gray-100">
              <span className="text-xs text-gray-500 font-medium mb-1">Total Target</span>
              <span className="text-base md:text-lg font-bold text-gray-900">
                {formatRupiah(ringkasan.totalTarget)}
              </span>
            </div>
          </div>

          <div className="bg-[#F8F9FC] rounded-2xl p-4 border border-gray-100 flex flex-row items-center gap-3">
            <span className="material-icons text-[#6C63F2] text-xl">info</span>
            <span className="text-xs md:text-sm text-gray-600 font-medium">
              Progress nabung kamu sudah bagus, teruskan secara konsisten ya!
            </span>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between mt-2">
          <div className="text-lg font-bold text-gray-900">
            Target Saya ({listTarget.length})
          </div>
          {onSwitchToAddTarget ? (
            <button
              type="button"
              onClick={onSwitchToAddTarget}
              className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-[#6C63F2] text-white hover:bg-[#574CE8] shadow-md shadow-[#6C63F2]/20 shrink-0"
            >
              <span className="material-icons select-none leading-none text-white text-base">add</span>
              <span>Tambah</span>
            </button>
          ) : (
            <Link
              href="/?mode=tambahtarget"
              className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-[#6C63F2] text-white hover:bg-[#574CE8] shadow-md shadow-[#6C63F2]/20 shrink-0"
            >
              <span className="material-icons select-none leading-none text-white text-base">add</span>
              <span>Tambah</span>
            </Link>
          )}
        </div>
    
        {loading && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Memuat data target tabung...
          </div>
        )}

        {error && (
          <div className="text-center py-4 text-red-500 text-sm bg-red-50 rounded-2xl border border-red-100">
            {error}
          </div>
        )}

        {!loading && !error && listTarget.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-3xl border border-gray-100">
            Belum ada target tabung. Klik "Tambah" untuk membuat impian tabungan barumu!
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-4">
            {listTarget.map((item) => (
              <div 
                key={item._id}
                className="bg-white border border-gray-100 rounded-3xl p-5 flex flex-col gap-4 shadow-sm relative"
              >
                <div className="flex flex-row items-start justify-between">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-2xl text-2xl shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <span className="text-[10px] md:text-xs font-bold text-[#6C63F2] bg-[#F3F2FE] px-3 py-1 rounded-full">
                      {item.persentase}%
                    </span>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSwitchToEditTarget) {
                          onSwitchToEditTarget(item._id);
                        }
                      }}
                      className="text-gray-400 hover:text-[#6C63F2] transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                      title="Edit Target"
                    >
                      <span className="material-icons text-base">edit</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-bold text-gray-900">{item.namaTarget}</h3>
                  <span className="text-xs text-gray-500 font-medium">
                    {item.sisaHari > 0 ? `${item.sisaHari} Hari Tersisa` : "Batas waktu telah berakhir"}
                  </span>
                </div>

                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-1">
                  <div 
                    className="bg-[#6C63F2] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, item.persentase)}%` }}
                  />
                </div>

                <div className="flex flex-row items-center justify-between text-xs md:text-sm font-medium mt-1">
                  <span className="text-[#05DF72] font-bold">{formatRupiah(item.terkumpulNominal)}</span>
                  <span className="text-gray-400">/ {formatRupiah(item.targetNominal)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTarget(item)}
                  className="mt-2 w-full py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sm font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  Tambah Setoran
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedTarget.icon}</span>
                <h3 className="text-base font-bold text-gray-900 truncate max-w-[200px]">
                  Setor: {selectedTarget.namaTarget}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTarget(null)}
                className="text-gray-400 hover:text-gray-800 transition-colors w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            </div>

            {errorSetor && (
              <div className="p-2.5 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl">
                {errorSetor}
              </div>
            )}

            <form onSubmit={handleSetorSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 font-semibold block mb-1.5">
                  Nominal Setor (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={nominalSetor}
                  onChange={(e) => setNominalSetor(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Contoh: 20000"
                  className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors placeholder:text-gray-400"
                  required
                />

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[10000, 20000, 50000, 100000].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setNominalSetor(String(amount))}
                      className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-[10px] text-gray-600 font-medium transition-colors"
                    >
                      +{amount / 1000}rb
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold block mb-1.5">
                  Sumber Dana
                </label>
                <div className="relative">
                  <select
                    value={sumberDana}
                    onChange={(e) => setSumberDana(e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer pr-10"
                  >
                    {sumberDanaOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-white text-gray-800">
                        {opt}
                      </option>
                    ))}
                  </select>
                  <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="flex flex-row gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTarget(null)}
                  disabled={loadingSetor}
                  className="w-1/2 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingSetor}
                  className="w-1/2 py-2.5 rounded-xl bg-[#6C63F2] text-sm font-bold text-white hover:bg-[#574CE8] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loadingSetor ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}