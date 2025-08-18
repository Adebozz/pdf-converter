"use client";

import { useState } from "react";
import { useToast } from "@chakra-ui/react";

export default function usePdfAction(endpoint: string, successMsg: string) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handlePdfAction = async (file: File | null, outputPrefix = "processed") => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Action failed");
      }

      // Get processed file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${outputPrefix}-${file.name}`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast({ title: successMsg, status: "success" });
    } catch (err) {
      toast({ title: "Operation failed.", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return { handlePdfAction, loading };
}
