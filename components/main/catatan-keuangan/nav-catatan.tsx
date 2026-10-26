"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import 'material-icons/iconfont/material-icons.css';

export default function NavCatatan() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentMode = searchParams.get("mode") || "transaksi";

  const menu = [
    { name: "Transaksi", icon: "receipt_long", mode: "transaksi", href: "/?mode=transaksi" },
    { name: "Kelola Pinjaman", icon: "account_balance_wallet", mode: "kelolapinjaman", href: "/?mode=kelolapinjaman" },
    { name: "Budgeting", icon: "pie_chart", mode: "budgeting", href: "/?mode=budgeting" },
    { name: "Target Nabung", icon: "savings", mode: "targetnabung", href: "/?mode=targetnabung" },
    // { name: "Dompet", icon: "wallet", mode: "dompet", href: "/?mode=dompet" },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-row items-center gap-2 overflow-x-auto w-full max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-none]">
        {menu.map((item) => {
          const isActive = pathname === "/" && currentMode === item.mode;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`px-3.5 py-1.5 rounded-full flex flex-row items-center gap-1.5 text-xs lg:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                isActive
                  ? "bg-[#6c5ce7] text-white shadow-md shadow-[#6c5ce7]/10"
                  : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-800 border border-gray-800"
              }`}
            >
              <span 
                className="material-icons select-none leading-none text-[13px] shrink-0"
                style={{ fontSize: '13px', width: '13px', height: '13px' }}
              >
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}