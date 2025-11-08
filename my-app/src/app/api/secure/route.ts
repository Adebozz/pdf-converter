// src/app/api/secure/route.ts
import { NextResponse } from "next/server";

// Optional runtime setting
export const runtime = "nodejs";

// POST handler – replace with your actual logic later
export async function POST(req: Request) {
  try {
    // Example placeholder: respond with a success message
    return NextResponse.json({ message: "Secure endpoint working (stub)" }, { status: 200 });
  } catch (error) {
    console.error("Secure route error:", error);
    return NextResponse.json({ error: "Failed to process secure request" }, { status: 500 });
  }
}

// Optional: simple GET for browser testing
export async function GET() {
  return NextResponse.json(
    { message: "Use POST to access secure endpoint" },
    { status: 200 }
  );
}
