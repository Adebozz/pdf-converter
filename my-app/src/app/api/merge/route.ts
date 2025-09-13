// src/app/api/merge/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

export const POST = async (req: NextRequest) => {
  try {
    // Read the uploaded file(s) as ArrayBuffer
    const buffer = Buffer.from(await req.arrayBuffer());

    // Write to temp file (for demonstration, only handles single file)
    const tempFile = `/tmp/uploaded.pdf`;
    fs.writeFileSync(tempFile, buffer);

    // 🟡 Fake merge: just return the first uploaded file
    const fileBuffer = fs.readFileSync(tempFile);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Merge failed" }, { status: 500 });
  }
};
