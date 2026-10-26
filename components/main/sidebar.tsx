"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import "material-icons/iconfont/material-icons.css";

import ConfirmDeleteModal from "../confirm-delete";
import ToastSuccess from "../msg-success";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubMenuItem {
  name: string;
  href: string;
  icon?: string;
}

interface MenuItem {
  name: string;
  icon: string;
  href?: string;
  subItems?: SubMenuItem[];
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentMode = searchParams.get("mode") || "dashboard";

  const [activeMenu, setActiveMenu] = useState<string>("Dashboard");
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLogoutToast, setShowLogoutToast] = useState(false);

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    fotoProfilUrl: "",
  });

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUserData({
            username: parsed.username || parsed.name || "",
            email: parsed.email || "",
            fotoProfilUrl: parsed.fotoProfilUrl || "",
          });
        } catch (e) {
          console.error("Gagal parsing data user dari localStorage", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    const fetchProfileSidebar = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/profile`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (res.ok) {
            const data = await res.json();
            const newUserData = {
              username: data.username || "",
              email: data.email || "",
              fotoProfilUrl: data.fotoProfilUrl || "",
            };
            setUserData(newUserData);
            localStorage.setItem("user", JSON.stringify(data));
            return;
          }
        }
      } catch (error) {
        console.error("Gagal memuat profil sidebar:", error);
      }
    };

    if (isOpen) {
      fetchProfileSidebar();
    }
  }, [isOpen]);

  const menuItems: MenuItem[] = [
    { name: "Dashboard", icon: "dashboard", href: "?mode=dashboard" },
    {
      name: "Catatan Keuangan",
      icon: "trending_up",
      subItems: [
        { name: "Transaksi", icon: "trending_up", href: "?mode=transaksi" },
        {
          name: "Kelola Pinjaman",
          icon: "payments",
          href: "?mode=kelolapinjaman",
        },
        { name: "Budgeting", icon: "attach_money", href: "?mode=budgeting" },
        { name: "Target Nabung", icon: "adjust", href: "?mode=targetnabung" },
      ],
    },
    {
      name: "Financial Health",
      icon: "health_and_safety",
      href: "?mode=financialhealth",
    },
    { name: "Kalkulator Bunga", icon: "calculate", href: "?mode=kalkulator" },
    { name: "Cari Aman", icon: "shield", href: "?mode=cariaman" },
  ];

  useEffect(() => {
    const queryHref = `?mode=${currentMode}`;
    let foundMatch = false;

    menuItems.forEach((item) => {
      if (item.subItems) {
        const matchedSub = item.subItems.find((sub) => sub.href === queryHref);
        if (matchedSub) {
          setActiveMenu(matchedSub.name);
          setOpenSubmenu(item.name);
          foundMatch = true;
        }
      } else if (item.href === queryHref) {
        setActiveMenu(item.name);
        foundMatch = true;
      }
    });

    if (!foundMatch && currentMode === "dashboard") {
      setActiveMenu("Dashboard");
    }
  }, [currentMode]);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu((prev) => (prev === name ? null : name));
  };

  // Fungsi Konfirmasi Logout (Buka Modal)
  const confirmLogout = () => {
    setShowLogoutModal(true);
  };

  // Fungsi Eksekusi Logout
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setShowLogoutModal(false);

    const token = localStorage.getItem("token");

    try {
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      setIsLoggingOut(false);
      onClose();
      
      setShowLogoutToast(true);

      setTimeout(() => {
        router.push("/?mode=login");
        router.refresh();
      }, 1500);
    }
  };

  return (
    <>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>

      <div className="fixed inset-0 z-50 mx-auto max-w-md lg:max-w-none lg:mx-0 pointer-events-none overflow-hidden lg:overflow-visible">
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 lg:hidden ${
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        />

        <aside
          className={`absolute lg:fixed top-0 left-0 h-full lg:h-screen w-4/5 max-w-70 lg:w-64 bg-[#F8F9FC] border-r border-gray-400 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out pointer-events-auto ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full min-h-0">
            <div className="shrink-0">
              <div className="flex justify-end mb-4">
                <button
                  onClick={onClose}
                  className="text-gray-800 hover:text-gray-500 cursor-pointer flex items-center justify-center p-1 rounded-lg hover:bg-white/5"
                >
                  <span className="material-icons select-none">close</span>
                </button>
              </div>

              <Link
                href="?mode=profile-edit"
                onClick={onClose}
                className="flex items-center gap-3 my-2 p-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700 bg-gray-800 shrink-0 group-hover:border-[#6c63f2] transition-colors">
                  <img
                    src={
                      isMounted && userData.fotoProfilUrl
                        ? userData.fotoProfilUrl
                        : "/default-avatar.png"
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/default-avatar.jpg";
                    }}
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-[#6c63f2] transition-colors truncate">
                    {isMounted ? userData.username || "Memuat..." : "Memuat..."}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {isMounted ? userData.email : ""}
                  </div>
                </div>
              </Link>

              <hr className="border-gray-800/80 my-4" />
            </div>

            <nav className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto no-scrollbar">
              {menuItems.map((item) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isSubmenuOpen = openSubmenu === item.name;
                const isAnySubActive = item.subItems?.some(
                  (sub) => sub.name === activeMenu,
                );
                const isActive = activeMenu === item.name || isAnySubActive;

                const activeStyles = isActive
                  ? "bg-[#F3F2FE] text-[#6c63f2] font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:bg-[#6c63f2] before:rounded-r-full"
                  : "text-gray-700 hover:bg-gray-100 hover:text-[#6c63f2] font-medium";

                return (
                  <div key={item.name} className="flex flex-col">
                    {hasSubItems ? (
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className={`relative flex items-center justify-between p-3 rounded-xl text-sm w-full text-left whitespace-nowrap transition-all duration-300 cursor-pointer ${activeStyles}`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="material-icons text-xl select-none leading-none shrink-0">
                            {item.icon}
                          </span>
                          <span className="truncate">{item.name}</span>
                        </div>
                        <span
                          className={`material-icons text-lg transition-transform duration-300 select-none shrink-0 ml-2 ${
                            isSubmenuOpen ? "rotate-180 text-gray-500" : "text-gray-500"
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                    ) : (
                      <Link
                        href={item.href || "#"}
                        onClick={() => {
                          setActiveMenu(item.name);
                          onClose();
                        }}
                        className={`relative flex items-center justify-between p-3 rounded-xl text-sm w-full transition-all duration-300 cursor-pointer ${activeStyles}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-icons text-xl select-none leading-none">
                            {item.icon}
                          </span>
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    )}

                    {hasSubItems && (
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          isSubmenuOpen
                            ? "grid-rows-[1fr] opacity-100 mt-1 mb-1"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="flex flex-col pl-7 pr-2 py-1 gap-1 border-l border-gray-400 ml-5">
                            {item.subItems?.map((sub) => {
                              const isSubActive = activeMenu === sub.name;
                              return (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  onClick={() => {
                                    setActiveMenu(sub.name);
                                    onClose();
                                  }}
                                  className={`flex items-center gap-2.5 p-2 rounded-lg text-xs transition-colors ${
                                    isSubActive
                                      ? "text-[#6c63f2] font-semibold bg-[#F3F2FE]"
                                      : "text-gray-700 hover:text-[#6c63f2] hover:bg-gray-100 font-medium"
                                  }`}
                                >
                                  {sub.icon && (
                                    <span className="material-icons text-base select-none leading-none opacity-80">
                                      {sub.icon}
                                    </span>
                                  )}
                                  <span>{sub.name}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-gray-400 mt-2 shrink-0">
              <button
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-500/10 transition-colors w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-icons text-xl select-none leading-none">
                  logout
                </span>
                <span className="text-sm font-semibold">
                  {isLoggingOut ? "Logging out..." : "Log Out"}
                </span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      <ConfirmDeleteModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        loading={isLoggingOut}
        title="Logout Akun?"
        description="Apakah kamu yakin ingin keluar dari akun ini? Kamu harus login kembali untuk mengakses data keuanganmu."
      />

      <ToastSuccess
        isVisible={showLogoutToast}
        onClose={() => setShowLogoutToast(false)}
        title="Berhasil Logout"
        message="Kamu telah keluar dari akun. Sampai jumpa kembali!"
        autoCloseDuration={1500}
      />
    </>
  );
}