// src/app/api/split/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { buildZip, ZipEntry } from "@/lib/zip";

export const runtime = "nodejs";

/**
 * Splits a PDF. Form fields:
 * - files: the PDF
 * - mode: "range" (default) extracts pages from..to into one PDF;
 *         "pages" splits every page into its own PDF, returned as a ZIP.
 * - from/to: 1-based range (range mode only; to defaults to last page).
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
    const mode = String(formData.get("mode") ?? "range");

    if (mode === "pages") {
      if (pageCount === 1) {
        return NextResponse.json(
          { error: "This PDF has only one page — nothing to split." },
          { status: 400 }
        );
      }
      const pad = String(pageCount).length;
      const entries: ZipEntry[] = [];
      for (let i = 0; i < pageCount; i++) {
        const out = await PDFDocument.create();
        const [page] = await out.copyPages(src, [i]);
        out.addPage(page);
        entries.push({
          name: `page-${String(i + 1).padStart(pad, "0")}.pdf`,
          data: Buffer.from(await out.save()),
        });
      }
      return new NextResponse(new Uint8Array(buildZip(entries)), {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="split-pages.zip"',
        },
      });
    }

    // range mode
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
