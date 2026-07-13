// src/app/api/ocr/route.ts
import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { rasterizePdf } from "@/lib/serverPdf";

export const runtime = "nodejs";

const run = promisify(execFile);

/**
 * OCR: renders each PDF page to an image, then runs the tesseract CLI
 * on it. Returns the recognized text as a .txt file.
 * Requires tesseract installed on the server (macOS: `brew install tesseract`).
 */
export async function POST(req: NextRequest) {
  let dir: string | null = null;
  try {
    const formData = await req.formData();
    const file = formData.get("files");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No PDF file uploaded." }, { status: 400 });
    }

    const data = new Uint8Array(await file.arrayBuffer());
    const pages = await rasterizePdf(data, 2);

    dir = await fs.mkdtemp(path.join(os.tmpdir(), "pdfocr-"));
    const parts: string[] = [];
    for (let i = 0; i < pages.length; i++) {
      const pngPath = path.join(dir, `page-${i + 1}.png`);
      await fs.writeFile(pngPath, pages[i]);
      const { stdout } = await run("tesseract", [pngPath, "stdout"], {
        maxBuffer: 32 * 1024 * 1024,
      });
      parts.push(`--- Page ${i + 1} ---\n${stdout.trim()}`);
    }

    return new NextResponse(parts.join("\n\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ocr.txt"',
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return NextResponse.json(
        { error: "tesseract is not installed on the server. Install it with: brew install tesseract" },
        { status: 501 }
      );
    }
    console.error("OCR error:", error);
    return NextResponse.json({ error: "OCR failed. Is the file a valid PDF?" }, { status: 500 });
  } finally {
    if (dir) await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
