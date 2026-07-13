// lib/serverPdf.ts
// Server-side PDF helpers: rasterization, text extraction, and
// LibreOffice-based document conversion.

import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";

const run = promisify(execFile);

export const MAX_RASTER_PAGES = 50;

export type RasterFormat = "png" | "jpeg";

/** Renders each PDF page to an image buffer (PNG or JPEG). */
export async function rasterizePdf(
  data: Uint8Array,
  scale = 2,
  format: RasterFormat = "png"
): Promise<Buffer[]> {
  let pdfjsError: unknown;
  try {
    return await rasterizeWithPdfjs(data, scale, format);
  } catch (err) {
    pdfjsError = err;
    console.warn("pdfjs/canvas rasterization failed, trying pdftoppm:", err);
  }
  try {
    return await rasterizeWithPoppler(data, scale, format);
  } catch (popplerError) {
    console.warn("pdftoppm rasterization failed:", popplerError);
    throw new Error(
      `PDF rendering failed. pdfjs/canvas: ${String(
        (pdfjsError as Error)?.message ?? pdfjsError
      )} | poppler: ${String((popplerError as Error)?.message ?? popplerError)}`
    );
  }
}

interface NodeCanvas {
  toBuffer(mime: "image/png" | "image/jpeg"): Buffer;
}

interface NodeCanvasFactory {
  create(width: number, height: number): { canvas: NodeCanvas; context: unknown };
}

/**
 * Imports pdfjs with DOMMatrix guaranteed to exist first. Critical:
 * pdfjs references DOMMatrix at module-evaluation time, and Node
 * caches a failed module forever — so DOMMatrix must be in place
 * before the FIRST pdfjs import anywhere in the process.
 */
async function loadPdfjs() {
  const g = globalThis as { DOMMatrix?: unknown };
  if (typeof g.DOMMatrix === "undefined") {
    try {
      const canvas = await import("@napi-rs/canvas");
      g.DOMMatrix = (canvas as unknown as Record<string, unknown>).DOMMatrix;
    } catch {
      /* canvas unavailable */
    }
    if (typeof g.DOMMatrix === "undefined") {
      // Text-extraction-safe stub; rendering falls back to poppler.
      g.DOMMatrix = class {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        scale() { return this; }
        translate() { return this; }
        transform() { return this; }
      };
    }
  }
  return import("pdfjs-dist/legacy/build/pdf.mjs");
}

async function rasterizeWithPdfjs(
  data: Uint8Array,
  scale: number,
  format: RasterFormat
): Promise<Buffer[]> {
  const { getDocument } = await loadPdfjs();

  // pdfjs transfers (detaches) the buffer it's given — pass a copy so
  // the caller's buffer stays usable for the poppler fallback.
  const doc = await getDocument({ data: data.slice(), useSystemFonts: true }).promise;
  // pdfjs creates a NodeCanvasFactory automatically when @napi-rs/canvas
  // is available; using it avoids constructing canvases ourselves.
  const canvasFactory = (doc as unknown as { canvasFactory: NodeCanvasFactory }).canvasFactory;
  if (!canvasFactory) throw new Error("pdfjs canvasFactory unavailable (@napi-rs/canvas missing?)");

  const pageCount = Math.min(doc.numPages, MAX_RASTER_PAGES);
  const out: Buffer[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const { canvas, context } = canvasFactory.create(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height)
    );
    await page.render({
      canvas: canvas as unknown as HTMLCanvasElement,
      canvasContext: context as CanvasRenderingContext2D,
      viewport,
    }).promise;
    out.push(canvas.toBuffer(format === "jpeg" ? "image/jpeg" : "image/png"));
    page.cleanup();
  }
  return out;
}

async function rasterizeWithPoppler(
  data: Uint8Array,
  scale: number,
  format: RasterFormat
): Promise<Buffer[]> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "pdfraster-"));
  try {
    const inPath = path.join(dir, "in.pdf");
    await fs.writeFile(inPath, data);
    const ext = format === "jpeg" ? "jpg" : "png";
    await run("pdftoppm", [
      format === "jpeg" ? "-jpeg" : "-png",
      "-r",
      String(Math.round(72 * scale)),
      "-l",
      String(MAX_RASTER_PAGES),
      inPath,
      path.join(dir, "page"),
    ]);
    const files = (await fs.readdir(dir))
      .filter((f) => f.startsWith("page") && f.endsWith(`.${ext}`))
      .sort();
    if (files.length === 0) throw new Error("pdftoppm produced no pages");
    return Promise.all(files.map((f) => fs.readFile(path.join(dir, f))));
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

/** Extracts text per page using pdfjs (no rendering required). */
export async function extractPdfText(data: Uint8Array): Promise<string[]> {
  const { getDocument } = await loadPdfjs();
  // .slice(): pdfjs detaches the buffer it receives.
  const doc = await getDocument({ data: data.slice(), useSystemFonts: true }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(
      content.items.map((item) => ("str" in item ? item.str : "")).join(" ")
    );
  }
  return pages;
}

/** Locates the LibreOffice binary, including the default macOS app path. */
async function findSoffice(): Promise<string> {
  const candidates = [
    "soffice",
    "/Applications/LibreOffice.app/Contents/MacOS/soffice",
    "libreoffice",
  ];
  for (const c of candidates) {
    try {
      await run(c, ["--version"]);
      return c;
    } catch {
      /* try next */
    }
  }
  const err = new Error("LibreOffice not found") as NodeJS.ErrnoException;
  err.code = "ENOENT";
  throw err;
}

/** Converts a document between formats via LibreOffice (e.g. docx→pdf, pdf→docx). */
export async function convertWithLibreOffice(
  input: Buffer,
  inExt: string,
  outExt: string
): Promise<Buffer> {
  const soffice = await findSoffice();
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "loconv-"));
  try {
    const inPath = path.join(dir, `input.${inExt}`);
    await fs.writeFile(inPath, input);
    await run(soffice, ["--headless", "--convert-to", outExt, "--outdir", dir, inPath], {
      timeout: 120_000,
    });
    return await fs.readFile(path.join(dir, `input.${outExt}`));
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
