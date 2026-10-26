'use client';

import { useState, useEffect } from 'react';
import 'material-icons/iconfont/material-icons.css';
import Sidebar from '../../../sidebar';
import { useRouter } from "next/navigation";
import Header from "../../../header";

import ConfirmDeleteModal from '../../../../confirm-delete'; 
import ToastSuccess from '../../../../msg-success';
import ToastError from '../../../../msg-error';
import { useToast } from '../../../../use-toast';

interface EditPinjamanProps {
  pinjamanId: string | number | null;
  onSwitchToTransaction?: () => void;
}

const platformOptions = [
  { id: "Shopee PayLater", name: "Shopee PayLater" },
  { id: "EasyCash", name: "EasyCash" },
  { id: "Gopay Later", name: "Gopay Later" },
  { id: "Kredivo", name: "Kredivo" },
];

const jenisOptions = [
  { id: "Bunga Tetap", name: "Bunga Tetap" },
  { id: "Bunga Anuitas", name: "Bunga Anuitas" },
  { id: "Bunga Efektif", name: "Bunga Efektif" },
];

const tenorOptions = [
  { id: "1", name: "1 Bulan" },
  { id: "3", name: "3 Bulan" },
  { id: "6", name: "6 Bulan" },
  { id: "12", name: "12 Bulan" },
  { id: "24", name: "24 Bulan" },
];

export default function EditPinjaman({ pinjamanId, onSwitchToTransaction }: EditPinjamanProps) {
  const [namaPlatform, setNamaPlatform] = useState("");
  const [jenisPinjaman, setJenisPinjaman] = useState("");
  const [totalPinjaman, setTotalPinjaman] = useState("");
  const [tenorCicilan, setTenorCicilan] = useState("");
  const [cicilanPerBulan, setCicilanPerBulan] = useState("");
  const [totalBayar, setTotalBayar] = useState("");
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState("");
  const [statusPinjaman, setStatusPinjaman] = useState("");
  
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toast = useToast();

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

  useEffect(() => {
    const fetchDetailPinjaman = async () => {
      if (!pinjamanId) return;
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/pinjaman`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        const textRes = await res.text();
        let resData;
        try {
          resData = JSON.parse(textRes);
        } catch {
          throw new Error("Respon server bukan format JSON yang valid.");
        }

        if (!res.ok) {
          throw new Error(resData.message || "Gagal memuat daftar pinjaman.");
        }

        const list = resData.data || [];
        const item = list.find((p: any) => String(p._id) === String(pinjamanId));

        if (item) {
          setNamaPlatform(item.namaPlatform || "");
          setJenisPinjaman(item.jenisPinjaman || "");
          setTotalPinjaman(Number(item.totalPinjaman || 0).toLocaleString("id-ID"));
          setTenorCicilan(String(item.tenorCicilan || ""));
          setCicilanPerBulan(Number(item.cicilanBulanan || 0).toLocaleString("id-ID"));
          setTotalBayar(Number(item.totalYangHarusDibayar || 0).toLocaleString("id-ID"));
          if (item.jatuhTempo) {
            setTanggalJatuhTempo(item.jatuhTempo.split("T")[0]);
          }
          setStatusPinjaman(item.statusPinjaman || "");
        } else {
          throw new Error("Pinjaman tidak ditemukan dalam daftar.");
        }
      } catch (err: unknown) {
        const errorObj = err as Error;
        setError(errorObj.message || "Gagal memuat detail pinjaman.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetailPinjaman();
  }, [pinjamanId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinjamanId) return;
    setLoading(true);
    setError("");

    const totalBersih = totalPinjaman.replace(/\./g, "").replace(/,/g, ".");
    const cicilanBersih = cicilanPerBulan.replace(/\./g, "").replace(/,/g, ".");
    const bayarBersih = totalBayar.replace(/\./g, "").replace(/,/g, ".");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/pinjaman/${pinjamanId}`, 
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            namaPlatform,
            jenisPinjaman,
            totalPinjaman: Number(totalBersih),
            tenorCicilan: Number(tenorCicilan),
            cicilanBulanan: Number(cicilanBersih),
            totalYangHarusDibayar: Number(bayarBersih),
            jatuhTempo: tanggalJatuhTempo,
            statusPinjaman,
          }),
        }
      );

      const textRes = await res.text();
      let resData;
      try {
        resData = JSON.parse(textRes);
      } catch {
        throw new Error("Respon server bukan format JSON yang valid.");
      }

      if (!res.ok) {
        throw new Error(resData.message || "Gagal memperbarui pinjaman.");
      }

      toast.showToast("Data berhasil disimpan", "Perubahan data pinjaman telah berhasil disimpan.", "success");
      
      setTimeout(() => {
        if (onSwitchToTransaction) {
          onSwitchToTransaction();
        }
      }, 2500);

    } catch (err: unknown) {
      const errorObj = err as Error;
      toast.showToast("Gagal Menyimpan", errorObj.message || "Terjadi kesalahan saat menyimpan data.", "error");
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!pinjamanId) return;
    setShowDeleteModal(false);
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/pinjaman/${pinjamanId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const textRes = await res.text();
      let resData;
      try {
        resData = JSON.parse(textRes);
      } catch {
        throw new Error(`Server merespons bukan JSON.`);
      }

      if (!res.ok) {
        throw new Error(resData.message || "Gagal menghapus pinjaman.");
      }

      toast.showToast("Data berhasil dihapus", "Data pinjaman telah dihapus dari daftar.", "success");
      
      setTimeout(() => {
        if (onSwitchToTransaction) {
          onSwitchToTransaction();
        }
      }, 2500);

    } catch (err: unknown) {
      const errorObj = err as Error;
      toast.showToast("Gagal Menghapus", errorObj.message || "Terjadi kesalahan saat menghapus data.", "error");
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

        <div className="flex flex-row items-center gap-4">
          <button 
            type="button"
            onClick={onSwitchToTransaction}
            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            <span className="material-icons text-xl select-none">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Edit Pinjaman</h1>
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-sm mb-6 flex flex-col gap-4">
            
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Nama Platform</label>
              <div className="relative">
                <select 
                  value={namaPlatform}
                  onChange={(e) => setNamaPlatform(e.target.value)}
                  className={`appearance-none bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer pr-10 ${
                    namaPlatform === "" ? "text-gray-400" : "text-gray-800"
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
                  placeholder="Masukkan jumlah total pinjaman"
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
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Cicilan Perbulan</label>
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
                  placeholder="Masukkan nominal cicilan per bulan"
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
                  placeholder="Masukkan total nominal yang harus dibayar"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Tanggal Jatuh Tempo</label>
              <input 
                type="date"
                value={tanggalJatuhTempo}
                onChange={(e) => setTanggalJatuhTempo(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer"
              />
            </div>

          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#6C63F2] text-white text-sm font-bold hover:bg-[#574CE8] transition-colors cursor-pointer shadow-md shadow-[#6C63F2]/20 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={confirmDelete}
              className="w-full py-3.5 rounded-2xl bg-red-50 text-red-500 text-sm font-bold hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hapus Pinjaman
            </button>
          </div>
        </form>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={loading}
        title="Hapus Pinjaman?"
        description="Apakah kamu yakin ingin menghapus data pinjaman ini? Tindakan ini tidak dapat dibatalkan."
      />

      {toast.type === "success" ? (
        <ToastSuccess
          isVisible={toast.isVisible}
          onClose={toast.hideToast}
          title={toast.title}
          message={toast.message}
        />
      ) : (
        <ToastError
          isVisible={toast.isVisible}
          onClose={toast.hideToast}
          title={toast.title}
          message={toast.message}
        />
      )}
    </div>
  );
}