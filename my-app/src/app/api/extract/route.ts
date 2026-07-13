// src/app/api/extract/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Extracts text from the uploaded PDF using pdfjs-dist (server-side)
 * and returns it as a .txt file. Scanned PDFs (images only) will
 * return little or no text — that needs OCR.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("files");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No PDF file uploaded." }, { status: 400 });
    }

    // pdfjs needs DOMMatrix at import time. If @napi-rs/canvas is
    // available, pdfjs polyfills it properly; otherwise stub it
    // (text extraction doesn't render pages, so a stub is fine).
    try {
      await import("@napi-rs/canvas");
    } catch {
      if (typeof (globalThis as { DOMMatrix?: unknown }).DOMMatrix === "undefined") {
        (globalThis as { DOMMatrix?: unknown }).DOMMatrix = class {
          a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
          scale() { return this; }
          translate() { return this; }
          transform() { return this; }
        };
      }
    }

    const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const data = new Uint8Array(await file.arrayBuffer());
    const doc = await getDocument({ data, useSystemFonts: true }).promise;

    const parts: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      parts.push(`--- Page ${i} ---\n${pageText}`);
    }

    return new NextResponse(parts.join("\n\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="extracted.txt"',
      },
    });
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json({ error: "Text extraction failed. Is the file a valid PDF?" }, { status: 500 });
  }
}
