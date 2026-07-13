"use client";

// react-pdf/pdfjs is browser-only, so the real preview is loaded
// client-side only (ssr: false) to keep `next build` prerendering happy.
import dynamic from "next/dynamic";

const PdfPreview = dynamic(() => import("./PdfPreviewInner"), {
  ssr: false,
});

export default PdfPreview;
