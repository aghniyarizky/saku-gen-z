'use client';

import { useState } from "react";
import Link from "next/link";
import 'material-icons/iconfont/material-icons.css';
import Sidebar from '../../sidebar';

import { useRouter } from "next/navigation";
import Header from "../../header";

interface TambahTargetNabungProps {
  onSwitchToTargetNabung: () => void;
}

export default function TambahTargetNabung({ 
  onSwitchToTargetNabung 
}: TambahTargetNabungProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [selectedIcon, setSelectedIcon] = useState("🎯");
  const [namaTarget, setNamaTarget] = useState("");
  const [nominal, setNominal] = useState("");
  const [deadlineTarget, setDeadlineTarget] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const iconsList = [
    { id: "target", label: "🎯" },
    { id: "laptop", label: "💻" },
    { id: "plane", label: "✈️" },
    { id: "house", label: "🏠" },
    { id: "car", label: "🚗" },
    { id: "smartphone", label: "📱" },
    { id: "ring", label: "💍" },
    { id: "game", label: "🎮" },
    { id: "guitar", label: "🎸" },
    { id: "camera", label: "📷" },
    { id: "gift", label: "🎁" },
    { id: "graduation", label: "🎓" },
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

    const nominalBersih = nominal.replace(/\./g, "").replace(/,/g, ".");
    const nominalAngka = Number(nominalBersih);

    if (!namaTarget.trim()) {
      setError("Silakan isi Nama Target.");
      return;
    }
    if (!nominalBersih || isNaN(nominalAngka) || nominalAngka <= 0) {
      setError("Target Nominal harus lebih dari 0.");
      return;
    }
    if (!deadlineTarget) {
      setError("Silakan pilih Deadline Target.");
      return;
    }
    if (new Date(deadlineTarget) <= new Date()) {
      setError("Deadline Target harus di masa mendatang.");
      return;
    }

    setLoading(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const payload = {
        icon: selectedIcon,
        namaTarget: namaTarget.trim(),
        targetNominal: nominalAngka,
        deadlineTarget,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/target-tabung/tambah-target`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal membuat target tabung baru.");
      }

      onSwitchToTargetNabung();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan target tabung.");
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
            onClick={onSwitchToTargetNabung}
            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            <span className="material-icons text-xl leading-none">arrow_back</span>
          </button>
          <div className="text-xl font-bold text-gray-900">Tambah Target Nabung</div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-sm mb-6 flex flex-col gap-6">
            
            <div className="flex flex-col gap-3 items-center">
              <label className="text-xs text-gray-500 font-semibold self-start">Icon</label>
              
              <div className="grid md:grid-cols-12 grid-cols-6 gap-2 sm:gap-3 w-fit mx-auto">
                {iconsList.map((item) => {
                  const isSelected = selectedIcon === item.label;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedIcon(item.label)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-[#F3F2FE] border-2 border-[#6C63F2]" 
                          : "bg-white border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center justify-center leading-none mt-0.5">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Nama Target</label>
              <input 
                type="text"
                value={namaTarget}
                onChange={(e) => setNamaTarget(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors placeholder:text-gray-400"
                placeholder="Contoh: Laptop Baru"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Nominal</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-semibold text-gray-500">Rp</span>
                <input 
                  type="text"
                  inputMode="decimal"
                  value={nominal}
                  onChange={(e) => setNominal(formatNumberInput(e.target.value))}
                  className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm pl-12 pr-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors placeholder:text-gray-400"
                  placeholder="Contoh: 5.000.000"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Deadline Target</label>
              <input 
                type="date"
                value={deadlineTarget}
                onChange={(e) => setDeadlineTarget(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer"
              />
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