// src/app/api/compress/route.ts
import { NextResponse } from "next/server";

// If you're on Vercel / Next.js app router, this keeps it on the Node runtime
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Parse multipart/form-data sent from the client
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // "Compress" – for now we'll just echo the file back like your original code
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="compressed.pdf"',
      },
    });
  } catch (err) {
    console.error("Upload/compress error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

// Optional: so you can hit it in the browser and see it's alive
export async function GET() {
  return NextResponse.json(
    { message: "Use POST with form-data 'file' to compress PDF" },
    { status: 200 }
  );
}
