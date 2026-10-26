"use client";

import { useEffect, useState } from "react";
import "material-icons/iconfont/material-icons.css";

interface ToastErrorProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  autoCloseDuration?: number;
}

export default function ToastError({
  isVisible,
  onClose,
  title = "Terjadi Kesalahan",
  message = "Gagal memproses permintaan kamu.",
  autoCloseDuration = 3000,
}: ToastErrorProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timerHide: NodeJS.Timeout;
    let timerRemove: NodeJS.Timeout;

    if (isVisible) {
      setShow(true);

      timerHide = setTimeout(() => {
        setShow(false);
        timerRemove = setTimeout(() => {
          onClose();
        }, 400);
      }, autoCloseDuration);
    }

    return () => {
      clearTimeout(timerHide);
      clearTimeout(timerRemove);
    };
  }, [isVisible, autoCloseDuration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 z-50 w-[90%] max-w-md bg-white border border-gray-100 rounded-2xl p-4 shadow-xl flex flex-row items-start gap-4 transition-all duration-400 ease-in-out ${
        show
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-8 pointer-events-none"
      }`}
      style={{ transform: "translateX(-50%)" }}
    >
      <div className="w-10 h-10 rounded-xl bg-[#E74C3C] flex items-center justify-center shrink-0">
        <span className="material-icons text-white text-2xl">error_outline</span>
      </div>
      
      <div className="flex-1 pt-0.5">
        <h4 className="text-sm font-bold text-[#E74C3C] mb-1">{title}</h4>
        <p className="text-xs text-gray-500 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}