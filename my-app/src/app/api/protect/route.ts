// src/app/api/protect/route.ts
import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";

export const runtime = "nodejs";

const run = promisify(execFile);

/**
 * Password-protects the PDF with AES-256 using the qpdf CLI.
 * Form fields: files (PDF), password.
 * Requires qpdf installed on the server (macOS: `brew install qpdf`).
 */
export async function POST(req: NextRequest) {
  let dir: string | null = null;
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

    dir = await fs.mkdtemp(path.join(os.tmpdir(), "pdfprotect-"));
    const inPath = path.join(dir, "in.pdf");
    const outPath = path.join(dir, "out.pdf");
    await fs.writeFile(inPath, Buffer.from(await file.arrayBuffer()));

    await run("qpdf", ["--encrypt", password, password, "256", "--", inPath, outPath]);

    const bytes = await fs.readFile(outPath);
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="protected.pdf"',
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return NextResponse.json(
        { error: "qpdf is not installed on the server. Install it with: brew install qpdf" },
        { status: 501 }
      );
    }
    console.error("Protect error:", error);
    return NextResponse.json({ error: "Password protection failed. Is the file a valid PDF?" }, { status: 500 });
  } finally {
    if (dir) await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
