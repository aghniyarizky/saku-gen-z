"use client";

import { useState } from "react";
import "material-icons/iconfont/material-icons.css";

interface NotifikasiProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  time: string;
  isUnread: boolean;
}

const dummyNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "82% budget terpakai!",
    description: "Saatnya kamu menghemat agar target tabungan tetap tercapai dan cicilan bisa dibayar tepat waktu.",
    icon: "warning",
    time: "2 menit yang lalu",
    isUnread: true,
  },
  {
    id: 2,
    title: "Saatnya Bayar Cicilan",
    description: "Cicilan SPayLater sebesar Rp300.000 akan jatuh tempo dalam 3 hari. Pastikan saldo atau rekeningmu mencukupi.",
    icon: "calendar_today",
    time: "1 jam yang lalu",
    isUnread: true,
  },
  {
    id: 3,
    title: "Pencapaian Baru!",
    description: 'Selamat! Kamu berhasil mendapatkan lencana "Ahli Hemat" karena berhasil menjaga pengeluaran sesuai anggaran selama 3 bulan berturut-turut.',
    icon: "emoji_events",
    time: "10 jam yang lalu",
    isUnread: false,
  },
  {
    id: 4,
    title: "Target Tabungan Makin Dekat!",
    description: "Target tabungan Laptop telah mencapai 60%. Kamu hanya perlu menabung Rp1.200.000 lagi untuk mencapainya.",
    icon: "gps_fixed",
    time: "10 jam yang lalu",
    isUnread: false,
  },
];

export default function Notifikasi({ isOpen, onClose }: NotifikasiProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(dummyNotifications);

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, isUnread: false }))
    );
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        <div
            onClick={onClose}
            className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
        />

        <aside
            className={`absolute top-0 right-0 h-full w-full max-w-sm bg-[#020306] border-l border-gray-900 p-6 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out pointer-events-auto ${
            isOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Notifikasi</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white cursor-pointer flex items-center justify-center p-1 rounded-lg hover:bg-white/5"
            >
              <span className="material-icons select-none">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#0d1117] border border-gray-800/60 transition-all hover:border-gray-700"
              >
                <div className="w-10 h-10 rounded-xl bg-[#161b22] border border-gray-800 flex items-center justify-center shrink-0 text-[#2EC4B6]">
                  <span className="material-icons text-xl select-none">{item.icon}</span>
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-white truncate">
                      {item.title}
                    </span>
                    {item.isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#2EC4B6] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2">
                    {item.description}
                  </p>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-800/80 mt-4 flex justify-between items-center">
            <button
              onClick={markAllAsRead}
              className="text-xs text-[#2EC4B6] hover:underline font-semibold cursor-pointer"
            >
              Tandai semua dibaca
            </button>
            <span className="text-xs text-gray-500">Total {notifications.length} notifikasi</span>
          </div>
        </div>
      </aside>
    </div>
  );
}