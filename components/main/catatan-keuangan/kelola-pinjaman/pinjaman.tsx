"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "material-icons/iconfont/material-icons.css";
import Sidebar from "../../sidebar";
import NavCatatan from "../nav-catatan";
import Header from "../../header";

interface PinjamanProps {
  onSwitchToKalkulator?: () => void;
  onSwitchToAddPinjaman?: () => void;
  onSwitchToEdit?: (id: string) => void;
}

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
  sisaHari: number;
  mode: "lunas" | "pelunasan" | "cicilan";
}

export default function Pinjaman({
  onSwitchToKalkulator,
  onSwitchToAddPinjaman,
  onSwitchToEdit,
}: PinjamanProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const [ringkasan, setRingkasan] = useState({
    belumDibayar: 0,
    sudahDibayar: 0,
    kewajibanPerbulan: 0,
  });
  const [peringatan, setPeringatan] = useState<string | null>(null);

  const [daftarPinjaman, setDaftarPinjaman] = useState<PinjamanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPinjaman, setSelectedPinjaman] = useState<PinjamanItem | null>(null);
  const [nominalBayar, setNominalBayar] = useState("");
  const [sumberDana, setSumberDana] = useState("Tunai");
  const [loadingBayar, setLoadingBayar] = useState(false);
  const [errorBayar, setErrorBayar] = useState("");

  const sumberDanaOptions = [
    "Tunai", "Gopay", "DANA", "ShopeePay", "Bank Mandiri", "BSI", "BRI", "BTN", "BSA", "OVO", "Lainnya"
  ];

  const currentDate = new Intl.DateTimeFormat("id-ID", {
    month: "short",
    year: "numeric",
  }).format(new Date());

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

  const formatNumberInput = (value: string) => {
    let cleanValue = value.replace(/[^0-9,]/g, "");
    
    const parts = cleanValue.split(",");
    if (parts.length > 2) {
      cleanValue = parts[0] + "," + parts.slice(1).join("");
    }

    let integerPart = parts[0];
    const decimalPart = parts.length > 1 ? "," + parts[1] : "";

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return integerPart + decimalPart;
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
      setRingkasan(result.summary || { belumDibayar: 0, sudahDibayar: 0, kewajibanPerbulan: 0 });
      setPeringatan(result.peringatan || null);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Terjadi kesalahan saat mengambil data pinjaman.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPinjamanData();
  }, []);

  const handleOpenBayarModal = (item: PinjamanItem) => {
    setSelectedPinjaman(item);
    setNominalBayar(item.mode === "pelunasan" ? item.totalYangHarusDibayar.toLocaleString("id-ID") : item.cicilanBulanan.toLocaleString("id-ID"));
    setSumberDana("Tunai");
    setErrorBayar("");
  };

  const handleBayarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPinjaman) return;

    const nominalBersih = nominalBayar.replace(/\./g, "").replace(/,/g, ".");
    const bayar = Number(nominalBersih);

    if (!bayar || bayar <= 0) {
      setErrorBayar("Nominal bayar harus lebih dari 0.");
      return;
    }

    if (selectedPinjaman.mode === "pelunasan" && bayar < selectedPinjaman.totalYangHarusDibayar) {
      setErrorBayar(`Wajib melunasi seluruh tagihan sebesar ${formatRupiah(selectedPinjaman.totalYangHarusDibayar)}.`);
      return;
    }

    const minimumCicilan = Math.ceil(selectedPinjaman.totalPinjaman / selectedPinjaman.tenorCicilan);
    const sisaTagihan = selectedPinjaman.totalYangHarusDibayar;

    if (selectedPinjaman.mode !== "pelunasan" && bayar < minimumCicilan && bayar < sisaTagihan) {
      setErrorBayar(`Cicilan minimal Rp${minimumCicilan.toLocaleString("id-ID")}. Silakan masukkan nominal yang lebih besar.`);
      return;
    }

    setLoadingBayar(true);
    setErrorBayar("");

    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/pinjaman/${selectedPinjaman._id}/bayar`;
      
      const payload = {
        nominalBayar: bayar,
        Sumber_Dana: sumberDana,
      };

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const teksResponse = await res.text();

      if (!res.ok) {
        try {
          const parsed = JSON.parse(teksResponse);
          throw new Error(parsed.message || "Gagal memproses pembayaran cicilan.");
        } catch {
          throw new Error(`Terjadi kesalahan pada server (HTTP ${res.status}).`);
        }
      }

      setSelectedPinjaman(null);
      setNominalBayar("");
      setSumberDana("Tunai");
      
      await fetchPinjamanData(); 
      
    } catch (err: unknown) {
      const errorObj = err as Error;
      setErrorBayar(errorObj.message || "Terjadi kesalahan saat memproses pembayaran.");
    } finally {
      setLoadingBayar(false);
    }
  };

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

        {peringatan && (
          <div className="bg-[#FFB700]/10 border border-[#FFB700]/30 rounded-2xl p-4 flex flex-row items-start gap-3">
            <span className="material-icons text-[#FFB700] text-xl shrink-0 mt-0.5">warning</span>
            <p className="text-xs md:text-sm text-[#FFB700] font-medium leading-relaxed">
              {peringatan}
            </p>
          </div>
        )}

        <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-5">
          <div className="flex flex-row items-center justify-between mb-1">
            <span className="text-sm text-gray-800 font-bold">Ringkasan Pinjaman</span>
            <span className="px-3 py-1 bg-[#F3F2FE] text-[#6C63F2] text-[10px] md:text-xs font-bold rounded-full">
              {currentDate}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8F9FC] rounded-2xl p-4 flex flex-col justify-center border border-gray-100">
              <span className="text-xs text-gray-500 font-medium mb-1">Belum dibayar</span>
              <span className="text-base md:text-lg font-bold text-[#E74C3C]">
                {formatRupiah(ringkasan.belumDibayar)}
              </span>
            </div>

            <div className="bg-[#F8F9FC] rounded-2xl p-4 flex flex-col justify-center border border-gray-100">
              <span className="text-xs text-gray-500 font-medium mb-1">Sudah dibayar</span>
              <span className="text-base md:text-lg font-bold text-[#05DF72]">
                {formatRupiah(ringkasan.sudahDibayar)}
              </span>
            </div>
          </div>

          <div className="bg-[#F8F9FC] rounded-2xl p-4 flex flex-col justify-center border border-gray-100">
            <span className="text-xs text-gray-500 font-medium mb-1">Cicilan bulan ini</span>
            <span className="text-base md:text-lg font-bold text-gray-900">
              {formatRupiah(ringkasan.kewajibanPerbulan)}
            </span>
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">
          {onSwitchToAddPinjaman ? (
            <button
              type="button"
              onClick={onSwitchToAddPinjaman}
              className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-[#6C63F2] text-white hover:bg-[#574CE8] shadow-md shadow-[#6C63F2]/20 shrink-0"
            >
              <span className="material-icons select-none leading-none text-white text-base">add</span>
              <span>Tambah</span>
            </button>
          ) : (
            <Link
              href="/?mode=tambahpinjaman"
              className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-[#6C63F2] text-white hover:bg-[#574CE8] shadow-md shadow-[#6C63F2]/20 shrink-0"
            >
              <span className="material-icons select-none leading-none text-white text-base">add</span>
              <span>Tambah</span>
            </Link>
          )}

          {onSwitchToKalkulator ? (
            <button
              type="button"
              onClick={onSwitchToKalkulator}
              className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm shrink-0"
            >
              <span className="material-icons select-none leading-none text-[#6C63F2] text-base">calculate</span>
              <span>Kalkulator Bunga</span>
            </button>
          ) : (
            <Link
              href="/?mode=kalkulator"
              className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm shrink-0"
            >
              <span className="material-icons select-none leading-none text-[#6C63F2] text-base">calculate</span>
              <span>Kalkulator Bunga</span>
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <div className="flex flex-row items-center justify-between mb-1">
            <div className="text-base font-bold text-gray-900">
              Pinjaman Saya ({daftarPinjaman.length})
            </div>
            <button
              type="button"
              onClick={() => router.push("/?mode=semuapinjaman")}
              className="text-[#6C63F2] text-xs md:text-sm font-semibold hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>

          {loading && (
            <div className="text-center py-8 text-gray-400 text-sm">Memuat data pinjaman...</div>
          )}

          {error && (
            <div className="text-center py-4 text-red-500 text-sm bg-red-50 rounded-2xl border border-red-100">
              {error}
            </div>
          )}

          {!loading && !error && daftarPinjaman.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
              Belum ada data pinjaman. Klik "Tambah" untuk mencatat pinjaman baru.
            </div>
          )}

          {!loading && daftarPinjaman.map((item) => (
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
                    onClick={() => onSwitchToEdit?.(item._id)}
                    className="transition-colors cursor-pointer p-2 rounded-full bg-[#F3F2FE] hover:bg-[#E8E6FD]"
                    title="Edit Pinjaman"
                  >
                    <span className="material-icons text-base">edit</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center justify-center text-[10px] px-2.5 py-1 rounded-full bg-[#F3F2FE] text-[#6C63F2] font-bold">
                  {item.jenisPinjaman || "Bunga Tetap"}
                </span>
                {item.persenBunga !== undefined && item.persenBunga > 0 && (
                  <span className="inline-flex items-center justify-center text-[10px] px-2.5 py-1 rounded-full bg-[#FFB700]/10 text-[#FFB700] font-bold">
                    Bunga {item.persenBunga}% /bulan
                  </span>
                )}
                {item.statusPinjaman === "Lunas" && (
                  <span className="inline-flex items-center justify-center text-[10px] px-2.5 py-1 rounded-full bg-[#05DF72]/10 text-[#05DF72] font-bold">
                    Lunas
                  </span>
                )}
                {item.mode === "pelunasan" && item.statusPinjaman !== "Lunas" && (
                  <span className="inline-flex items-center justify-center text-[10px] px-2.5 py-1 rounded-full bg-[#E74C3C]/10 text-[#E74C3C] font-bold">
                    <span className="material-icons text-[12px] leading-none">warning</span>
                    Jatuh Tempo H-1
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

              {item.statusPinjaman !== "Lunas" && (
                <div className="flex justify-end pt-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenBayarModal(item)}
                    className="px-5 py-2.5 rounded-full bg-[#6C63F2] text-white hover:bg-[#574CE8] text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#6C63F2]/20"
                  >
                    <span className="material-icons text-sm leading-none">payments</span>
                    <span>{item.mode === "pelunasan" ? "Lunasi Sekarang" : "Bayar Cicilan"}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedPinjaman && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-icons text-[#6C63F2] text-2xl">account_balance_wallet</span>
                <h3 className="text-base font-bold text-gray-900 truncate max-w-[200px]">
                  Bayar: {selectedPinjaman.namaPlatform}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPinjaman(null)}
                className="text-gray-400 hover:text-gray-800 transition-colors w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            </div>

            {errorBayar && (
              <div className="p-3 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl">
                {errorBayar}
              </div>
            )}

            <form onSubmit={handleBayarSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 font-semibold block mb-1.5">
                  Nominal Pembayaran (Rp)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={nominalBayar}
                  onChange={(e) => setNominalBayar(formatNumberInput(e.target.value))}
                  placeholder="Masukkan nominal bayar"
                  className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors placeholder:text-gray-400"
                  required
                />

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedPinjaman.mode !== "pelunasan" ? (
                    <button
                      type="button"
                      onClick={() => setNominalBayar(selectedPinjaman.cicilanBulanan.toLocaleString("id-ID"))}
                      className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-[10px] text-gray-600 font-medium transition-colors"
                    >
                      1x Cicilan ({formatRupiah(selectedPinjaman.cicilanBulanan)})
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setNominalBayar(selectedPinjaman.totalYangHarusDibayar.toLocaleString("id-ID"))}
                      className="px-3 py-1.5 rounded-full bg-[#E74C3C]/10 text-[#E74C3C] text-[10px] font-bold transition-colors"
                    >
                      Lunasi Sekarang ({formatRupiah(selectedPinjaman.totalYangHarusDibayar)})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setNominalBayar(selectedPinjaman.totalYangHarusDibayar.toLocaleString("id-ID"))}
                    className="px-3 py-1.5 rounded-full bg-[#6C63F2]/10 border border-[#6C63F2]/20 hover:bg-[#6C63F2]/20 text-[10px] text-[#6C63F2] font-bold transition-colors"
                  >
                    Pelunasan ({formatRupiah(selectedPinjaman.totalYangHarusDibayar)})
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold block mb-1.5">Sumber Dana</label>
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
                  onClick={() => setSelectedPinjaman(null)}
                  disabled={loadingBayar}
                  className="w-1/2 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingBayar}
                  className="w-1/2 py-2.5 rounded-xl bg-[#6C63F2] text-sm font-bold text-white hover:bg-[#574CE8] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loadingBayar ? "Memproses..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}