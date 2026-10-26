"use client";

import { useState } from "react";

export function useToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });

  const showToast = (title: string, message: string, type: "success" | "error" = "success") => {
    setToastConfig({ title, message, type });
    setIsVisible(true);
  };

  const hideToast = () => {
    setIsVisible(false);
  };

  return {
    isVisible,
    title: toastConfig.title,
    message: toastConfig.message,
    type: toastConfig.type,
    showToast,
    hideToast,
  };
}