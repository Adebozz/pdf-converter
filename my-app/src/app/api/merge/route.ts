// src/app/api/merge/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "No PDF files uploaded." }, { status: 400 });
    }
    if (files.length < 2) {
      return NextResponse.json({ error: "Upload at least 2 PDFs to merge." }, { status: 400 });
    }

    const merged = await PDFDocument.create();
    for (const file of files) {
      const src = await PDFDocument.load(await file.arrayBuffer());
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
    }

    const bytes = await merged.save();
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
      },
    });
  } catch (error) {
    console.error("Merge error:", error);
    return NextResponse.json({ error: "Merge failed. Are all files valid PDFs?" }, { status: 500 });
  }
}
