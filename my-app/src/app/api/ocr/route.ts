// src/app/api/ocr/route.ts
import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { rasterizePdf } from "@/lib/serverPdf";

export const runtime = "nodejs";
export const maxDuration = 60;

const run = promisify(execFile);

// Dynamic import that neither TypeScript nor webpack resolves at build
// time, so the app builds even when the optional package isn't installed.
const dynamicImport = new Function("m", "return import(m)") as (
  m: string
) => Promise<Record<string, unknown>>;

/** Pure-JS OCR via tesseract.js (works on Vercel). */
async function ocrWithTesseractJs(pages: Buffer[]): Promise<string[]> {
  const mod = await dynamicImport("tesseract.js");
  const createWorker = mod.createWorker as (
    lang: string,
    oem?: number,
    opts?: Record<string, unknown>
  ) => Promise<{
    recognize(image: Buffer): Promise<{ data: { text: string } }>;
    terminate(): Promise<unknown>;
  }>;

  // /tmp is the only writable dir on serverless platforms.
  const worker = await createWorker("eng", 1, { cachePath: "/tmp" });
  try {
    const out: string[] = [];
    for (const png of pages) {
      const { data } = await worker.recognize(png);
      out.push(data.text.trim());
    }
    return out;
  } finally {
    await worker.terminate();
  }
}

/** CLI fallback via tesseract (works locally with `brew install tesseract`). */
async function ocrWithCli(pages: Buffer[]): Promise<string[]> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "pdfocr-"));
  try {
    const out: string[] = [];
    for (let i = 0; i < pages.length; i++) {
      const pngPath = path.join(dir, `page-${i + 1}.png`);
      await fs.writeFile(pngPath, pages[i]);
      const { stdout } = await run("tesseract", [pngPath, "stdout"], {
        maxBuffer: 32 * 1024 * 1024,
      });
      out.push(stdout.trim());
    }
    return out;
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * OCR: renders each PDF page to an image, then recognizes text.
 * Tries tesseract.js first (serverless-friendly), then the tesseract CLI.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("files");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No PDF file uploaded." }, { status: 400 });
    }

    const data = new Uint8Array(await file.arrayBuffer());
    const pages = await rasterizePdf(data, 2);

    let texts: string[];
    try {
      texts = await ocrWithTesseractJs(pages);
    } catch (jsError) {
      console.warn("tesseract.js unavailable, trying tesseract CLI:", jsError);
      try {
        texts = await ocrWithCli(pages);
      } catch (cliError) {
        if ((cliError as NodeJS.ErrnoException)?.code === "ENOENT") {
          return NextResponse.json(
            {
              error:
                "No OCR backend available. Run `npm install tesseract.js` (serverless) or `brew install tesseract` (local).",
            },
            { status: 501 }
          );
        }
        throw cliError;
      }
    }

    const body = texts.map((t, i) => `--- Page ${i + 1} ---\n${t}`).join("\n\n");
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="ocr.txt"',
      },
    });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json({ error: "OCR failed. Is the file a valid PDF?" }, { status: 500 });
  }
}
