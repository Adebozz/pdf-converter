// src/app/api/watermark/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

export const runtime = "nodejs";

/**
 * Stamps a diagonal text watermark on every page.
 * Form fields: files (PDF), text (default "CONFIDENTIAL").
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("files");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No PDF file uploaded." }, { status: 400 });
    }

    const text = String(formData.get("text") || "CONFIDENTIAL").slice(0, 100);

    const doc = await PDFDocument.load(await file.arrayBuffer());
    const font = await doc.embedFont(StandardFonts.HelveticaBold);

    for (const page of doc.getPages()) {
      const { width, height } = page.getSize();
      const fontSize = Math.min(width, height) / Math.max(8, text.length * 0.6);
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      page.drawText(text, {
        x: width / 2 - textWidth / 2.8,
        y: height / 2 - fontSize / 2,
        size: fontSize,
        font,
        color: rgb(0.6, 0.6, 0.6),
        opacity: 0.3,
        rotate: degrees(45),
      });
    }

    const bytes = await doc.save();
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="watermarked.pdf"',
      },
    });
  } catch (error) {
    console.error("Watermark error:", error);
    return NextResponse.json({ error: "Watermarking failed. Is the file a valid PDF?" }, { status: 500 });
  }
}
