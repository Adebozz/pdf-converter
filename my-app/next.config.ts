import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep pdfjs-dist external on the server so the /api/extract route
  // can load its legacy Node build without webpack bundling issues.
  serverExternalPackages: ["pdfjs-dist", "@napi-rs/canvas"],
  // These are loaded via runtime dynamic imports, which Vercel's file
  // tracing can't see — force-include them in the deployed functions.
  // (Globs that match nothing are ignored, so this is safe before
  // the packages are installed.)
  outputFileTracingIncludes: {
    "/api/protect": ["./node_modules/@cantoo/pdf-lib/**"],
    "/api/ocr": [
      "./node_modules/tesseract.js/**",
      "./node_modules/tesseract.js-core/**",
    ],
  },
};

export default nextConfig;
