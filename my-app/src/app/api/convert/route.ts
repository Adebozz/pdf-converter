// src/app/api/convert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import {
  rasterizePdf,
  extractPdfText,
  convertWithLibreOffice,
} from "@/lib/serverPdf";
import { buildZip } from "@/lib/zip";

export const runtime = "nodejs";
export const maxDuration = 60;

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function isImage(f: File) {
  return f.type === "image/png" || f.type === "image/jpeg";
}
function isWord(f: File) {
  return (
    f.type === DOCX_MIME ||
    f.type === "application/msword" ||
    /\.docx?$/i.test(f.name)
  );
}

/**
 * Convert tool. Form fields: files (+ format).
 * - PDF in  → format: png | jpeg | txt | docx
 * - Images in (png/jpg, multiple ok) → format: pdf
 * - Word in (.doc/.docx) → format: pdf
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    const format = String(formData.get("format") ?? "png").toLowerCase();

    // Images → PDF
    if (format === "pdf" && files.every(isImage)) {
      const doc = await PDFDocument.create();
      for (const f of files) {
        const bytes = await f.arrayBuffer();
        const img =
          f.type === "image/png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      return pdfResponse(Buffer.from(await doc.save()), "converted.pdf");
    }

    // Word → PDF
    if (format === "pdf" && files.length === 1 && isWord(files[0])) {
      const inExt = files[0].name.toLowerCase().endsWith(".doc") ? "doc" : "docx";
      const out = await convertWithLibreOffice(
        Buffer.from(await files[0].arrayBuffer()),
        inExt,
        "pdf"
      );
      return pdfResponse(out, "converted.pdf");
    }

    if (format === "pdf") {
      return NextResponse.json(
        { error: "To convert to PDF, upload images (PNG/JPG) or a Word document." },
        { status: 400 }
      );
    }

    // Remaining formats need a single PDF input
    const file = files[0];
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Upload a PDF for this conversion." }, { status: 400 });
    }
    const data = new Uint8Array(await file.arrayBuffer());

    if (format === "txt") {
      const pages = await extractPdfText(data);
      const body = pages.map((t, i) => `--- Page ${i + 1} ---\n${t}`).join("\n\n");
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": 'attachment; filename="converted.txt"',
        },
      });
    }

    if (format === "docx") {
      const out = await convertWithLibreOffice(Buffer.from(data), "pdf", "docx");
      return new NextResponse(new Uint8Array(out), {
        status: 200,
        headers: {
          "Content-Type": DOCX_MIME,
          "Content-Disposition": 'attachment; filename="converted.docx"',
        },
      });
    }

    if (format === "png" || format === "jpeg") {
      const pages = await rasterizePdf(data, 2, format);
      const ext = format === "jpeg" ? "jpg" : "png";
      const mime = format === "jpeg" ? "image/jpeg" : "image/png";

      if (pages.length === 1) {
        return new NextResponse(new Uint8Array(pages[0]), {
          status: 200,
          headers: {
            "Content-Type": mime,
            "Content-Disposition": `attachment; filename="converted.${ext}"`,
          },
        });
      }
      const zip = buildZip(
        pages.map((img, i) => ({
          name: `page-${String(i + 1).padStart(2, "0")}.${ext}`,
          data: img,
        }))
      );
      return new NextResponse(new Uint8Array(zip), {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="converted-pages.zip"',
        },
      });
    }

    return NextResponse.json({ error: `Unknown format: ${format}` }, { status: 400 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return NextResponse.json(
        {
          error:
            "Word conversion needs LibreOffice. Install it with: brew install --cask libreoffice",
        },
        { status: 501 }
      );
    }
    console.error("Convert error:", error);
    return NextResponse.json(
      { error: `Conversion failed: ${(error as Error)?.message ?? "unknown error"}` },
      { status: 500 }
    );
  }
}

function pdfResponse(bytes: Buffer, filename: string) {
  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
