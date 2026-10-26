'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import 'material-icons/iconfont/material-icons.css';
import Sidebar from '../sidebar';
import Header from "../header";

interface HasilAnalisis {
  riskScore: number;
  riskLevel: "aman" | "waspada" | "berbahaya";
  aiSummary: string;
  aiDetail: string;
  aiRecommendation: string;
  isOjkLegal?: string;
}

const normalizeRiskLevel = (raw: string | undefined): HasilAnalisis["riskLevel"] => {
  const lower = (raw || "").toLowerCase();
  if (lower.includes("aman") || lower.includes("rendah")) return "aman";
  if (lower.includes("bahaya") || lower.includes("tinggi")) return "berbahaya";
  return "waspada";
};

const getRiskCategoryInfo = (score: number) => {
  if (score <= 19) {
    return { label: "Skor Aman", text: "text-[#05DF72]", bar: "bg-[#05DF72]" };
  } else if (score <= 59) {
    return { label: "Skor Waspada", text: "text-[#FFB700]", bar: "bg-[#FFB700]" };
  } else {
    return { label: "Skor Bahaya", text: "text-[#FFB700]", bar: "bg-[#FFB700]" };
  }
};

const mapApiDataToHasil = (data: any): HasilAnalisis => ({
  riskScore: data?.riskScore ?? data?.risk_score ?? 0,
  riskLevel: normalizeRiskLevel(data?.riskLevel || data?.risk_level),
  aiSummary: data?.aiSummary || data?.ai_summary || "Tidak ada ringkasan",
  aiDetail: data?.aiDetail || data?.ai_detail || "Tidak ada detail analisis",
  aiRecommendation: data?.aiRecommendation || data?.ai_recommendation || "",
  isOjkLegal: data?.isOjkLegal || data?.is_ojk_legal,
});

export default function CariAman() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [pesan, setPesan] = useState<string>("");
  const [hasilAnalisis, setHasilAnalisis] = useState<HasilAnalisis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState("");
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const fetchLatest = async () => {
      setLoadingInitial(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cariAman/output`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const teksResponse = await response.text();

        if (!response.ok) {
          throw new Error("Gagal mengambil data sebelumnya");
        }

        const resData = JSON.parse(teksResponse);

        if (resData.data) {
          setHasilAnalisis(mapApiDataToHasil(resData.data));
        }
      } catch (err) {
        setHasilAnalisis(null);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchLatest();
  }, []);

  const handleAnalisis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pesan.trim()) return;

    setError("");
    setAnalyzing(true);
    setShowDetail(false);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cariAman`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: pesan }),
      });

      if (!response.ok || !response.body) {
        const teksResponse = await response.text();
        try {
          const parsedError = JSON.parse(teksResponse);
          throw new Error(parsedError.message || parsedError.error || "Gagal menganalisis pesan.");
        } catch {
          throw new Error("Terjadi kesalahan pada server backend.");
        }
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;

          const jsonStr = part.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);

            if (parsed.type === "done") {
              setHasilAnalisis(mapApiDataToHasil(parsed.result));
            } else if (parsed.type === "error") {
              setError(parsed.text || parsed.error || "Gagal menganalisis pesan.");
            }
          } catch {
            continue;
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const displaySkor = hasilAnalisis ? hasilAnalisis.riskScore : 0;
  const riskInfo = getRiskCategoryInfo(displaySkor);
  
  const displaySummary = hasilAnalisis
    ? hasilAnalisis.aiSummary
    : "Tempel pesan mencurigakan lalu klik \"Analisis Pesan\" untuk melihat hasil dari AI.";
  const displayRecommendation = hasilAnalisis?.riskLevel !== "aman" ? hasilAnalisis?.aiRecommendation : null;

  return (
    <div className="w-full h-full p-4 md:p-6 py-8 flex flex-col bg-[#F8F9FC] text-gray-800 overflow-y-auto overflow-x-hidden relative font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="lg:max-w-5xl lg:mx-auto lg:w-full flex flex-col gap-5">
        <Header
          title="Cari Aman"
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onProfileClick={() => router.push("/?mode=profile-edit")}
        />

        {/* <div className="flex flex-row gap-2">
          <button
            type="button"
            onClick={() => router.push("/?mode=temanhemat")}
            className="flex flex-row items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-colors cursor-pointer"
          >
            <span className="material-icons select-none leading-none text-[#6C63F2] text-base">
              chat_bubble_outline
            </span>
            ZenAI
          </button>
          <button
            type="button"
            className="flex flex-row items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#6C63F2] text-white shadow-md shadow-[#6C63F2]/20 cursor-pointer"
          >
            <span className="material-icons select-none leading-none text-white text-base">
              shield
            </span>
            Cari Aman
          </button>
        </div> */}

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleAnalisis} className="w-full">
          <div className="bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-sm flex flex-col gap-4">
            <label className="text-sm font-bold text-gray-900">Tempel pesan mencurigakan</label>
            <textarea
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              rows={5}
              className="bg-gray-50 border border-gray-200 rounded-2xl w-full text-sm px-4 py-3 text-gray-800 focus:outline-none focus:border-[#6C63F2] focus:bg-white transition-colors placeholder:text-gray-400 resize-none"
              placeholder="Tempel pesan mencurigakan dari SMS, Email, atau Whatsapp kamu..."
              required
            />
            <button
              type="submit"
              disabled={analyzing}
              className="mt-2 flex flex-row w-full bg-[#6C63F2] text-white p-3.5 rounded-xl text-sm font-bold transition-colors cursor-pointer items-center gap-2 justify-center disabled:opacity-50 shadow-md shadow-[#6C63F2]/20"
            >
              <span className="material-icons select-none leading-none text-base">
                shield
              </span>
              {analyzing ? "Menganalisis..." : "Analisis Pesan"}
            </button>
          </div>
        </form>

        <div className="bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-sm flex flex-col gap-3">
          <div className="flex flex-row items-center justify-between">
            <div className="text-sm font-bold text-gray-900">{riskInfo.label}</div>
            <div className={`text-3xl font-extrabold ${riskInfo.text}`}>{displaySkor}</div>
          </div>

          {analyzing ? (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
              <div className="w-10 h-10 border-4 border-gray-100 border-t-[#6C63F2] rounded-full animate-spin" />
              <div className="text-sm text-gray-500 text-center">AI sedang membaca/menganalisis pesan...</div>
            </div>
          ) : (
            <>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${riskInfo.bar}`}
                  style={{ width: `${displaySkor}%` }}
                />
              </div>

              <div className="text-sm text-gray-600 leading-relaxed pt-2">
                {displaySummary}
              </div>

              {hasilAnalisis?.aiDetail && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowDetail((prev) => !prev)}
                    className="flex flex-row gap-2 items-center cursor-pointer pt-1"
                  >
                    <div className="text-sm text-[#6C63F2] font-semibold">Detail</div>
                    <span
                      className={`material-icons select-none leading-none text-[#6C63F2] text-base transition-transform duration-300 ${showDetail ? 'rotate-90' : ''}`}
                    >
                      arrow_forward
                    </span>
                  </button>
                  {showDetail && (
                    <div className="text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3 mt-1">
                      {hasilAnalisis.aiDetail}
                    </div>
                  )}
                </>
              )}

              {displayRecommendation && (
                <div className="border border-red-100 bg-[#E74C3C]/5 rounded-2xl p-4 mt-2">
                  <div className="text-xs text-[#E74C3C] leading-relaxed">
                    <span className="font-bold">Rekomendasi: </span>
                    {displayRecommendation}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}