// src/app/api/rotate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";

export const runtime = "nodejs";

/**
 * Rotates every page by the given angle.
 * Form fields: files (PDF), angle (90 | 180 | 270, default 90).
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("files");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No PDF file uploaded." }, { status: 400 });
    }

    const angle = parseInt(String(formData.get("angle") ?? "90"), 10) || 90;

    const doc = await PDFDocument.load(await file.arrayBuffer());
    doc.getPages().forEach((page) => {
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + angle) % 360));
    });

    const bytes = await doc.save();
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="rotated.pdf"',
      },
    });
  } catch (error) {
    console.error("Rotate error:", error);
    return NextResponse.json({ error: "Rotation failed. Is the file a valid PDF?" }, { status: 500 });
  }
}
