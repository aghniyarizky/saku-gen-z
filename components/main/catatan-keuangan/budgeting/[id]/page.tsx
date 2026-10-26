'use client';

import { useState, useEffect } from 'react';
import 'material-icons/iconfont/material-icons.css';
import { useRouter } from "next/navigation";
import Sidebar from '../../../sidebar';
import Header from "../../../header";

import ConfirmDeleteModal from '../../../../confirm-delete';
import ToastSuccess from '../../../../msg-success';
import ToastError from '../../../../msg-error';
import { useToast } from '../../../../use-toast';

interface EditBudgetingProps {
  budgetingId: string | number | null;
  onSwitchToBudgeting: () => void;
}

export default function EditBudgeting({ budgetingId, onSwitchToBudgeting }: EditBudgetingProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [kategoriBudget, setKategoriBudget] = useState("");
  const [batasBulan, setBatasBulan] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const toast = useToast();
  const router = useRouter();

  const jenisOptions = [
    { id: "Makanan", name: "Makanan & Minuman" },
    { id: "Transportasi", name: "Transportasi / Bensin" },
    { id: "Uang Saku", name: "Uang Saku" },
    { id: "Pendidikan", name: "Pendidikan / Kuliah" },
    { id: "Belanja", name: "Belanja / kebutuhan" },
    { id: "Hiburan", name: "Hiburan / Game" },
    { id: "Tagihan", name: "Tagihan / Listrik / Air" },
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

  useEffect(() => {
    const fetchDetailBudget = async () => {
      if (!budgetingId) return;
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/budgeting`,
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
          throw new Error(resData.message || "Gagal memuat daftar budget.");
        }

        const list = resData.data || [];
        const item = list.find((p: any) => String(p._id) === String(budgetingId));

        if (item) {
          setKategoriBudget(item.Kategori_Budget || "");
          setBatasBulan(Number(item.Batas_PerBulan || 0).toLocaleString("id-ID"));
          if (item.Tanggal_Mulai) setTanggalMulai(item.Tanggal_Mulai.split("T")[0]);
          if (item.Tanggal_Selesai) setTanggalSelesai(item.Tanggal_Selesai.split("T")[0]);
        } else {
          throw new Error("Budget tidak ditemukan dalam daftar.");
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetailBudget();
  }, [budgetingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetingId) return;
    setLoading(true);
    setError("");
    
    const nominalBersih = batasBulan.replace(/\./g, "").replace(/,/g, ".");
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/budgeting/${budgetingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            Kategori_Budget: kategoriBudget,
            Batas_PerBulan: Number(nominalBersih),
            Tanggal_Mulai: tanggalMulai,
            Tanggal_Selesai: tanggalSelesai,
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
        throw new Error(resData.message || "Gagal memperbarui budget.");
      }

      toast.showToast("Data berhasil disimpan", "Perubahan budget telah berhasil disimpan.", "success");
      
      setTimeout(() => {
        onSwitchToBudgeting();
      }, 2500);

    } catch (err: any) {
      toast.showToast("Gagal Menyimpan", err.message || "Terjadi kesalahan saat menyimpan.", "error");
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!budgetingId) return;
    setShowDeleteModal(false);
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/budgeting/${budgetingId}`,
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
        throw new Error(resData.message || "Gagal menghapus budget.");
      }

      toast.showToast("Data berhasil dihapus", "Data budget telah dihapus dari daftar.", "success");
      
      setTimeout(() => {
        onSwitchToBudgeting();
      }, 2500);

    } catch (err: any) {
      toast.showToast("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus.", "error");
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
            onClick={onSwitchToBudgeting}
            className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            <span className="material-icons text-xl leading-none">arrow_back</span>
          </button>
          <div className="text-xl font-bold text-gray-900">Edit Budget</div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-sm mb-6 flex flex-col gap-4">
            
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Kategori Budget</label>
              <div className="relative">
                <select 
                  value={kategoriBudget}
                  onChange={(e) => setKategoriBudget(e.target.value)}
                  className={`appearance-none bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer pr-10 ${
                    kategoriBudget === "" ? "text-gray-400" : "text-gray-800"
                  }`}
                >
                  <option value="" disabled hidden>Pilih Kategori Budget</option>
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
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Batas per Bulan</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-semibold text-gray-500">Rp</span>
                <input 
                  type="text"
                  inputMode="decimal"
                  value={batasBulan}
                  onChange={(e) => {
                    const formatted = formatNumberInput(e.target.value);
                    setBatasBulan(formatted);
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm pl-12 pr-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors placeholder:text-gray-400"
                  placeholder="Contoh: 3.000.000"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Tanggal Mulai</label>
              <input 
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Tanggal Selesai</label>
              <input 
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6C63F2] text-sm text-white font-bold py-3.5 rounded-2xl hover:bg-[#574CE8] transition-colors cursor-pointer shadow-md shadow-[#6C63F2]/20 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

            <button
              type="button"
              onClick={confirmDelete}
              disabled={loading}
              className="w-full bg-red-50 text-red-500 text-sm font-bold py-3.5 rounded-2xl hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hapus Budget
            </button>
          </div>
        </form>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={loading}
        title="Hapus Budget?"
        description="Apakah kamu yakin ingin menghapus data budget ini? Tindakan ini tidak dapat dibatalkan."
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