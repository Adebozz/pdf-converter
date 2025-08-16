import type { NextApiRequest, NextApiResponse } from 'next'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'

export const config = {
  api: {
    bodyParser: false, // Required for file upload
  },
}

import { IncomingForm } from 'formidable'
import fs from 'fs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const data: any = await new Promise((resolve, reject) => {
    const form = new IncomingForm()
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      resolve(files)
    })
  })

  const file = data.file[0]
  const filePath = file.filepath || file.path

  // TODO: use pdfjsLib to extract and convert pages

  res.status(200).json({ message: 'PDF received' })
}
