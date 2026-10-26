"use client";

import { useState, useEffect } from "react";
import "material-icons/iconfont/material-icons.css";
import Notifikasi from "./notifikasi";

interface HeaderProps {
  title: string;
  onOpenSidebar: () => void;
  onProfileClick?: () => void;
}

export default function Header({ title, onOpenSidebar, onProfileClick }: HeaderProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
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
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            const newUserData = {
              username: data.username || "",
              email: data.email || "",
              fotoProfilUrl: data.fotoProfilUrl || "",
            };
            setUserData(newUserData);
            localStorage.setItem("user", JSON.stringify(data));
          }
        }
      } catch (error) {
        console.error("Gagal memuat profil:", error);
      }
    };

    fetchProfileSidebar();
  }, []); 

  return (
    <>
      <Notifikasi 
        isOpen={isNotifOpen} 
        onClose={() => setIsNotifOpen(false)} 
      />

      <div className="w-full flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2.5">
          <button
            type="button"
            className="flex items-center justify-center text-gray-800 hover:text-gray-900 transition-colors cursor-pointer duration-500"
            onClick={onOpenSidebar}
          >
            <span className="material-icons text-2xl select-none">menu</span>
          </button>
          <h1 className="text-xl font-bold tracking-wide text-gray-800">{title}</h1>
        </div>

        <div className="flex flex-row items-center gap-3">
          {/* <button
            type="button"
            onClick={() => setIsNotifOpen(true)}
            className="flex items-center justify-center text-gray-800 hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-icons text-xl select-none">
              notifications
            </span>
          </button> */}

          <button
            type="button"
            onClick={onProfileClick}
            className="w-7 h-7 rounded-full overflow-hidden border border-gray-700 bg-gray-800 shrink-0 cursor-pointer"
          >
            <img
              src={
                isMounted && userData.fotoProfilUrl
                  ? userData.fotoProfilUrl
                  : "/default-avatar.png"
              }
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/default-avatar.png";
              }}
            />
          </button>
        </div>
      </div>
    </>
  );
}