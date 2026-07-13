"use client";

import { useState } from "react";
import { VStack, Heading, Button, Input, FormLabel, Box } from "@chakra-ui/react";
import FileUploader from "@/components/ui/FileUploader";
import PdfPreview from "@/components/ui/PDFPreview";
import DashboardLayout from "@/components/layout/DashboardLayout";
import usePdfAction from "@/hooks/usePdfAction";
import { FadeInUp, ScaleIn } from "@/components/ui/animations";

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const { handlePdfAction, loading } = usePdfAction("watermark", "Watermark added!");

  return (
    <DashboardLayout>
      <VStack spacing={6}>
        <FadeInUp>
          <Heading>Add Watermark</Heading>
        </FadeInUp>

        <ScaleIn delay={0.1}>
          <FileUploader onFileAccepted={setFile} />
        </ScaleIn>

        <FadeInUp delay={0.15}>
          <Box>
            <FormLabel fontSize="sm" mb={1}>Watermark text</FormLabel>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="CONFIDENTIAL"
              w="72"
            />
          </Box>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <Button
            onClick={() => handlePdfAction(file, "watermarked", { text })}
            colorScheme="red"
            isDisabled={!file || !text.trim() || loading}
            isLoading={loading}
          >
            Add Watermark
          </Button>
        </FadeInUp>

        <PdfPreview file={file} />
      </VStack>
    </DashboardLayout>
  );
}
