// src/app/api/protect/route.ts
import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";

export const runtime = "nodejs";

const run = promisify(execFile);

// Dynamic import that neither TypeScript nor webpack resolves at build
// time, so the app builds even when the optional package isn't installed.
const dynamicImport = new Function("m", "return import(m)") as (
  m: string
) => Promise<Record<string, unknown>>;

/** Pure-JS AES-256 encryption via @cantoo/pdf-lib (works on Vercel). */
async function encryptWithCantoo(input: Buffer, password: string): Promise<Uint8Array> {
  const mod = await dynamicImport("@cantoo/pdf-lib");
  const PDFDocument = mod.PDFDocument as {
    load(data: Buffer): Promise<{
      encrypt(opts: { userPassword: string; ownerPassword: string }): Promise<void> | void;
      save(): Promise<Uint8Array>;
    }>;
  };
  const doc = await PDFDocument.load(input);
  await doc.encrypt({ userPassword: password, ownerPassword: password });
  return doc.save();
}

/** CLI fallback via qpdf (works locally with `brew install qpdf`). */
async function encryptWithQpdf(input: Buffer, password: string): Promise<Buffer> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "pdfprotect-"));
  try {
    const inPath = path.join(dir, "in.pdf");
    const outPath = path.join(dir, "out.pdf");
    await fs.writeFile(inPath, input);
    await run("qpdf", ["--encrypt", password, password, "256", "--", inPath, outPath]);
    return await fs.readFile(outPath);
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Password-protects the PDF with AES-256.
 * Tries @cantoo/pdf-lib first (serverless-friendly), then the qpdf CLI.
 * Form fields: files (PDF), password.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("files");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No PDF file uploaded." }, { status: 400 });
    }

    const password = String(formData.get("password") ?? "");
    if (password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters." }, { status: 400 });
    }

    const input = Buffer.from(await file.arrayBuffer());

    let bytes: Uint8Array;
    try {
      bytes = await encryptWithCantoo(input, password);
    } catch (jsError) {
      console.warn("@cantoo/pdf-lib unavailable, trying qpdf:", jsError);
      try {
        bytes = new Uint8Array(await encryptWithQpdf(input, password));
      } catch (cliError) {
        if ((cliError as NodeJS.ErrnoException)?.code === "ENOENT") {
          return NextResponse.json(
            {
              error:
                "No encryption backend available. Run `npm install @cantoo/pdf-lib` (serverless) or `brew install qpdf` (local).",
            },
            { status: 501 }
          );
        }
        throw cliError;
      }
    }

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="protected.pdf"',
      },
    });
  } catch (error) {
    console.error("Protect error:", error);
    return NextResponse.json(
      { error: "Password protection failed. Is the file a valid PDF?" },
      { status: 500 }
    );
  }
}
