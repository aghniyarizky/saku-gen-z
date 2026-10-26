'use client';

import { useState, useEffect } from "react";
import 'material-icons/iconfont/material-icons.css';
import { useRouter } from "next/navigation";

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

export default function TargetNabungWidget({ 
  onSwitchToAddTarget, 
  onSwitchToEditTarget 
}: TargetNabungProps) {
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

      if (!response.ok) throw new Error("Gagal mengambil data target tabung.");
      
      const result = await response.json();
      setListTarget(result.data || []);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Terjadi kesalahan.");
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

      if (!res.ok) throw new Error(resData.message || "Gagal menyetor tabungan.");

      setSelectedTarget(null);
      setNominalSetor("");
      setSumberDana("Tunai");
      await fetchTargetData();
    } catch (err: unknown) {
      const errorObj = err as Error;
      setErrorSetor(errorObj.message || "Terjadi kesalahan.");
    } finally {
      setLoadingSetor(false);
    }
  };

  const displayTargets = listTarget.slice(0, 2);

  return (
    <div className="w-full bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm flex flex-col gap-4">
      
      <div className="flex flex-row items-center justify-between">
        <div className="text-base font-bold text-gray-900">Target Nabung</div>
        <button
          type="button"
          onClick={() => router.push("/?mode=kelolapinjaman")}
          className="text-[#6C63F2] text-xs md:text-sm font-semibold hover:underline"
        >
          Lihat Semua
        </button>
      </div>

      {loading && (
        <div className="text-center py-4 text-xs text-gray-400">Memuat data target...</div>
      )}

      {error && (
        <div className="text-center py-3 text-xs text-red-500 bg-red-50 rounded-xl">{error}</div>
      )}

      {!loading && !error && listTarget.length === 0 && (
        <div className="text-center py-4 text-xs text-gray-400 bg-gray-50 rounded-2xl">
          Belum ada target tabungan. Yuk mulai menabung!
        </div>
      )}

      {!loading && !error && displayTargets.map((item) => (
        <div 
          key={item._id}
          className="bg-gray-50 rounded-[16px] p-4 flex flex-col gap-3 relative group cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setSelectedTarget(item)}
        >
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm text-lg shrink-0">
                {item.icon}
              </div>
              <div className="text-sm font-bold text-gray-800 line-clamp-1">{item.namaTarget}</div>
            </div>
            <span className="text-xs font-bold text-[#6C63F2] bg-[#E8E6FD] px-2.5 py-1 rounded-full whitespace-nowrap">
              {item.persentase}%
            </span>
          </div>
          
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="bg-[#6C63F2] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, item.persentase)}%` }}
            />
          </div>

          <div className="flex flex-row items-center justify-between text-xs font-medium">
            <span className="text-[#05DF72]">{formatRupiah(item.terkumpulNominal)}</span>
            <span className="text-gray-400">/ {formatRupiah(item.targetNominal)}</span>
          </div>
        </div>
      ))}

      {selectedTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
            
            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedTarget.icon}</span>
                <h3 className="text-base font-bold text-gray-800 truncate max-w-[200px]">
                  Setor: {selectedTarget.namaTarget}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTarget(null)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
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
                <label className="text-xs text-gray-600 font-bold block mb-1.5">Nominal Setor (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={nominalSetor}
                  onChange={(e) => setNominalSetor(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Contoh: 20000"
                  className="border border-gray-200 rounded-xl w-full text-sm px-4 py-2.5 bg-gray-50 focus:outline-none focus:border-[#6C63F2] focus:bg-white text-gray-800 transition-colors"
                  required
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[10000, 20000, 50000, 100000].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setNominalSetor(String(amount))}
                      className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 font-medium transition-colors"
                    >
                      +{amount / 1000}rb
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600 font-bold block mb-1.5">Sumber Dana</label>
                <div className="relative">
                  <select
                    value={sumberDana}
                    onChange={(e) => setSumberDana(e.target.value)}
                    className="appearance-none border border-gray-200 rounded-xl w-full text-sm px-4 py-2.5 bg-gray-50 focus:outline-none focus:border-[#6C63F2] focus:bg-white text-gray-800 cursor-pointer pr-8 transition-colors"
                  >
                    {sumberDanaOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
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
                  className="w-1/2 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingSetor}
                  className="w-1/2 py-2.5 rounded-xl bg-[#6C63F2] text-white hover:bg-[#574CE8] text-sm font-extrabold transition-colors disabled:opacity-50"
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