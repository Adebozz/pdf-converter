// lib/serverPdf.ts
// Server-side PDF page rasterization. Prefers @napi-rs/canvas (bundled
// as a pdfjs-dist dependency) and falls back to poppler's pdftoppm CLI.

import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";

const run = promisify(execFile);

export const MAX_RASTER_PAGES = 50;

/** Renders each PDF page to a PNG buffer. */
export async function rasterizePdf(data: Uint8Array, scale = 2): Promise<Buffer[]> {
  try {
    return await rasterizeWithPdfjs(data, scale);
  } catch (err) {
    console.warn("pdfjs/canvas rasterization unavailable, trying pdftoppm:", err);
    return rasterizeWithPoppler(data, scale);
  }
}

async function rasterizeWithPdfjs(data: Uint8Array, scale: number): Promise<Buffer[]> {
  const { createCanvas } = await import("@napi-rs/canvas");
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const pageCount = Math.min(doc.numPages, MAX_RASTER_PAGES);
  const out: Buffer[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const ctx = canvas.getContext("2d");
    await page.render({
      canvas: canvas as unknown as HTMLCanvasElement,
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;
    out.push(canvas.toBuffer("image/png"));
  }
  return out;
}

async function rasterizeWithPoppler(data: Uint8Array, scale: number): Promise<Buffer[]> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "pdfraster-"));
  try {
    const inPath = path.join(dir, "in.pdf");
    await fs.writeFile(inPath, data);
    await run("pdftoppm", [
      "-png",
      "-r",
      String(Math.round(72 * scale)),
      "-l",
      String(MAX_RASTER_PAGES),
      inPath,
      path.join(dir, "page"),
    ]);
    const files = (await fs.readdir(dir))
      .filter((f) => f.startsWith("page") && f.endsWith(".png"))
      .sort();
    if (files.length === 0) throw new Error("pdftoppm produced no pages");
    return Promise.all(files.map((f) => fs.readFile(path.join(dir, f))));
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}
