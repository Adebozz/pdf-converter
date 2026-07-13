// src/app/api/extract/route.ts
import { NextRequest, NextResponse } from "next/server";
import { extractPdfText } from "@/lib/serverPdf";

export const runtime = "nodejs";

/**
 * Extracts embedded text from the uploaded PDF and returns it as a
 * .txt file. Scanned PDFs (images only) will return little or no
 * text — use the OCR tool for those.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("files");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No PDF file uploaded." }, { status: 400 });
    }

    const pages = await extractPdfText(new Uint8Array(await file.arrayBuffer()));
    const body = pages.map((t, i) => `--- Page ${i + 1} ---\n${t}`).join("\n\n");

    return new NextResponse(body, {
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
