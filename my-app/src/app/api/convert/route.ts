import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

export const config = {
  api: {
    bodyParser: false, // required for formidable
  },
};

const parseForm = (req: NextApiRequest): Promise<{ files: any }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ keepExtensions: true });
    form.parse(req, (err, _fields, files) => {
      if (err) reject(err);
      else resolve({ files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { files } = await parseForm(req);
    const file = files.file?.[0] || files.file; // handles both single/multiple

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const data = fs.readFileSync(file.filepath); // read file buffer
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(data) }).promise;

    let textContent = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      const pageText = text.items.map((item: any) => item.str).join(" ");
      textContent += pageText + "\n\n";
    }

    return res.status(200).json({ text: textContent });
  } catch (err) {
    console.error("PDF conversion error:", err);
    return res.status(500).json({ error: "Failed to convert PDF" });
  }
}
