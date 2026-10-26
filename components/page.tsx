// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import "material-icons/iconfont/material-icons.css";
// import Sidebar from "./sidebar";
// import NativeFinancialChart from "./grafik-keuangan";

// interface Summary {
//   saldo: number;
//   totalPemasukan: number;
//   totalPengeluaran: number;
// }

// interface TransactionItem {
//   id: string;
//   title: string;
//   category: string;
//   date: string;
//   amount: number;
//   type: string;
//   icon: string;
//   iconColor: string;
// }

// interface PinjamanDashboard {
//   _id: string;
//   namaPlatform: string;
//   totalPinjaman: number;
//   totalYangHarusDibayar: number;
//   progress: number;
//   statusPinjaman: string;
// }

// interface FinancialHealthSummary {
//   skorTotal: number;
//   grade: string;
//   updatedAt: string;
// }

// const CATEGORY_ICON: Record<string, string> = {
//   makanan: "ramen_dining",
//   transportasi: "directions_car",
//   belanja: "shopping_bag",
//   tagihan: "payments",
//   hiburan: "local_movies",
//   freelance: "work",
//   gaji: "paid",
//   kesehatan: "medical_services",
//   investasi: "trending_up",
//   tabungan: "savings",
// };

// const getIconForCategory = (kategori: string) => {
//   const key = (kategori || "").toLowerCase();
//   return CATEGORY_ICON[key] || "receipt_long";
// };

// const formatTanggal = (isoDate: string) => {
//   try {
//     return new Intl.DateTimeFormat("id-ID", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     }).format(new Date(isoDate));
//   } catch {
//     return isoDate;
//   }
// };

// const formatTanggalWaktu = (isoString: string) => {
//   try {
//     return new Intl.DateTimeFormat("id-ID", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//     }).format(new Date(isoString));
//   } catch {
//     return isoString;
//   }
// };

// const formatRupiah = (val: number) =>
//   `Rp${Math.abs(val).toLocaleString("id-ID")}`;

// const cleanUsername = (str: string | null | undefined): string | null => {
//   if (!str) return null;
//   if (str.includes("@")) {
//     return str.split("@")[0];
//   }
//   return str;
// };

// export default function LandingPage() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const router = useRouter();

//   const [userName, setUserName] = useState("Pengguna");
//   const [summary, setSummary] = useState<Summary>({
//     saldo: 0,
//     totalPemasukan: 0,
//     totalPengeluaran: 0,
//   });
//   const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([]);
//   const [listPinjaman, setListPinjaman] = useState<PinjamanDashboard[]>([]);
//   const [totalPinjamanAktif, setTotalPinjamanAktif] = useState(0);
//   const [financialHealth, setFinancialHealth] = useState<FinancialHealthSummary | null>(null);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const getDynamicUsername = () => {
//       try {
//         const savedUser = localStorage.getItem("user");
//         if (savedUser) {
//           const parsed = JSON.parse(savedUser);
//           const nameFromUserObj = cleanUsername(
//             parsed.username || parsed.nama || parsed.name
//           );
//           if (nameFromUserObj) return nameFromUserObj;
//         }

//         const directUsername = cleanUsername(localStorage.getItem("username"));
//         if (directUsername) return directUsername;

//         const token = localStorage.getItem("token");
//         if (token) {
//           const base64Url = token.split(".")[1];
//           if (base64Url) {
//             const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//             const jsonPayload = decodeURIComponent(
//               atob(base64)
//                 .split("")
//                 .map(
//                   (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
//                 )
//                 .join("")
//             );
//             const parsedToken = JSON.parse(jsonPayload);
//             const tokenName = cleanUsername(
//               parsedToken.username ||
//                 parsedToken.nama ||
//                 parsedToken.name ||
//                 parsedToken.email
//             );
//             if (tokenName) return tokenName;
//           }
//         }
//       } catch (err) {
//         console.error(err);
//       }
//       return "Pengguna";
//     };

//     setUserName(getDynamicUsername());

//     const fetchDashboardData = async () => {
//       setLoading(true);
//       setError("");

//       try {
//         const token =
//           typeof window !== "undefined" ? localStorage.getItem("token") : null;
//         const headers = {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         };

//         const resKeuangan = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan`,
//           {
//             method: "GET",
//             headers,
//           }
//         );

//         if (resKeuangan.ok) {
//           const resData = await resKeuangan.json();

//           setSummary({
//             saldo: resData.summary?.saldo ?? 0,
//             totalPemasukan: resData.summary?.totalPemasukan ?? 0,
//             totalPengeluaran: resData.summary?.totalPengeluaran ?? 0,
//           });

//           const mapped: TransactionItem[] = (resData.data || [])
//             .slice(0, 5)
//             .map((item: any) => ({
//               id: item._id,
//               title: item.Catatan_Transaksi,
//               category: item.kategori,
//               date: formatTanggal(item.tanggal),
//               amount: item.tipe === "pemasukan" ? item.nominal : -item.nominal,
//               type: item.tipe,
//               icon: getIconForCategory(item.kategori),
//               iconColor:
//                 item.kategori?.toLowerCase() === "tabungan"
//                   ? "text-[#2EC4B6]"
//                   : item.tipe === "pemasukan"
//                     ? "text-[#05DF72]"
//                     : "text-[#e7ae3c]",
//             }));

//           setRecentTransactions(mapped);
//         }

//         const resPinjaman = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/api/catatan-keuangan/pinjaman`,
//           {
//             method: "GET",
//             headers,
//           }
//         );

//         if (resPinjaman.ok) {
//           const resPinjamanData = await resPinjaman.json();
//           const items: PinjamanDashboard[] = resPinjamanData.data || [];
//           const aktif = items.filter((p) => p.statusPinjaman !== "Lunas");
//           setListPinjaman(aktif);
//           setTotalPinjamanAktif(aktif.length);
//         }

//         const resFinancialHealth = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/financial-health`,
//           {
//             method: "GET",
//             headers,
//           }
//         );

//         if (resFinancialHealth.ok) {
//           const resFHData = await resFinancialHealth.json();
//           if (resFHData.data) {
//             setFinancialHealth({
//               skorTotal: resFHData.data.skorTotal,
//               grade: resFHData.data.grade,
//               updatedAt: resFHData.data.updatedAt,
//             });
//           }
//         }
//       } catch (err: unknown) {
//         const errorObj = err as Error;
//         setError(errorObj.message || "Gagal memuat data dashboard.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   return (
//     <div className="w-full h-full p-6 py-10 flex flex-col bg-[#101828] text-white overflow-y-auto overflow-x-hidden relative">
//       <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

//       <div>
//         <div className="w-full flex flex-row items-center justify-between">
//           <div className="flex flex-row items-center gap-2.5">
//             <button
//               type="button"
//               className="flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer duration-500"
//               onClick={() => setIsSidebarOpen(true)}
//             >
//               <span className="material-icons text-2xl select-none">menu</span>
//             </button>
//             <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
//           </div>

//           <div className="flex flex-row items-center gap-3">
//             <button
//               type="button"
//               className="flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
//             >
//               <span className="material-icons text-xl select-none">
//                 notifications
//               </span>
//             </button>
//             <button
//               type="button"
//               className="flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
//             >
//               <span className="material-icons text-xl select-none">
//                 account_circle
//               </span>
//             </button>
//           </div>
//         </div>

//         <h2 className="mt-3 bg-linear-to-r from-[#B4B4B5] to-white bg-clip-text text-transparent text-3xl font-extrabold tracking-tight leading-snug">
//           Halo,{" "}
//           <span className="bg-linear-to-r from-[#2EC4B6] to-[#BEEDE8] bg-clip-text text-transparent text-3xl font-extrabold capitalize">
//             {userName}!
//           </span>
//         </h2>
//         <p className="text-gray-400 text-sm font-semibold">
//           Pantau dan kelola kondisi finansialmu hari ini.
//         </p>

//         {error && (
//           <div className="mt-4 p-3 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-xl backdrop-blur-sm">
//             {error}
//           </div>
//         )}

//         <div className="p-4 mt-4 gap-3 grid grid-cols-2">
//           <div className="bg-white/7 border border-gray-700 rounded-2xl p-4 py-6 w-full">
//             <div className="flex flex-row items-start justify-between">
//               <div className="p-2 flex items-center justify-center bg-[#2EC4B6]/15 rounded-full">
//                 <span className="material-icons text-[#2EC4B6]">wallet</span>
//               </div>
//             </div>
//             <div className="flex flex-col mt-3">
//               <div className="text-xl my-2 font-extrabold">
//                 {loading ? "..." : formatRupiah(summary.saldo)}
//               </div>
//               <div className="text-sm text-white/50 font-medium">
//                 Saldo Sekarang
//               </div>
//             </div>
//           </div>

//           <div className="bg-white/7 border border-gray-700 rounded-2xl p-4 py-6 w-full">
//             <div className="flex flex-row items-start justify-between">
//               <div className="p-2 flex items-center justify-center bg-[#2EC4B6]/15 rounded-full">
//                 <span className="material-icons text-[#2EC4B6]">
//                   north_east
//                 </span>
//               </div>
//             </div>
//             <div className="flex flex-col mt-3">
//               <div className="text-xl my-2 font-extrabold text-[#05DF72]">
//                 {loading ? "..." : formatRupiah(summary.totalPemasukan)}
//               </div>
//               <div className="text-sm text-white/50 font-medium">Pemasukan</div>
//             </div>
//           </div>

//           <div className="bg-white/7 border border-gray-700 rounded-2xl p-4 py-6 w-full">
//             <div className="flex flex-row items-start justify-between">
//               <div className="p-2 flex items-center justify-center bg-[#E74C3C]/15 rounded-full">
//                 <span className="material-icons text-[#E74C3C]">
//                   south_west
//                 </span>
//               </div>
//             </div>
//             <div className="flex flex-col mt-3">
//               <div className="text-xl my-2 font-extrabold text-[#E74C3C]">
//                 {loading ? "..." : formatRupiah(summary.totalPengeluaran)}
//               </div>
//               <div className="text-sm text-white/50 font-medium">
//                 Pengeluaran
//               </div>
//             </div>
//           </div>

//           <div className="bg-white/7 border border-gray-700 rounded-2xl p-4 py-6 w-full">
//             <div className="flex flex-row items-start justify-between">
//               <div className="p-2 flex items-center justify-center bg-[#E74C3C]/15 rounded-full">
//                 <span className="material-icons text-[#E74C3C]">
//                   volunteer_activism
//                 </span>
//               </div>
//             </div>
//             <div className="flex flex-col mt-3">
//               <div className="text-xl my-2 font-extrabold">
//                 {loading ? "..." : totalPinjamanAktif}
//               </div>
//               <div className="text-sm text-white/50 font-medium">
//                 Pinjaman Aktif
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="p-4 mt-[-18]">
//           <div className="w-full bg-white/7 border border-gray-700 rounded-2xl p-4">
//             <div className="flex flex-row gap-4">
//               <div className="flex items-center justify-center p-2.5 aspect-square bg-[#2EC4B6]/15 rounded-full shrink-0 h-fit">
//                 <span className="material-icons text-[#2EC4B6] select-none leading-none">
//                   insights
//                 </span>
//               </div>
//               <div>
//                 <div className="text-lg text-white font-extrabold">
//                   Financial Health
//                 </div>
//                 <div className="text-xs text-white/30">
//                   {loading
//                     ? "Memuat..."
//                     : financialHealth
//                       ? `Terakhir diupdate ${formatTanggalWaktu(financialHealth.updatedAt)}`
//                       : "Belum ada data"}
//                 </div>
//                 <div className="flex flex-row gap-0.5 items-end">
//                   <div className="text-3xl font-extrabold text-white py-3">
//                     {loading
//                       ? "..."
//                       : financialHealth
//                         ? financialHealth.skorTotal
//                         : "-"}
//                   </div>
//                   <div className="text-medium font-semibold text-white/70 py-3">
//                     {" "}
//                     /100
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => router.push("/?mode=financialhealth")}
//                   className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#2EC4B6] hover:bg-[#25a89d] text-[#101828] text-xs font-bold rounded-full transition-all duration-200 active:scale-95 cursor-pointer shadow-md"
//                 >
//                   <span>Lihat Detail</span>
//                   <span className="material-icons text-sm select-none leading-none font-bold">
//                     arrow_forward
//                   </span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="p-4 mt-[-18]">
//           <div className="w-full bg-white/1 border border-gray-800 rounded-2xl p-4">
//             <div className="flex flex-row gap-4 items-center justify-between">
//               <div>
//                 <div className="text-lg text-white font-extrabold">
//                   Grafik Keuangan Anda
//                 </div>
//                 <div className="text-xs text-white/40">7 Bulan Terakhir</div>
//               </div>
//               <div className="items-center justify-center p-1 px-2 text-xs aspect-video bg-[#2EC4B6]/15 rounded-2xl shrink-0 h-fit border border-[#2EC4B6]/30">
//                 <span className="text-[#2EC4B6] select-none leading-none">
//                   2026
//                 </span>
//               </div>
//             </div>
//             <NativeFinancialChart />
//           </div>
//         </div>

//         <div className="p-4 mt-[-18]">
//           <div className="w-full bg-white/1 border border-gray-800 rounded-2xl p-4">
//             <div className="flex flex-row gap-4 items-center justify-between mb-2">
//               <div className="text-lg text-white font-extrabold">
//                 Pinjaman Aktif ({totalPinjamanAktif})
//               </div>
//               <button
//                 type="button"
//                 onClick={() => router.push("/?mode=kelolapinjaman")}
//                 className="text-[#2EC4B6] text-sm hover:underline cursor-pointer"
//               >
//                 View all
//               </button>
//             </div>

//             {loading ? (
//               <div className="py-4 text-center text-xs text-gray-500">
//                 Memuat data pinjaman...
//               </div>
//             ) : listPinjaman.length > 0 ? (
//               <div className="py-2 gap-3 flex flex-col">
//                 {listPinjaman.map((pj) => {
//                   const terbayar = Math.max(
//                     0,
//                     pj.totalPinjaman - pj.totalYangHarusDibayar
//                   );
//                   return (
//                     <div
//                       key={pj._id}
//                       className="flex flex-col gap-1 py-1 border-b border-gray-800/40 last:border-none"
//                     >
//                       <div className="flex flex-row items-center justify-between font-semibold">
//                         <div className="text-md font-bold">
//                           {pj.namaPlatform}
//                         </div>
//                         <div className="text-xs text-[#2EC4B6] font-bold">
//                           {pj.progress}% paid
//                         </div>
//                       </div>

//                       <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden my-1">
//                         <div
//                           className="h-full bg-[#2EC4B6] rounded-full transition-all duration-300"
//                           style={{
//                             width: `${Math.min(100, Math.max(0, pj.progress))}%`,
//                           }}
//                         />
//                       </div>

//                       <div className="flex flex-row items-center justify-between font-semibold">
//                         <div className="text-xs text-white/50">
//                           {formatRupiah(terbayar)}
//                         </div>
//                         <div className="text-xs text-white/50">
//                           {formatRupiah(pj.totalPinjaman)}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="py-6 text-center text-xs text-gray-500">
//                 Tidak ada pinjaman aktif saat ini.
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="p-4 mt-[-18]">
//           <div className="w-full bg-white/1 border border-gray-800 rounded-2xl p-4">
//             <div className="flex flex-row gap-4 items-center justify-between mb-2">
//               <div className="text-lg text-white font-extrabold">
//                 Transaksi Terakhir
//               </div>
//               <button
//                 type="button"
//                 onClick={() => router.push("/?mode=transaksi")}
//                 className="text-[#2EC4B6] text-sm hover:underline cursor-pointer"
//               >
//                 View all
//               </button>
//             </div>

//             {loading ? (
//               <div className="py-6 text-center text-xs text-gray-400">
//                 Memuat transaksi...
//               </div>
//             ) : recentTransactions.length > 0 ? (
//               recentTransactions.map((tx) => {
//                 const isIncome = tx.type === "pemasukan";
//                 const formattedAmount = isIncome
//                   ? `+${formatRupiah(tx.amount)}`
//                   : `-${formatRupiah(tx.amount)}`;

//                 return (
//                   <div
//                     key={tx.id}
//                     className="py-2.5 gap-3 flex flex-row items-center border-b border-gray-800/40 last:border-none"
//                   >
//                     <div className="flex items-center justify-center p-2.5 aspect-square bg-[#2EC4B6]/15 rounded-full shrink-0 h-fit">
//                       <span className={`material-icons ${tx.iconColor}`}>
//                         {tx.icon}
//                       </span>
//                     </div>
//                     <div className="flex flex-row gap-1 py-1 justify-between items-center w-full min-w-0">
//                       <div className="min-w-0 flex-1">
//                         <div className="text-md font-semibold truncate">
//                           {tx.title}
//                         </div>
//                         <div className="text-xs text-white/30 truncate">
//                           {tx.category} - {tx.date}
//                         </div>
//                       </div>
//                       <div
//                         className={`text-md font-bold shrink-0 ml-2 ${isIncome ? "text-[#05DF72]" : "text-[#E74C3C]"}`}
//                       >
//                         {formattedAmount}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="py-6 text-center text-xs text-gray-500">
//                 Belum ada transaksi terrekam.
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }