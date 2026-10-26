"use client";

import { useState, useEffect } from "react";
import "material-icons/iconfont/material-icons.css";
import Header from "./header";
import Sidebar from "./sidebar";
import { useRouter } from "next/navigation";

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  userData: {
    username: string;
    email: string;
    fullName: string;
    fotoProfilUrl: string;
    sumberPemasukan: string;
  };
  onSave: (newData: any) => void;
}

export default function EditProfile({
  isOpen,
  onClose,
  onBack,
  userData: initialUserData,
  onSave,
}: EditProfileProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: initialUserData?.username || "",
    email: initialUserData?.email || "",
    fullName: initialUserData?.fullName || "",
    fotoProfilUrl: initialUserData?.fotoProfilUrl || "",
    sumberPemasukan: initialUserData?.sumberPemasukan || "",
  });

  const sumberPemasukanList = [
    "Gaji",
    "Uang Saku",
    "Part-time",
    "Freelance",
    "Beasiswa",
    "Bisnis Kecil",
    "Investasi",
    "Lainnya",
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/profile`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.ok) {
            const data = await res.json();
            setFormData({
              username: data.username || "",
              email: data.email || "",
              fullName: data.fullName || "",
              fotoProfilUrl: data.fotoProfilUrl || "",
              sumberPemasukan: data.sumberPemasukan || "",
            });
          }
        }
      } catch (err: any) {
        console.error("Gagal memuat profil:", err);
      }
    };

    if (isOpen) {
      setError("");
      fetchProfileData();
    }
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

          setFormData((prev) => ({
            ...prev,
            fotoProfilUrl: compressedBase64,
          }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClick = async () => {
    setLoading(true);
    setError("");
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: formData.username,
            fullName: formData.fullName,
            fotoProfilUrl: formData.fotoProfilUrl,
            sumberPemasukan: formData.sumberPemasukan,
          }),
        }
      );

      const contentType = res.headers.get("content-type");
      let result;

      if (contentType && contentType.includes("application/json")) {
        result = await res.json();
      } else {
        throw new Error(
          "Sesi Anda mungkin sudah habis atau terjadi gangguan pada server. Silakan login ulang."
        );
      }

      if (!res.ok) {
        throw new Error(
          result.message || result.error || "Gagal memperbarui profil."
        );
      }

      const updatedData = {
        username: result.data?.user?.username || formData.username,
        fullName: result.data?.user?.fullName || formData.fullName,
        email: formData.email,
        fotoProfilUrl: result.data?.fotoProfilUrl || formData.fotoProfilUrl,
        sumberPemasukan:
          result.data?.sumberPemasukan || formData.sumberPemasukan,
      };

      onSave(updatedData);
      onClose();
    } catch (err: any) {
      console.error("Gagal menyimpan perubahan profil:", err);
      setError(
        err.message ||
          "Terjadi kesalahan saat menyimpan data. Periksa kembali koneksi Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-full h-full p-4 md:p-6 py-8 flex flex-col bg-[#F8F9FC] text-gray-800 overflow-y-auto overflow-x-hidden relative font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Kontainer Utama Dashboard */}
      <div className="lg:max-w-5xl lg:mx-auto lg:w-full flex flex-col gap-5">
        
        {/* Header Dashboard */}
        <div className="w-full flex flex-row items-center justify-between">
          <Header
            title="Edit Profil"
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onProfileClick={() => router.push("/?mode=profile-edit")}
          />
        </div>

        {/* Card Form Profil */}
        <div className="w-full bg-white border border-gray-100 p-5 md:p-8 rounded-3xl shadow-sm">
          
          {/* Header Card & Tombol Back */}
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-5">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-800 flex items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 w-10 h-10 rounded-full shrink-0"
              >
                <span className="material-icons text-xl">arrow_back</span>
              </button>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Informasi Pribadi</h2>
                <p className="text-xs text-gray-500 mt-0.5">Perbarui data diri dan foto profilmu.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-800 cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm flex items-start gap-2">
              <span className="material-icons text-sm shrink-0 mt-0.5">error_outline</span>
              <span>{error}</span>
            </div>
          )}

          {/* Layout 2 Kolom */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            
            {/* Kolom Kiri: Foto Profil */}
            <div className="w-full md:w-auto flex flex-col items-center shrink-0 mx-auto md:mx-0">
              <div className="relative w-36 h-36 md:w-44 md:h-44">
                <div className="w-full h-full rounded-full flex justify-center items-center p-1 border-2 border-[#E8E6FD] overflow-hidden bg-white shadow-sm">
                  <img
                    src={
                      isMounted && formData.fotoProfilUrl
                        ? formData.fotoProfilUrl
                        : "/default-avatar.png"
                    }
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/default-avatar.png";
                    }}
                  />
                </div>

                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-9 h-9 md:w-10 md:h-10 bg-[#6C63F2] hover:bg-[#574CE8] rounded-full flex items-center justify-center cursor-pointer shadow-md transition-all active:scale-95 border-2 border-white z-10"
                >
                  <span className="material-icons text-lg text-white select-none">
                    photo_camera
                  </span>
                </label>

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <p className="text-[11px] text-gray-400 mt-4 text-center max-w-[140px] leading-relaxed">
                Format JPG/PNG.<br />Maksimal 2MB.
              </p>
            </div>

            {/* Kolom Kanan: Form Input */}
            <div className="flex-1 w-full flex flex-col gap-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-semibold">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-semibold">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-semibold">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-semibold">Sumber Pemasukan</label>
                  <div className="relative flex items-center">
                    <select
                      value={formData.sumberPemasukan}
                      onChange={(e) => setFormData({ ...formData, sumberPemasukan: e.target.value })}
                      className={`w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6C63F2] focus:bg-white appearance-none cursor-pointer pr-10 transition-colors ${
                        !formData.sumberPemasukan ? "text-gray-400" : "text-gray-800"
                      }`}
                    >
                      <option value="" disabled hidden className="bg-white text-gray-400">
                        Pilih Sumber Pemasukan
                      </option>
                      {sumberPemasukanList.map((item) => (
                        <option key={item} value={item} className="bg-white text-gray-800">
                          {item}
                        </option>
                      ))}
                    </select>
                    <span className="material-icons absolute right-4 text-gray-400 pointer-events-none text-base">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {/* Tombol Simpan */}
              <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSaveClick}
                  disabled={loading}
                  className="w-full md:w-auto bg-[#6C63F2] text-sm text-white font-bold py-3 px-8 rounded-full hover:bg-[#574CE8] transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-[#6C63F2]/20"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}