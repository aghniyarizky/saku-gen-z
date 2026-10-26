'use client';

import { useState, useEffect } from "react";
import 'material-icons/iconfont/material-icons.css';
import Sidebar from '../../../sidebar';
import { useRouter } from "next/navigation";
import Header from "../../../header";

import ConfirmDeleteModal from '../../../../confirm-delete'; 
import ToastSuccess from '../../../../msg-success';
import ToastError from '../../../../msg-error';
import { useToast } from '../../../../use-toast';

interface EditTargetNabungProps {
  targetId?: string | null;
  onSwitchToTargetNabung: () => void;
}

export default function EditTargetNabung({ targetId, onSwitchToTargetNabung }: EditTargetNabungProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [selectedIcon, setSelectedIcon] = useState("💻");
  const [namaTarget, setNamaTarget] = useState("");
  const [nominal, setNominal] = useState("");
  const [deadlineTarget, setDeadlineTarget] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toast = useToast();
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

  useEffect(() => {
    const fetchDetailTarget = async () => {
      if (!targetId) return;
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/target-tabung`,
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
          throw new Error(resData.message || "Gagal memuat daftar target.");
        }

        const list = resData.data || [];
        const item = list.find((p: any) => String(p._id) === String(targetId));

        if (item) {
          setSelectedIcon(item.icon || "🎯");
          setNamaTarget(item.namaTarget || "");
          setNominal(Number(item.targetNominal || 0).toLocaleString("id-ID"));
          if (item.deadlineTarget) {
            setDeadlineTarget(item.deadlineTarget.split("T")[0]);
          }
        } else {
          throw new Error("Target tabungan tidak ditemukan.");
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetailTarget();
  }, [targetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;
    setLoading(true);
    setError("");

    const nominalBersih = nominal.replace(/\./g, "").replace(/,/g, ".");

    try {
      const token = localStorage.getItem("token");
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/target-tabung/${targetId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            icon: selectedIcon,
            namaTarget,
            targetNominal: Number(nominalBersih),
            deadlineTarget,
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
        throw new Error(resData.message || "Gagal memperbarui target.");
      }

      toast.showToast("Data berhasil disimpan", "Perubahan target tabungan telah berhasil disimpan.", "success");
      
      setTimeout(() => {
        onSwitchToTargetNabung();
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
    if (!targetId) return;
    setShowDeleteModal(false);
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/target-tabung/${targetId}`,
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
        throw new Error(resData.message || "Gagal menghapus target.");
      }

      toast.showToast("Data berhasil dihapus", "Data target tabungan telah dihapus dari daftar.", "success");
      
      setTimeout(() => {
        onSwitchToTargetNabung();
      }, 2500);

    } catch (err: any) {
      toast.showToast("Gagal Menghapus", err.message || "Terjadi kesalahan saat menghapus.", "error");
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
          <div className="text-xl font-bold text-gray-900">Edit Target Nabung</div>
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
              
              <div className="grid grid-cols-6 gap-2 sm:gap-3 w-fit mx-auto">
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

          <div className="flex flex-col gap-3">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#6C63F2] text-sm text-white font-bold py-3.5 rounded-2xl hover:bg-[#574CE8] transition-colors cursor-pointer shadow-md shadow-[#6C63F2]/20 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>

            <button 
              type="button"
              onClick={confirmDelete}
              disabled={loading}
              className="w-full bg-red-50 text-red-500 text-sm font-bold py-3.5 rounded-2xl hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hapus Target
            </button>
          </div>
        </form>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={loading}
        title="Hapus Target Nabung?"
        description="Apakah kamu yakin ingin menghapus target tabungan ini? Tindakan ini tidak dapat dibatalkan."
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