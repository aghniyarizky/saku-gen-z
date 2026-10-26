"use client";

import { useState, useEffect, useCallback } from "react";
import "material-icons/iconfont/material-icons.css";
import { useRouter } from "next/navigation";
import Header from "../header";
import Sidebar from "../sidebar";

interface SubScoreAPI {
  skor: number;
  maksimal: number;
  persentase: number;
  status: "Excellent" | "Good" | "Perlu Perhatian" | "Buruk";
  ringkasan: string;
  saranPerkembangan: string[];
}

interface FinancialHealthAPI {
  skorTotal: number;
  grade: "A" | "B" | "C" | "D" | "E";
  targetNabung: SubScoreAPI;
  disiplinAnggaran: SubScoreAPI;
  pengelolaanPinjaman: SubScoreAPI;
  updatedAt: string;
}

const METRIC_CONFIG = {
  targetNabung: {
    key: "target-nabung",
    title: "Target Nabung",
    icon: "savings",
    iconBg: "bg-[#05DF72]/15",
    iconColor: "text-[#05DF72]",
    barColor: "bg-[#05DF72]",
    scoreColor: "text-[#05DF72]",
  },
  disiplinAnggaran: {
    key: "disiplin-anggaran",
    title: "Disiplin Anggaran",
    icon: "track_changes",
    iconBg: "bg-[#6C63F2]/15",
    iconColor: "text-[#6C63F2]",
    barColor: "bg-[#6C63F2]",
    scoreColor: "text-[#6C63F2]",
  },
  pengelolaanPinjaman: {
    key: "pengelolaan-pinjaman",
    title: "Pengelolaan Pinjaman",
    icon: "credit_card",
    iconBg: "bg-[#FFB700]/15",
    iconColor: "text-[#FFB700]",
    barColor: "bg-[#FFB700]",
    scoreColor: "text-[#FFB700]",
  },
} as const;

const STATUS_BADGE_COLOR: Record<SubScoreAPI["status"], string> = {
  Excellent: "bg-[#05DF72]/15 text-[#05DF72]",
  Good: "bg-[#6C63F2]/15 text-[#6C63F2]",
  "Perlu Perhatian": "bg-[#FFB700]/15 text-[#FFB700]",
  Buruk: "bg-[#E74C3C]/15 text-[#E74C3C]",
};

const GRADE_COLOR: Record<string, { text: string; bg: string }> = {
  A: { text: "text-[#6C63F2]", bg: "bg-[#F3F2FE]" },
  B: { text: "text-[#05DF72]", bg: "bg-[#05DF72]/10" },
  C: { text: "text-[#FFB700]", bg: "bg-[#FFB700]/10" },
  D: { text: "text-orange-500", bg: "bg-orange-500/10" },
  E: { text: "text-[#E74C3C]", bg: "bg-[#E74C3C]/10" },
};

const STATUS_TEXT_BY_GRADE: Record<string, string> = {
  A: "Kondisi Keuanganmu Sangat Sehat! 🎉",
  B: "Kondisi Keuanganmu Hampir Sehat! 🎉",
  C: "Kondisi Keuanganmu Cukup Stabil 👍",
  D: "Kondisi Keuanganmu Perlu Perbaikan ⚠️",
  E: "Kondisi Keuanganmu Berisiko Tinggi ⚠️",
};

const formatTanggalWaktu = (isoString: string) => {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
};

export default function FinancialHealth() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState<FinancialHealthAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<number>(1);
  const router = useRouter();

  const getToken = () => {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  };

  const fetchLatestData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/financial-health`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal mengambil data Financial Health");
      }

      setData(json.data || null);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setErrorMsg(errorObj.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestData();
  }, [fetchLatestData]);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    setErrorMsg(null);
    setLoadingStep(1);

    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/financial-health/output`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.body) throw new Error("Response body tidak tersedia");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const parsed = JSON.parse(line.slice(6));

          if (parsed.type === "step") {
            if (parsed.step === "targetNabung") setLoadingStep(1);
            else if (parsed.step === "disiplinAnggaran") setLoadingStep(2);
            else if (parsed.step === "pengelolaanPinjaman") setLoadingStep(3);
          } else if (parsed.type === "done") {
            setLoadingStep(3);
            setTimeout(() => {
              setData(parsed.data);
              setIsRecalculating(false);
            }, 500);
          } else if (parsed.type === "error") {
            setErrorMsg(parsed.message || "Gagal menghitung Financial Health");
            setIsRecalculating(false);
          }
        }
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setErrorMsg(errorObj.message || "Terjadi kesalahan saat menghitung ulang");
      setIsRecalculating(false);
    }
  };

  const gradeStyle = data ? GRADE_COLOR[data.grade] : GRADE_COLOR.E;

  return (
    <div className="w-full h-full p-4 md:p-6 py-8 flex flex-col bg-[#F8F9FC] text-gray-800 overflow-y-auto overflow-x-hidden relative font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="lg:max-w-5xl lg:mx-auto lg:w-full flex flex-col gap-5">
        <Header
          title="Financial Health"
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onProfileClick={() => router.push("/?mode=profile-edit")}
        />

        {isRecalculating && <AILoadingModal step={loadingStep} />}

        {errorMsg && (
          <div className="rounded-2xl bg-red-50 border border-red-100 p-3 text-sm text-red-500">
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <SkeletonLoader />
        ) : !data ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center my-auto bg-white border border-gray-100 rounded-3xl p-10 shadow-sm">
            <span className="material-icons text-5xl text-gray-300">insights</span>
            <p className="text-gray-500 text-sm max-w-xs">
              Belum ada data Financial Health. Yuk hitung kondisi keuanganmu sekarang.
            </p>
            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="px-5 py-2.5 rounded-full bg-[#6C63F2] text-white text-sm font-bold hover:bg-[#574CE8] transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-[#6C63F2]/20"
            >
              Hitung Sekarang
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex flex-row items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-sm text-[#6C63F2] font-bold mb-1">Skor kesehatan</span>
                  <div className="flex flex-row items-end gap-1">
                    <span className="text-4xl font-extrabold text-gray-900 leading-none">
                      {data.skorTotal}
                    </span>
                    <span className="text-sm font-semibold text-gray-400 pb-1">/ 100</span>
                  </div>
                </div>

                <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl ${gradeStyle.bg}`}>
                  <span className={`text-3xl font-extrabold ${gradeStyle.text}`}>{data.grade}</span>
                  <span className={`text-[10px] font-bold ${gradeStyle.text}`}>Grade</span>
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-gray-900 mb-1">
                  {STATUS_TEXT_BY_GRADE[data.grade]}
                </div>
                <div className="text-xs text-gray-500">
                  Terakhir di update {formatTanggalWaktu(data.updatedAt)}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <div className="flex flex-row items-center justify-between bg-[#F8F9FC] p-3 rounded-2xl border border-gray-100">
                  <span className="text-sm text-gray-600">Target Nabung</span>
                  <div className="flex flex-row items-center gap-2">
                    <span className="text-sm font-bold text-[#05DF72]">{data.targetNabung.skor} / {data.targetNabung.maksimal} pts</span>
                    <span className="text-xs text-gray-500">Nilai: {data.targetNabung.persentase}%</span>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between bg-[#F8F9FC] p-3 rounded-2xl border border-gray-100">
                  <span className="text-sm text-gray-600">Disiplin Anggaran</span>
                  <div className="flex flex-row items-center gap-2">
                    <span className="text-sm font-bold text-[#6C63F2]">{data.disiplinAnggaran.skor} / {data.disiplinAnggaran.maksimal} pts</span>
                    <span className="text-xs text-gray-500">{data.disiplinAnggaran.persentase}%</span>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between bg-[#F8F9FC] p-3 rounded-2xl border border-gray-100">
                  <span className="text-sm text-gray-600">Pinjaman</span>
                  <div className="flex flex-row items-center gap-2">
                    <span className="text-sm font-bold text-[#FFB700]">{data.pengelolaanPinjaman.skor} / {data.pengelolaanPinjaman.maksimal} pts</span>
                    <span className="text-xs text-gray-500">{data.pengelolaanPinjaman.persentase}%</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRecalculate}
                disabled={isRecalculating}
                className="mt-2 w-full py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sm font-bold text-gray-700 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                <span className="material-icons text-sm">refresh</span>
                Hitung Ulang Skor
              </button>
            </div>

            {(["targetNabung", "disiplinAnggaran", "pengelolaanPinjaman"] as const).map((metricKey) => {
              const subScore = data[metricKey];
              const config = METRIC_CONFIG[metricKey];
              const barPercent = Math.min(100, (subScore.skor / subScore.maksimal) * 100);

              return (
                <div key={config.key} className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${config.iconBg}`}>
                        <span className={`material-icons select-none leading-none ${config.iconColor}`}>
                          {config.icon}
                        </span>
                      </div>
                      <div className="text-base font-bold text-gray-900">{config.title}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold ${config.iconBg} ${config.iconColor}`}>
                      {subScore.persentase}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${config.barColor}`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>

                  <div className="text-sm text-gray-600 leading-relaxed mt-1">
                    {subScore.ringkasan}
                  </div>

                  {subScore.saranPerkembangan && subScore.saranPerkembangan.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-gray-100">
                      <div className="text-[10px] md:text-xs font-bold text-gray-400 tracking-wide mb-1">
                        SARAN PERKEMBANGAN
                      </div>
                      <div className="flex flex-col gap-2">
                        {subScore.saranPerkembangan.map((item, idx) => (
                          <div key={idx} className="flex flex-row items-start gap-2.5">
                            <span className="material-icons select-none leading-none text-[#FFB700] shrink-0 mt-0.5 text-[16px]">
                              check_circle
                            </span>
                            <span className="text-sm text-gray-600 leading-relaxed">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AILoadingModal({ step }: { step: number }) {
  const steps = [
    { title: "Target Nabung", desc: "Memeriksa pencapaian target tabungan..." },
    { title: "Disiplin Anggaran", desc: "Menganalisis kepatuhan batas pengeluaran..." },
    { title: "Pengelolaan Pinjaman", desc: "Menghitung rasio hutang & cicilan..." },
  ];

  const currentStep = Math.min(Math.max(step, 1), 3);
  const progressPercent = Math.round((currentStep / 3) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm p-6 bg-white border border-gray-100 rounded-3xl shadow-2xl flex flex-col gap-5 text-gray-800">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 bg-[#F3F2FE] rounded-full text-[#6C63F2] animate-pulse">
            <span className="material-icons text-3xl">auto_awesome</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900">AI Sedang Menganalisis</h3>
          <p className="text-sm text-gray-500">
            Mohon tunggu, sistem sedang memproses kondisi keuanganmu.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
            <span>Progress Analisis</span>
            <span className="text-[#6C63F2]">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6C63F2] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 py-1">
          {steps.map((st, idx) => {
            const stepNum = idx + 1;
            const isDone = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all duration-300 ${
                  isCurrent
                    ? "bg-[#F3F2FE] border-[#6C63F2]/30"
                    : isDone
                    ? "bg-gray-50 border-gray-100"
                    : "bg-transparent border-transparent opacity-40"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isDone ? (
                    <span className="material-icons text-sm text-[#05DF72]">check_circle</span>
                  ) : isCurrent ? (
                    <span className="material-icons text-sm text-[#6C63F2] animate-spin">sync</span>
                  ) : (
                    <span className="material-icons text-sm text-gray-300">radio_button_unchecked</span>
                  )}
                </div>

                <div className="flex flex-col text-left">
                  <span
                    className={`text-sm font-bold ${
                      isCurrent ? "text-[#6C63F2]" : isDone ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    Tahap {stepNum}: {st.title}
                  </span>
                  <span className="text-xs text-gray-500">{st.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="bg-white border border-gray-100 rounded-3xl p-6 h-72 shadow-sm" />
      <div className="bg-white border border-gray-100 rounded-3xl p-6 h-48 shadow-sm" />
      <div className="bg-white border border-gray-100 rounded-3xl p-6 h-48 shadow-sm" />
      <div className="bg-white border border-gray-100 rounded-3xl p-6 h-48 shadow-sm" />
    </div>
  );
}