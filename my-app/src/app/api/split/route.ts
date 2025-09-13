// src/app/api/split/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { PDFDocument } from "pdf-lib";

export const POST = async (req: NextRequest) => {
  try {
    // Read uploaded PDF as ArrayBuffer
    const buffer = Buffer.from(await req.arrayBuffer());

    // Load the PDF
    const pdfDoc = await PDFDocument.load(buffer);

    // Split: take the first page as an example
    const newPdf = await PDFDocument.create();
    const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);
    newPdf.addPage(firstPage);

    // Serialize the new PDF
    const pdfBytes = await newPdf.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="split.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Split failed" }, { status: 500 });
  }
};
