// src/app/api/ocr/route.ts
import { NextResponse } from "next/server";

// Required in App Router API routes — must export a method (GET/POST etc.)
export async function POST() {
  // OCR needs an OCR engine (e.g. tesseract.js) — not implemented yet.
  return NextResponse.json(
    { error: "OCR isn't available yet — it needs an OCR engine like tesseract.js." },
    { status: 501 }
  );
}

// Optional: quick test route for GET requests
export async function GET() {
  return NextResponse.json({ message: "Use POST to send data to OCR endpoint" }, { status: 200 });
}
