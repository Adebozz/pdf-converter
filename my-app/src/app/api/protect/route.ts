// src/app/api/protect/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Password protection is NOT yet implemented: pdf-lib does not support
 * PDF encryption. Options: shell out to qpdf, or use a library with
 * encryption support (e.g. @cantoo/pdf-lib or mupdf).
 */
export async function POST() {
  return NextResponse.json(
    { error: "Password protection isn't available yet — it needs an encryption-capable library (e.g. qpdf)." },
    { status: 501 }
  );
}
