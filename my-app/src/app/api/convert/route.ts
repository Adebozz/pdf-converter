// src/app/api/convert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

/**
 * Normalizes/re-processes the PDF (re-saved via pdf-lib).
 * Converting to other formats (Word, images) requires extra tooling
 * such as LibreOffice or a rendering library — see README.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("files");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No PDF file uploaded." }, { status: 400 });
    }

    const doc = await PDFDocument.load(await file.arrayBuffer());
    const bytes = await doc.save();

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="converted.pdf"',
      },
    });
  } catch (error) {
    console.error("Convert error:", error);
    return NextResponse.json({ error: "Conversion failed. Is the file a valid PDF?" }, { status: 500 });
  }
}
