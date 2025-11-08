"use client";

import React, { useState, DragEvent, ChangeEvent } from "react";

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setErrorMsg("");
      setSuccessMsg("");
    } else {
      setErrorMsg("Please upload a PDF file.");
    }
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked && picked.type === "application/pdf") {
      setFile(picked);
      setErrorMsg("");
      setSuccessMsg("");
    } else {
      setErrorMsg("Please upload a PDF file.");
    }
  };

  const handleCompress = async () => {
    if (!file) {
      setErrorMsg("Please select a PDF first.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/compress", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Compression failed");
      }

      // get the blob and trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMsg("Compression complete. Your download should start.");
    } catch (err) {
      setErrorMsg("Something went wrong while compressing the PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-56px)] w-full bg-transparent">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* tool badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/40 text-emerald-200 px-3 py-1 rounded-full text-xs mb-6">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          Compress tool
        </div>

        <div className="flex flex-col gap-8 md:grid md:grid-cols-3">
          {/* left: main action */}
          <div className="md:col-span-2 space-y-6">
            <header>
              <h1 className="text-3xl font-bold text-white">Compress PDF</h1>
              <p className="text-sm text-slate-200/80 mt-2 max-w-2xl">
                Reduce the size of your PDF for easier sharing and faster uploads. Your file stays on the server only for processing.
              </p>
            </header>

            {/* dropzone */}
            <label
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-10 cursor-pointer transition ${
                isDragging
                  ? "border-emerald-400 bg-emerald-400/5"
                  : "border-slate-500/50 bg-slate-900/20"
              }`}
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-slate-100 text-sm">
                Drag & drop a PDF here, or <span className="text-emerald-300">click to browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-2">Max 10MB • PDF only</p>
            </label>

            {/* selected file */}
            {file && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                    onClick={() => setFile(null)}
                    className="text-xs text-slate-300 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            )}

            {/* status messages */}
            {errorMsg && (
              <p className="text-sm text-red-300 bg-red-500/5 border border-red-500/30 rounded-md px-3 py-2">
                {errorMsg}
              </p>
            )}
            {successMsg && (
              <p className="text-sm text-emerald-200 bg-emerald-500/5 border border-emerald-500/20 rounded-md px-3 py-2">
                {successMsg}
              </p>
            )}

            {/* action button */}
            <button
              onClick={handleCompress}
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-medium hover:bg-emerald-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Compressing..." : "Compress PDF"}
            </button>
          </div>

          {/* right: tool info */}
          <aside className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4 h-fit">
            <h2 className="text-sm font-semibold text-white">About this tool</h2>
            <p className="text-xs text-slate-300">
              This tool reduces your PDF size. Depending on the PDF content, compression level may vary.
            </p>
            <div>
              <p className="text-xs font-semibold text-slate-200 mb-1">Tips</p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Best results on image-heavy PDFs</li>
                <li>• Try to keep files under 10MB</li>
                <li>• You can run it again on the result</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200 mb-1">Output</p>
              <p className="text-xs text-slate-400">PDF, auto-downloaded as <code className="text-slate-200">compressed.pdf</code></p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
