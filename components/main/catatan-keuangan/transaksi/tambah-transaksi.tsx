'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import 'material-icons/iconfont/material-icons.css';
import Sidebar from '../../sidebar';
import Pengeluaran from './pengeluaran';
import Pemasukan from './pemasukan'; 

import Header from "../../header";

interface TambahTransaksiProps {
  onSwitchToTransaction: () => void;
  onSwitchToScan?: () => void;
  onSwitchToAdd?: () => void;
}

export default function TambahTransaksi({ 
  onSwitchToTransaction, 
  onSwitchToScan, 
  onSwitchToAdd 
}: TambahTransaksiProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'pengeluaran' | 'pemasukan'>('pengeluaran');
  const router = useRouter();

  const handleSuccessSave = () => {
    if (onSwitchToTransaction) {
      onSwitchToTransaction();
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
            className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shrink-0 shadow-sm"
          >
            <span 
              className="material-icons select-none leading-none text-[#6C63F2]"
              style={{ fontSize: '16px', width: '16px', height: '16px' }}
            >
              qr_code_scanner
            </span>
            <span>Scan Struk</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToAdd}
            className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-[#6C63F2] text-white hover:bg-[#574CE8] shadow-md shadow-[#6C63F2]/20 shrink-0"
          >
            <span 
              className="material-icons select-none leading-none text-white"
              style={{ fontSize: '16px', width: '16px', height: '16px' }}
            >
              add
            </span>
            <span>Manual</span>
          </button>
        </div>

        <div className="flex flex-row w-full gap-3 justify-center text-center px-2">
          <button
            type="button"
            onClick={() => setTransactionType('pengeluaran')}
            className={`w-1/2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 cursor-pointer flex flex-row items-center justify-center gap-2 shrink-0 ${
              transactionType === 'pengeluaran'
                ? 'border-[#E74C3C] bg-[#E74C3C]/10 text-[#E74C3C]'
                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 shadow-sm'
            }`}
          >
            <span 
              className={`material-icons select-none leading-none ${
                transactionType === 'pengeluaran' ? 'text-[#E74C3C]' : 'text-gray-400'
              }`}
              style={{ fontSize: '16px', width: '16px', height: '16px' }}
            >
              remove
            </span>
            <span>Pengeluaran</span>
          </button>

          <button
            type="button"
            onClick={() => setTransactionType('pemasukan')}
            className={`w-1/2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 cursor-pointer flex flex-row items-center justify-center gap-2 shrink-0 ${
              transactionType === 'pemasukan'
                ? 'border-[#05DF72] bg-[#05DF72]/10 text-[#05DF72]'
                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 shadow-sm'
            }`}
          >
            <span 
              className={`material-icons select-none leading-none ${
                transactionType === 'pemasukan' ? 'text-[#05DF72]' : 'text-gray-400'
              }`}
              style={{ fontSize: '16px', width: '16px', height: '16px' }}
            >
              add
            </span>
            <span>Pemasukan</span>
          </button>
        </div>

        {transactionType === 'pengeluaran' ? (
          <Pengeluaran onSuccess={handleSuccessSave} />
        ) : (
          <Pemasukan onSuccess={handleSuccessSave} />
        )}
      </div>
    </div>
  );
}