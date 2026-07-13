// src/app/api/convert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { rasterizePdf, MAX_RASTER_PAGES } from "@/lib/serverPdf";
import { buildZip } from "@/lib/zip";

export const runtime = "nodejs";

/**
 * Converts a PDF to PNG images (one per page, up to MAX_RASTER_PAGES).
 * Single page → PNG; multiple pages → ZIP of PNGs.
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

    if (pages.length === 1) {
      return new NextResponse(new Uint8Array(pages[0]), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": 'attachment; filename="converted.png"',
        },
      });
    }

    const zip = buildZip(
      pages.map((png, i) => ({
        name: `page-${String(i + 1).padStart(2, "0")}.png`,
        data: png,
      }))
    );

    return new NextResponse(new Uint8Array(zip), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="converted-pages.zip"',
        "X-Page-Limit": String(MAX_RASTER_PAGES),
      },
    });
  } catch (error) {
    console.error("Convert error:", error);
    return NextResponse.json(
      { error: "Conversion failed. PDF rendering needs @napi-rs/canvas or poppler (brew install poppler)." },
      { status: 500 }
    );
  }
}
