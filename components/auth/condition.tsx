"use client";

import { useState } from "react";
import "material-icons/iconfont/material-icons.css";

interface ConditionProps {
  email: string;
  onNext: () => void;
  onSkip: () => void;
  onSwitchToProfileAuth: () => void;
}

export default function ConditionComponent({
  email,
  onNext,
  onSkip,
  onSwitchToProfileAuth,
}: ConditionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saldoSekarang, setSaldoSekarang] = useState("");
  const [sumberPemasukan, setSumberPemasukan] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/onboarding`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            saldoSekarang: Number(saldoSekarang),
            sumberPemasukan,
          }),
        },
      );

      const teksResponse = await response.text();

      if (!response.ok) {
        console.error(
          "ISI ERROR SIMPAN KONDISI KEUANGAN DARI SERVER:",
          teksResponse,
        );
        try {
          const parsedError = JSON.parse(teksResponse);
          throw new Error(parsedError.message || "Gagal menyimpan data.");
        } catch {
          throw new Error("Terjadi kesalahan pada server backend.");
        }
      }

      setLoading(false);
      onNext();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-[#6C63F2]/5">

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center px-14">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#6C63F2]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#6C63F2]/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-[#2EC4B6]/20 bg-[#6C63F2]">
              <span className="material-icons text-wh text-xl">account_balance_wallet</span>
            </div>
            <span className="text-gray-600 font-extrabold text-lg tracking-tight">FinZen</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-gray-600 bg-clip-text mb-4">
            Mulai Dari <br />
            <span className="bg-linear-to-r from-[#6C63F2] to-[#BEEDE8] bg-clip-text text-transparent">
              Kondisimu!
            </span>
          </h1>

          <p className="text-gray-600 text-sm font-semibold leading-relaxed mb-10">
            Ceritain sedikit kondisi keuanganmu, dipakai buat bikin rekomendasi
            yang sesuai sama kebutuhanmu.
          </p>

          <div className="space-y-4">
            {[
              { icon: "account_balance_wallet", text: "Saldo jadi acuan awal" },
              { icon: "payments", text: "Sumber pemasukan tercatat rapi" },
              { icon: "check_circle", text: "Langkah terakhir sebelum masuk" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-9 h-9 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="material-icons text-[#6C63F2] text-base">
                    {item.icon}
                  </span>
                </div>
                <span className="text-gray-600 text-sm font-medium">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 min-h-screen bg-[#F8F9FC] relative overflow-hidden flex flex-col justify-between p-8">
        <div className="w-full lg:max-w-md lg:mx-auto">
          <div className="w-10 h-10 mb-4">
            <button
              type="button"
              onClick={onSwitchToProfileAuth}
              className="flex items-center justify-center w-full h-full bg-[#3E3E3E] rounded-full border-2 border-white cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <span className="material-icons text-lg text-white leading-none">
                arrow_back
              </span>
            </button>
          </div>

          <div className="mt-6">
            <div className="w-full flex justify-between items-center gap-1 mb-2">
              <div className="w-1/2">
                <div className="p-1 bg-[#6C63F2] rounded-full"></div>
              </div>
              <div className="w-1/2">
                <div className="p-1 bg-[#6C63F2] rounded-full"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs font-medium">
                Informasi Keuangan
              </span>
              <span className="text-gray-600 text-xs font-medium text-end">
                Langkah 2 dari 2
              </span>
            </div>
          </div>

          <div className="w-full text-start mt-6 lg:hidden">
            <h2 className="bg-linear-to-r from-[#B4B4B5] to-white bg-clip-text text-transparent text-3xl font-extrabold tracking-tight leading-snug">
              Mulai Dari <br />
              <span className="bg-linear-to-r from-[#2EC4B6] to-[#BEEDE8] bg-clip-text text-transparent">
                Kondisimu!
              </span>
            </h2>

            <p className="text-sm mt-2 text-gray-600 font-medium leading-relaxed">
              Ceritain sedikit kondisi keuanganmu, dipakai buat bikin
              rekomendasi yang sesuai sama kebutuhanmu.
            </p>
          </div>

          {error && (
            <div className="p-3 mt-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-xl backdrop-blur-sm">
              {error}
            </div>
          )}

          <form
            id="condition-form"
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-4 my-6"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-wider text-gray-600">
                Saldo Sekarang
              </label>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-400 backdrop-blur-md focus-within:ring-2 focus-within:ring-[#6C63F2] focus-within:border-transparent transition-all">
                <span className="text-xs text-gray-400 select-none">Rp</span>
                <input
                  type="number"
                  name="saldoSekarang"
                  value={saldoSekarang}
                  onChange={(e) => setSaldoSekarang(e.target.value)}
                  placeholder="Contoh: 500.000"
                  className="w-full bg-transparent text-xs text-gray-600 placeholder:text-gray-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-wider text-gray-600">
                Sumber Pemasukan
              </label>
              <div className="relative flex items-center px-4 py-2.5 rounded-full border border-gray-400 backdrop-blur-md focus-within:ring-2 focus-within:ring-[#6C63F2] focus-within:border-transparent transition-all">
                <select
                  name="sumberpemasukan"
                  value={sumberPemasukan}
                  onChange={(e) => setSumberPemasukan(e.target.value)}
                  className={`w-full bg-transparent px-2 text-xs focus:outline-none appearance-none cursor-pointer pr-6 ${
                    sumberPemasukan === "" ? "text-gray-400" : "text-gray-600"
                  }`}
                  required
                >
                  <option
                    value=""
                    disabled
                    hidden
                    className="bg-[#F8F9FC] text-gray-600"
                  >
                    Pilih Sumber Pemasukan
                  </option>
                  {sumberPemasukanList.map((item) => (
                    <option
                      key={item}
                      value={item}
                      className="bg-[#F8F9FC] text-gray-600"
                    >
                      {item}
                    </option>
                  ))}
                </select>
                <span className="material-icons absolute right-4 text-gray-400 pointer-events-none text-base">
                  expand_more
                </span>
              </div>
            </div>
          </form>
        </div>

        <div className="w-full flex flex-col gap-3 pt-6 lg:max-w-md lg:mx-auto">
          <button
            type="submit"
            form="condition-form"
            disabled={loading}
            className="w-full py-3 bg-[#6C63F2] hover:bg-[#5a52d0] text-white font-bold text-sm rounded-full shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Lanjut"}
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="w-full py-3 text-sm text-[#6C63F2] bg-transparent border border-[#6C63F2] hover:border-gray-400 font-semibold rounded-full transition-all cursor-pointer"
          >
            Lewati
          </button>
        </div>
      </div>
    </div>
  );
}
