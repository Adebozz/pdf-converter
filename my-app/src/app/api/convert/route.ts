// src/app/api/convert/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

export const POST = async (req: NextRequest) => {
  try {
    // Read uploaded file as ArrayBuffer
    const buffer = Buffer.from(await req.arrayBuffer());

    // Write buffer to temp file
    const tempFile = `/tmp/uploaded.pdf`;
    fs.writeFileSync(tempFile, buffer);

    // 🟡 Fake conversion: just return the file back with a new name
    const fileBuffer = fs.readFileSync(tempFile);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="converted.pdf"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
  }
};
