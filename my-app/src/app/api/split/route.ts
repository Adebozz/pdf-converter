// src/app/api/split/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

/**
 * Extracts a page range from the uploaded PDF.
 * Form fields: files (PDF), from (1-based, default 1), to (default last page).
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("files");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No PDF file uploaded." }, { status: 400 });
    }

    const src = await PDFDocument.load(await file.arrayBuffer());
    const pageCount = src.getPageCount();

    const from = Math.max(1, parseInt(String(formData.get("from") ?? "1"), 10) || 1);
    const to = Math.min(pageCount, parseInt(String(formData.get("to") ?? pageCount), 10) || pageCount);

    if (from > to) {
      return NextResponse.json(
        { error: `Invalid range: from ${from} to ${to} (document has ${pageCount} pages).` },
        { status: 400 }
      );
    }

    const out = await PDFDocument.create();
    const indices = Array.from({ length: to - from + 1 }, (_, i) => from - 1 + i);
    const pages = await out.copyPages(src, indices);
    pages.forEach((p) => out.addPage(p));

    const bytes = await out.save();
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="split-pages-${from}-${to}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Split error:", error);
    return NextResponse.json({ error: "Split failed. Is the file a valid PDF?" }, { status: 500 });
  }
}
