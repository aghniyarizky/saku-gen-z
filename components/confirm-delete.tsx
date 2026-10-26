"use client";

import { useState, useEffect } from "react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Hapus Data?",
  description = "Apakah kamu yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  loading = false,
}: ConfirmDeleteModalProps) {
  const [render, setRender] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isOpen) {
      setRender(true);
      timer = setTimeout(() => {
        setAnimate(true);
      }, 10);
    } else {
      setAnimate(false);
      timer = setTimeout(() => {
        setRender(false);
      }, 300);
    }

    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!render) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
        animate ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white border border-gray-100 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl transition-all duration-300 ease-out ${
          animate
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>

        <div className="flex flex-row items-center gap-3 mt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="w-1/2 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="w-1/2 py-2.5 rounded-xl bg-[#E74C3C] text-sm font-bold text-white hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}