"use client";

import { useState } from "react";
import "material-icons/iconfont/material-icons.css";

interface PemasukanProps {
  onSuccess?: () => void;
}

export default function Pemasukan({ onSuccess }: PemasukanProps) {
  const [catatanTransaksi, setCatatanTransaksi] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSumberDana, setSelectedSumberDana] = useState("");
  const [nominal, setNominal] = useState("");
  const [tanggal, setTanggal] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const categories = [
    { id: "Gaji", name: "Gaji" },
    { id: "Uang Saku", name: "Uang Saku" },
    { id: "Part-time", name: "Part-time" },
    { id: "Freelance", name: "Freelance" },
    { id: "Beasiswa", name: "Beasiswa" },
    { id: "Bisnis Kecil", name: "Bisnis Kecil" },
    { id: "Investasi", name: "Investasi" },
    { id: "Lainnya", name: "Lainnya" },
  ];

  const sumberDana = [
    { id: "Tunai", name: "Tunai" },
    { id: "Gopay", name: "Gopay" },
    { id: "DANA", name: "DANA" },
    { id: "ShopeePay", name: "ShopeePay" },
    { id: "Bank Mandiri", name: "Bank Mandiri" },
    { id: "BSI", name: "BSI" },
    { id: "BRI", name: "BRI" },
    { id: "BTN", name: "BTN" },
    { id: "BSA", name: "BSA" },
    { id: "OVO", name: "OVO" },
    { id: "Lainnya", name: "Lainnya" },
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
    setSuccess(false);
    setLoading(true);

    const nominalBersih = nominal.replace(/\./g, "").replace(/,/g, ".");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/transaksi`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            Catatan_Transaksi: catatanTransaksi,
            tipe: "pemasukan",
            kategori: selectedCategory,
            Sumber_Dana: selectedSumberDana,
            nominal: Number(nominalBersih),
            tanggal: tanggal || undefined,
          }),
        },
      );

      const teksResponse = await response.text();

      if (!response.ok) {
        console.error("ISI ERROR TAMBAH PEMASUKAN DARI SERVER:", teksResponse);
        try {
          const parsedError = JSON.parse(teksResponse);
          throw new Error(parsedError.message || "Gagal menyimpan transaksi.");
        } catch {
          throw new Error("Terjadi kesalahan pada server backend.");
        }
      }

      setSuccess(true);
      setCatatanTransaksi("");
      setSelectedCategory("");
      setSelectedSumberDana("");
      setNominal("");
      setTanggal("");

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-sm">
      {error && (
        <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 mb-4 text-sm text-[#05DF72] bg-[#05DF72]/10 border border-[#05DF72]/20 rounded-2xl">
          Transaksi pemasukan berhasil disimpan!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Catatan Transaksi</label>
              <input
                type="text"
                value={catatanTransaksi}
                onChange={(e) => setCatatanTransaksi(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors placeholder:text-gray-400"
                placeholder="Masukkan Catatan Transaksi"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Kategori</label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`appearance-none bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer pr-10 ${
                    selectedCategory === "" ? "text-gray-400" : "text-gray-800"
                  }`}
                  required
                >
                  <option value="" disabled hidden>Pilih Kategori Transaksi</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-white text-gray-800">
                      {cat.name}
                    </option>
                  ))}
                </select>
                <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">
                  expand_more
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Sumber Dana</label>
              <div className="relative">
                <select
                  value={selectedSumberDana}
                  onChange={(e) => setSelectedSumberDana(e.target.value)}
                  className={`appearance-none bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer pr-10 ${
                    selectedSumberDana === "" ? "text-gray-400" : "text-gray-800"
                  }`}
                  required
                >
                  <option value="" disabled hidden>Pilih Sumber Dana</option>
                  {sumberDana.map((dana) => (
                    <option key={dana.id} value={dana.id} className="bg-white text-gray-800">
                      {dana.name}
                    </option>
                  ))}
                </select>
                <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base">
                  expand_more
                </span>
              </div>
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
                  placeholder="Contoh: 500.000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Tanggal</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#6C63F2] text-sm text-white font-bold py-3 rounded-2xl hover:bg-[#574CE8] transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-[#6C63F2]/20"
        >
          {loading ? "Menyimpan..." : "Simpan Pemasukan"}
        </button>
      </form>
    </div>
  );
}