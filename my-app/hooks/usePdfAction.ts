"use client";

import { useState } from "react";
import { useToast } from "@chakra-ui/react";

/**
 * Sends file(s) plus optional extra fields to /api/<endpoint> as FormData,
 * then downloads the returned file.
 */
export default function usePdfAction(endpoint: string, successMsg: string) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handlePdfAction = async (
    input: File | File[] | null,
    outputPrefix = "processed",
    extraFields: Record<string, string> = {}
  ) => {
    const files = Array.isArray(input) ? input : input ? [input] : [];
    if (files.length === 0) return;
    setLoading(true);

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    Object.entries(extraFields).forEach(([k, v]) => formData.append(k, v));

    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "Action failed";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          /* non-JSON error body */
        }
        throw new Error(message);
      }

      // Get processed file and trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const contentType = res.headers.get("Content-Type") ?? "";
      const extMap: [string, string][] = [
        ["text/plain", ".txt"],
        ["application/zip", ".zip"],
        ["image/png", ".png"],
        ["image/jpeg", ".jpg"],
        ["wordprocessingml", ".docx"],
        ["application/pdf", ".pdf"],
      ];
      const ext = extMap.find(([t]) => contentType.includes(t))?.[1] ?? "";
      const stem = (files.length > 1 ? "output" : files[0].name).replace(/\.[^.]+$/, "");
      const baseName = `${stem}${ext || ".bin"}`;

      const a = document.createElement("a");
      a.href = url;
      a.download = `${outputPrefix}-${baseName}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: successMsg, status: "success" });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Operation failed.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return { handlePdfAction, loading };
}
