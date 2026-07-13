import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep pdfjs-dist external on the server so the /api/extract route
  // can load its legacy Node build without webpack bundling issues.
  serverExternalPackages: ["pdfjs-dist", "@napi-rs/canvas"],
};

export default nextConfig;
