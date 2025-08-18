import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload failed" });

    const uploadedFiles = files.files;
    if (!uploadedFiles) return res.status(400).json({ error: "No files uploaded" });

    // 🟡 Fake merge (just return first file)
    const firstFile = Array.isArray(uploadedFiles) ? uploadedFiles[0] : uploadedFiles;
    const fileBuffer = fs.readFileSync(firstFile.filepath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=merged.pdf");
    res.send(fileBuffer);
  });
}
