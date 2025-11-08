// src/app/api/ocr/route.ts
import { NextResponse } from "next/server";

// Required in App Router API routes — must export a method (GET/POST etc.)
export async function POST(req: Request) {
  try {
    // Example placeholder response
    return NextResponse.json({ message: "OCR endpoint working (stub)" }, { status: 200 });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json({ error: "Failed to process OCR" }, { status: 500 });
  }
}

// Optional: quick test route for GET requests
export async function GET() {
  return NextResponse.json({ message: "Use POST to send data to OCR endpoint" }, { status: 200 });
}
