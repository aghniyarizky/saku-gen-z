'use client';

import { useState } from 'react';
import 'material-icons/iconfont/material-icons.css';
import Sidebar from '../../sidebar';
import { useRouter } from "next/navigation";
import NavCatatan from '../nav-catatan';
import Header from "../../header";

interface Dompet {
  id: string;
  nama: string;
  tipe: string;
  icon: string;
  saldo: number;
  transaksiCount: number;
  warnaBar: string;
  warnaBgIcon: string;
}

export default function Dompet() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  const [dompetList] = useState<Dompet[]>([
    {
      id: "1",
      nama: "Tunai",
      tipe: "Tunai",
      icon: "💵",
      saldo: 50000,
      transaksiCount: 5,
      warnaBar: "bg-[#05DF72]",
      warnaBgIcon: "bg-[#05DF72]/15",
    },
    {
      id: "2",
      nama: "Debit Mandiri",
      tipe: "Debit",
      icon: "💳",
      saldo: 250000,
      transaksiCount: 8,
      warnaBar: "bg-[#2EC4B6]",
      warnaBgIcon: "bg-[#2EC4B6]/15",
    },
    {
      id: "3",
      nama: "Gopay",
      tipe: "E-Money",
      icon: "📱",
      saldo: 250000,
      transaksiCount: 8,
      warnaBar: "bg-[#FFB700]",
      warnaBgIcon: "bg-[#FFB700]/15",
    },
  ]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalSaldo = dompetList.reduce((acc, curr) => acc + curr.saldo, 0);

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

        <NavCatatan />

        {/* Ringkasan Total Saldo */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-5">
          <div>
            <div className="text-sm text-gray-500 font-semibold mb-1">Total Saldo</div>
            <div className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              {formatRupiah(totalSaldo)}
            </div>
            <div className="text-xs text-gray-400 font-medium mt-1">
              {dompetList.length} Dompet
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-xs text-gray-500 font-medium">Distribusi Dompet</div>
            
            {/* Bar Distribusi Multi-warna */}
            <div className="w-full h-3 rounded-full overflow-hidden flex flex-row bg-gray-100">
              {dompetList.map((item) => {
                const percent = (item.saldo / totalSaldo) * 100;
                return (
                  <div 
                    key={item.id}
                    className={`h-full ${item.warnaBar}`} 
                    style={{ width: `${percent}%` }} 
                  />
                );
              })}
            </div>

            {/* Legenda Distribusi */}
            <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 mt-1">
              {dompetList.map((item) => {
                const percent = Math.round((item.saldo / totalSaldo) * 100);
                return (
                  <div key={item.id} className="flex flex-row items-center gap-1.5 text-[10px] md:text-xs font-medium text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${item.warnaBar}`} />
                    <span>{item.nama} ({percent}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

    <div className="flex flex-row items-center justify-between mt-2">
        <div className="text-lg font-bold text-gray-900">
            Dompet Saya ({dompetList.length})
        </div>
        <button
            type="button"
            onClick={() => router.push("/?mode=tambahdompet")}
            className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-[#6C63F2] text-white hover:bg-[#574CE8] shadow-md shadow-[#6C63F2]/20 shrink-0"
        >
            <span className="material-icons select-none leading-none text-white text-base">add</span>
            <span>Tambah</span>
        </button>
        </div>

        <div className="flex flex-col gap-4">
          {dompetList.map((item) => {
            const percent = Math.round((item.saldo / totalSaldo) * 100);
            
            return (
              <div 
                key={item.id}
                className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col"
              >
                {/* Top Accent Bar */}
                <div className={`w-full h-3 ${item.warnaBar}`} />

                <div className="p-5 flex flex-col gap-4">
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl text-xl shrink-0 ${item.warnaBgIcon}`}>
                        {item.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{item.nama}</span>
                        <div className="flex flex-row items-center gap-1 mt-0.5">
                          <span className="material-icons text-gray-400 text-[10px]">credit_card</span>
                          <span className="text-[10px] text-gray-500 font-medium">{item.tipe}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row items-center gap-1">
                        <button 
                            onClick={() => router.push(`/?mode=editdompet&id=${item.id}`)}
                            className="p-1.5 text-gray-400 hover:text-[#6C63F2] transition-colors rounded-full hover:bg-gray-50 cursor-pointer"
                            >
                            <span className="material-icons text-base">edit</span>
                        </button>
                        <button 
                            onClick={() => setDeleteId(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-50 cursor-pointer"
                            >
                            <span className="material-icons text-base">delete</span>
                        </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-2xl font-extrabold text-gray-900">
                      {formatRupiah(item.saldo)}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {item.transaksiCount} transaksi
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.warnaBar}`} 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      {percent}% dari total saldo
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-gray-900">
                Hapus Dompet?
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Apakah kamu yakin ingin menghapus dompet ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex flex-row items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="w-1/2 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  // Logika hapus data di sini
                  console.log("Menghapus dompet ID:", deleteId);
                  setDeleteId(null); 
                }}
                className="w-1/2 py-2.5 rounded-xl bg-[#E74C3C] text-sm font-bold text-white hover:bg-red-600 transition-colors cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}