// src/app/api/compress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

/**
 * Re-saves the PDF with object streams enabled, which removes unused
 * objects and often shrinks the file. For aggressive compression
 * (image downsampling), a tool like Ghostscript would be needed.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("files");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No PDF file uploaded." }, { status: 400 });
    }

    const doc = await PDFDocument.load(await file.arrayBuffer());
    const bytes = await doc.save({ useObjectStreams: true });

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="compressed.pdf"',
      },
    });
  } catch (error) {
    console.error("Compress error:", error);
    return NextResponse.json({ error: "Compression failed. Is the file a valid PDF?" }, { status: 500 });
  }
}
