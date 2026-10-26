'use client';

import { useState } from "react";
import 'material-icons/iconfont/material-icons.css';
import Sidebar from '../../sidebar';

import Header from "../../header";
import { useRouter } from "next/navigation";

interface TambahPinjamanProps {
  onSwitchToKelolaPinjaman: () => void;
}

export default function TambahPinjaman({ onSwitchToKelolaPinjaman }: TambahPinjamanProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [namaPlatformSelect, setNamaPlatformSelect] = useState("");
  const [namaPlatformCustom, setNamaPlatformCustom] = useState("");
  const [jenisPinjaman, setJenisPinjaman] = useState("");
  const [totalPinjaman, setTotalPinjaman] = useState("");
  const [tenorCicilan, setTenorCicilan] = useState("");
  const [cicilanPerBulan, setCicilanPerBulan] = useState("");
  const [totalBayar, setTotalBayar] = useState("");
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState("");
  const [statusPinjaman, setStatusPinjaman] = useState("Aktif");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const platformOptions = [
    { id: "ShopeePayLater", name: "ShopeePayLater" },
    { id: "GoPayLater", name: "GoPayLater" },
    { id: "Kredivo", name: "Kredivo" },
    { id: "Akulaku", name: "Akulaku" },
    { id: "Easycash", name: "Easycash" },
    { id: "Kredit Pintar", name: "Kredit Pintar" },
    { id: "Lainnya", name: "Lainnya (Ketik Manual)" },
  ];

  const jenisOptions = [
    { id: "Pinjaman Online", name: "Pinjaman Online" },
    { id: "Paylater", name: "Paylater" },
    { id: "KTA (Kredit Tanpa Agunan)", name: "KTA (Kredit Tanpa Agunan)" },
    { id: "Kredit Kendaraan", name: "Kredit Kendaraan" },
    { id: "Kredit Rumah (KPR)", name: "Kredit Rumah (KPR)" },
    { id: "Kartu Kredit", name: "Kartu Kredit" },
    { id: "Lainnya", name: "Lainnya" },
  ];

  const tenorOptions = [
    { id: "1", name: "1 Bulan" },
    { id: "3", name: "3 Bulan" },
    { id: "6", name: "6 Bulan" },
    { id: "12", name: "12 Bulan" },
    { id: "24", name: "24 Bulan" },
  ];

  const statusOptions = [
    { id: "Aktif", name: "Aktif / Belum Lunas" },
    { id: "Lunas", name: "Lunas" },
  ];

  // Fungsi untuk memformat angka dengan pemisah ribuan dan koma desimal
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const platformFinal = namaPlatformSelect === "Lainnya" ? namaPlatformCustom : namaPlatformSelect;

    // Bersihkan format titik dan koma untuk dikirim ke backend
    const totalPinjamanBersih = totalPinjaman.replace(/\./g, "").replace(/,/g, ".");
    const cicilanPerBulanBersih = cicilanPerBulan.replace(/\./g, "").replace(/,/g, ".");
    const totalBayarBersih = totalBayar.replace(/\./g, "").replace(/,/g, ".");

    if (!platformFinal.trim()) {
      setError("Silakan isi atau pilih Nama Platform.");
      return;
    }
    if (!jenisPinjaman) {
      setError("Silakan pilih Jenis Pinjaman.");
      return;
    }
    if (!totalPinjamanBersih || Number(totalPinjamanBersih) <= 0) {
      setError("Total Pinjaman harus lebih dari 0.");
      return;
    }
    if (!tenorCicilan) {
      setError("Silakan pilih Tenor Cicilan.");
      return;
    }
    if (!tanggalJatuhTempo) {
      setError("Silakan pilih Tanggal Jatuh Tempo.");
      return;
    }

    setLoading(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const payload = {
        namaPlatform: platformFinal,
        jenisPinjaman,
        totalPinjaman: Number(totalPinjamanBersih),
        tenorCicilan: Number(tenorCicilan),
        cicilanBulanan: Number(cicilanPerBulanBersih) || 0,
        totalYangHarusDibayar: totalBayarBersih ? Number(totalBayarBersih) : Number(totalPinjamanBersih),
        jatuhTempo: tanggalJatuhTempo,
        statusPinjaman,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/pinjaman/tambah-pinjaman`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menambahkan data pinjaman.");
      }

      onSwitchToKelolaPinjaman();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
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

        <div className="flex flex-row gap-4 items-center">
          <button 
            type="button"
            onClick={onSwitchToKelolaPinjaman}
            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            <span className="material-icons text-xl leading-none">arrow_back</span>
          </button>
          <div className="text-xl font-bold text-gray-900">Tambah Pinjaman</div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-sm mb-6">
            <div className="flex flex-col gap-4">
              
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Nama Platform</label>
                <div className="relative">
                  <select 
                    value={namaPlatformSelect}
                    onChange={(e) => setNamaPlatformSelect(e.target.value)}
                    className={`appearance-none bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer pr-10 ${
                      namaPlatformSelect === "" ? "text-gray-400" : "text-gray-800"
                    }`}
                  >
                    <option value="" disabled hidden>Pilih Nama Platform</option>
                    
                    {platformOptions.map((item) => (
                      <option key={item.id} value={item.id} className="bg-white text-gray-800">
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">
                    expand_more
                  </span>
                </div>

                {namaPlatformSelect === "Lainnya" && (
                  <input 
                    type="text"
                    value={namaPlatformCustom}
                    onChange={(e) => setNamaPlatformCustom(e.target.value)}
                    className="mt-3 bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors placeholder:text-gray-400"
                    placeholder="Ketikkan nama platform..."
                  />
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Jenis Pinjaman</label>
                <div className="relative">
                  <select 
                    value={jenisPinjaman}
                    onChange={(e) => setJenisPinjaman(e.target.value)}
                    className={`appearance-none bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer pr-10 ${
                      jenisPinjaman === "" ? "text-gray-400" : "text-gray-800"
                    }`}
                  >
                    <option value="" disabled hidden>Pilih Jenis Pinjaman</option>
                    {jenisOptions.map((item) => (
                      <option key={item.id} value={item.id} className="bg-white text-gray-800">
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">
                    expand_more
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Total Pinjaman</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-sm font-semibold text-gray-500">Rp</span>
                  <input 
                    type="text"
                    inputMode="decimal"
                    value={totalPinjaman}
                    onChange={(e) => {
                      const formatted = formatNumberInput(e.target.value);
                      setTotalPinjaman(formatted);
                    }}
                    className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm pl-12 pr-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors placeholder:text-gray-400"
                    placeholder="Contoh: 3.000.000"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Tenor Cicilan</label>
                <div className="relative">
                  <select 
                    value={tenorCicilan}
                    onChange={(e) => setTenorCicilan(e.target.value)}
                    className={`appearance-none bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer pr-10 ${
                      tenorCicilan === "" ? "text-gray-400" : "text-gray-800"
                    }`}
                  >
                    <option value="" disabled hidden>Pilih Tenor Cicilan</option>
                    {tenorOptions.map((item) => (
                      <option key={item.id} value={item.id} className="bg-white text-gray-800">
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">
                    expand_more
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Cicilan per Bulan</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-sm font-semibold text-gray-500">Rp</span>
                  <input 
                    type="text"
                    inputMode="decimal"
                    value={cicilanPerBulan}
                    onChange={(e) => {
                      const formatted = formatNumberInput(e.target.value);
                      setCicilanPerBulan(formatted);
                    }}
                    className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm pl-12 pr-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors placeholder:text-gray-400"
                    placeholder="Contoh: 300.000"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Total yang Harus Dibayar</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-sm font-semibold text-gray-500">Rp</span>
                  <input 
                    type="text"
                    inputMode="decimal"
                    value={totalBayar}
                    onChange={(e) => {
                      const formatted = formatNumberInput(e.target.value);
                      setTotalBayar(formatted);
                    }}
                    className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm pl-12 pr-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors placeholder:text-gray-400"
                    placeholder="Biarkan kosong jika sama dengan Total Pinjaman"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Jatuh Tempo</label>
                <input 
                  type="date"
                  value={tanggalJatuhTempo}
                  onChange={(e) => setTanggalJatuhTempo(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer"
                />
              </div>

              {/* <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Status Pinjaman</label>
                <div className="relative">
                  <select 
                    value={statusPinjaman}
                    onChange={(e) => setStatusPinjaman(e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer pr-10"
                  >
                    {statusOptions.map((item) => (
                      <option key={item.id} value={item.id} className="bg-white text-gray-800">
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">
                    expand_more
                  </span>
                </div>
              </div> */}

            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#6C63F2] text-sm text-white font-bold py-3.5 rounded-2xl hover:bg-[#574CE8] transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-[#6C63F2]/20"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </div>
    </div>
  );
}