'use client';

import React from 'react';

interface TombolAksiProps {
  onSwitchToScan?: () => void;
  onSwitchToAdd?: () => void;
}

export default function TombolAksi({ onSwitchToScan, onSwitchToAdd }: TombolAksiProps) {
  return (
    <div className="flex flex-row gap-2 justify-start w-full">
      <button
        type="button"
        onClick={onSwitchToAdd}
        className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-[#6C63F2] text-white hover:bg-[#5a52d9] shadow-md shadow-[#6C63F2]/10 shrink-0"
      >
        <span 
          className="material-icons select-none leading-none text-white"
          style={{ fontSize: '13px', width: '13px', height: '13px' }}
        >
          add
        </span>
        <span>Tambah Transaksi</span>
      </button>

      <button
        type="button"
        onClick={onSwitchToScan}
        className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex flex-row items-center gap-2 bg-white/5 text-[#6C63F2] hover:bg-gray-200 border border-gray-300 shrink-0"
      >
        <span 
          className="material-icons select-none leading-none text-[#6C63F2]"
          style={{ fontSize: '13px', width: '13px', height: '13px' }}
        >
          qr_code_scanner
        </span>
        <span>Scan Struk</span>
      </button>

    </div>
  );
}