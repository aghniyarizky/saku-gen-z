'use client';

import { useState } from "react";
import 'material-icons/iconfont/material-icons.css';
import { useRouter } from "next/navigation";
import Sidebar from '../../sidebar';
import Header from "../../header";

interface TambahDompetProps {
  onSwitchToDompet: () => void;
}

export default function TambahDompet({ onSwitchToDompet }: TambahDompetProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [namaDompet, setNamaDompet] = useState("");
  const [tipeDompet, setTipeDompet] = useState("");
  const [saldoAwal, setSaldoAwal] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const tipeOptions = [
    { id: "Tunai", name: "Tunai" },
    { id: "Debit", name: "Debit" },
    { id: "E-Money", name: "E-Money" },
    { id: "Kredit", name: "Kredit" },
    { id: "Investasi", name: "Investasi" },
  ];

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

    const saldoBersih = saldoAwal.replace(/\./g, "").replace(/,/g, ".");

    if (!namaDompet.trim()) {
      setError("Silakan isi Nama Dompet.");
      return;
    }
    if (!tipeDompet) {
      setError("Silakan pilih Tipe Dompet.");
      return;
    }
    if (!saldoBersih || Number(saldoBersih) < 0) {
      setError("Saldo Awal tidak boleh kosong atau negatif.");
      return;
    }

    setLoading(true);

    try {
      // Simulasi API call
      console.log("Tambah Dompet:", {
        namaDompet,
        tipeDompet,
        saldoAwal: Number(saldoBersih),
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSwitchToDompet();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan dompet.");
    } finally {
      setLoading(false);
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

        <div className="flex flex-row gap-4 items-center">
          <button 
            type="button"
            onClick={onSwitchToDompet}
            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            <span className="material-icons text-xl leading-none">arrow_back</span>
          </button>
          <div className="text-xl font-bold text-gray-900">Tambah Dompet</div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-sm mb-6 flex flex-col gap-4">
            
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Nama Dompet</label>
              <input 
                type="text"
                value={namaDompet}
                onChange={(e) => setNamaDompet(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors placeholder:text-gray-400"
                placeholder="Contoh: Dompet Utama, Gopay, dll"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Tipe Dompet</label>
              <div className="relative">
                <select 
                  value={tipeDompet}
                  onChange={(e) => setTipeDompet(e.target.value)}
                  className={`appearance-none bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer pr-10 ${
                    tipeDompet === "" ? "text-gray-400" : "text-gray-800"
                  }`}
                >
                  <option value="" disabled hidden>Pilih Tipe Dompet</option>
                  {tipeOptions.map((item) => (
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
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Saldo Awal</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-semibold text-gray-500">Rp</span>
                <input 
                  type="text"
                  inputMode="decimal"
                  value={saldoAwal}
                  onChange={(e) => setSaldoAwal(formatNumberInput(e.target.value))}
                  className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm pl-12 pr-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors placeholder:text-gray-400"
                  placeholder="Contoh: 500.000"
                />
              </div>
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