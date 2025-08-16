import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, Files } from "formidable";

// NOTE: disable Next.js default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const data = await new Promise<Files>((resolve, reject) => {
      const form = new IncomingForm();
      form.parse(req, (err, _fields, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });

    const file = Array.isArray(data.file) ? data.file[0] : data.file;
    const filePath = file?.filepath || (file as any)?.path;

    // TODO: later - use pdfjsLib or pdf-lib to extract and convert pages
    // e.g. const pdf = await pdfjsLib.getDocument(filePath).promise;

    return res.status(200).json({
      message: "PDF received",
      filePath, // keep for debugging now
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to process upload" });
  }
}
