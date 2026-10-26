'use client';

import { useState, useRef } from "react";
import 'material-icons/iconfont/material-icons.css';
import Sidebar from '../../sidebar';
import { useRouter } from "next/navigation";

import Header from "../../header";

interface ScanStrukProps {
    onSwitchToTransaction: () => void;
    onSwitchToScan?: () => void;
    onSwitchToAdd?: () => void;
}

interface HasilScan {
    Catatan_Transaksi: string;
    tipe: "pengeluaran" | "pemasukan";
    kategori: string;
    Sumber_Dana: string;
    nominal: number;
    tanggal: string;
    createdAt?: string;
}

export default function ScanStruk({ onSwitchToTransaction, onSwitchToScan, onSwitchToAdd }: ScanStrukProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [hasilScan, setHasilScan] = useState<HasilScan | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Harap unggah file gambar (JPG/PNG).');
            return;
        }
        setImageFile(file);
        setSelectedImage(URL.createObjectURL(file));
        setHasilScan(null);
        setErrorMessage("");
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImageFile(null);
        setHasilScan(null);
        setErrorMessage("");
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) {
            alert("Pilih gambar terlebih dahulu!");
            return;
        }

        setIsLoading(true);
        setHasilScan(null);
        setErrorMessage("");

        const formData = new FormData();
        formData.append("image", imageFile);

        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/scan`, {
                method: "POST",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();

                let errorMessageParsed = "Gagal mengunggah gambar ke server.";
                try {
                    const parsedJson = JSON.parse(errorText);
                    errorMessageParsed = parsedJson.error || parsedJson.message || errorMessageParsed;
                } catch {
                    errorMessageParsed = errorText || `Error HTTP: ${response.status}`;
                }

                throw new Error(errorMessageParsed);
            }

            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine.startsWith("data:")) continue;

                    const jsonStr = trimmedLine.replace("data:", "").trim();
                    try {
                        const parsed = JSON.parse(jsonStr);

                        if (parsed.type === "done") {
                            setHasilScan(parsed.result);
                        } else if (parsed.type === "error") {
                            setErrorMessage(parsed.text || "Terjadi kesalahan saat memproses gambar.");
                        }
                    } catch {
                    }
                }
            }
        } catch (error: any) {
            setErrorMessage(error.message || "Gagal terhubung ke server.");
        } finally {
            setIsLoading(false);
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
                        onClick={onSwitchToTransaction}
                        className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shrink-0 shadow-sm cursor-pointer"
                    >
                        <span className="material-icons text-xl leading-none">arrow_back</span>
                    </button>
                    <div className="text-xl font-bold text-gray-900">Tambah Transaksi</div>
                </div>

                <div className="flex flex-row gap-2 justify-center">
                    <button
                        type="button"
                        onClick={onSwitchToScan}
                        className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-[#6C63F2] text-white hover:bg-[#574CE8] shadow-md shadow-[#6C63F2]/20 shrink-0"
                    >
                        <span
                            className="material-icons select-none leading-none"
                            style={{ fontSize: '16px', width: '16px', height: '16px' }}
                        >
                            qr_code_scanner
                        </span>
                        <span>Scan Struk</span>
                    </button>

                    <button
                        type="button"
                        onClick={onSwitchToAdd}
                        className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shrink-0"
                    >
                        <span
                            className="material-icons select-none leading-none text-[#6C63F2]"
                            style={{ fontSize: '16px', width: '16px', height: '16px' }}
                        >
                            add
                        </span>
                        <span>Manual</span>
                    </button>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <form onSubmit={handleSubmit} className="w-full bg-white border border-gray-100 p-5 md:p-6 rounded-3xl shadow-sm">
                    <div className="flex flex-col gap-5 mt-2">
                        {!selectedImage ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`w-full min-h-[220px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 ${
                                isDragging
                                    ? 'border-[#6C63F2] bg-[#F3F2FE] scale-[1.01]'
                                    : 'border-gray-200 bg-gray-50 hover:border-[#6C63F2]/50 hover:bg-white'
                                }`}
                            >
                                <div className="w-12 h-12 rounded-full bg-[#F3F2FE] text-[#6C63F2] flex items-center justify-center mb-3">
                                    <span className="material-icons text-2xl">upload</span>
                                </div>
                                <p className="text-sm font-bold text-gray-800 mb-1">Upload file kamu di sini</p>
                                <p className="text-xs text-gray-500 mb-4">JPG, PNG, PDF maks. 5MB</p>
                                <div className="p-2 border border-gray-200 text-xs font-semibold rounded-full px-4 bg-white text-gray-600 hover:bg-gray-50 transition-colors"> Browse Files </div>
                            </div>
                        ) : (
                            <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 p-3 flex flex-col items-center">
                                <div className="relative w-full max-h-[300px] overflow-hidden rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                                    <img
                                        src={selectedImage}
                                        alt="Struk Preview"
                                        className="w-full h-auto max-h-[300px] object-contain"
                                    />
                                </div>

                                <div className="flex flex-row justify-between items-center w-full mt-3 px-1">
                                    <span className="text-xs font-medium text-gray-500 truncate max-w-[200px]">
                                        {imageFile?.name}
                                    </span>

                                    <div className="flex flex-row gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            Ganti
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="px-3 py-1.5 rounded-lg bg-red-50 text-xs font-semibold text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!selectedImage || isLoading}
                            className={`w-full py-3 rounded-full text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                                !selectedImage || isLoading
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-[#6C63F2] text-white hover:bg-[#574CE8] cursor-pointer shadow-md shadow-[#6C63F2]/20'
                            }`}
                        >
                            <span className="material-icons text-lg">auto_awesome</span>
                            <span>{isLoading ? "Sedang Menganalisis..." : "Mulai Scan"}</span>
                        </button>

                        {errorMessage && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm">
                                {errorMessage}
                            </div>
                        )}

                        {(hasilScan || isLoading) && (
                            <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col gap-4 mt-2">
                                <span className="text-sm font-bold text-[#6C63F2]">Hasil Analisis AI:</span>

                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                                        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#6C63F2] animate-spin" />
                                        <div className="text-sm font-medium text-gray-500 text-center">AI sedang membaca dan menganalisis struk...</div>
                                    </div>
                                ) : hasilScan ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                            <p className="text-gray-500 text-xs font-medium mb-0.5">Catatan Transaksi</p>
                                            <p className="font-bold text-gray-800 text-sm">{hasilScan.Catatan_Transaksi}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                                <p className="text-gray-500 font-medium mb-0.5">Kategori</p>
                                                <p className="font-bold text-gray-800">{hasilScan.kategori}</p>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                                <p className="text-gray-500 font-medium mb-0.5">Sumber Dana</p>
                                                <p className="font-bold text-gray-800">{hasilScan.Sumber_Dana}</p>
                                            </div>
                                        </div>

                                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm text-xs">
                                            <p className="text-gray-500 font-medium mb-0.5">Tanggal</p>
                                            <p className="font-bold text-gray-800">{hasilScan.tanggal}</p>
                                        </div>

                                        <div className="bg-white p-4 rounded-xl border border-[#6C63F2]/30 shadow-sm">
                                            <p className="text-gray-500 font-medium text-xs mb-1">Nominal Total</p>
                                            <p className="text-xl font-extrabold text-[#6C63F2]">
                                                {formatRupiah(hasilScan.nominal)}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}