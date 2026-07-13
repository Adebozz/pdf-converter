"use client";

import { useState } from "react";
import { VStack, Heading, Button, Select, FormLabel, Box } from "@chakra-ui/react";
import FileUploader from "@/components/ui/FileUploader";
import PdfPreview from "@/components/ui/PDFPreview";
import DashboardLayout from "@/components/layout/DashboardLayout";
import usePdfAction from "@/hooks/usePdfAction";
import { FadeInUp, ScaleIn } from "@/components/ui/animations";

export default function RotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState("90");
  const { handlePdfAction, loading } = usePdfAction("rotate", "PDF rotated!");

  return (
    <DashboardLayout>
      <VStack spacing={6}>
        <FadeInUp>
          <Heading>Rotate PDF</Heading>
        </FadeInUp>

        <ScaleIn delay={0.1}>
          <FileUploader onFileAccepted={setFile} />
        </ScaleIn>

        <FadeInUp delay={0.15}>
          <Box>
            <FormLabel fontSize="sm" mb={1}>Rotation angle</FormLabel>
            <Select value={angle} onChange={(e) => setAngle(e.target.value)} w="40">
              <option value="90">90° clockwise</option>
              <option value="180">180°</option>
              <option value="270">90° counter-clockwise</option>
            </Select>
          </Box>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <Button
            onClick={() => handlePdfAction(file, "rotated", { angle })}
            colorScheme="pink"
            isDisabled={!file || loading}
            isLoading={loading}
          >
            Rotate
          </Button>
        </FadeInUp>

        <PdfPreview file={file} />
      </VStack>
    </DashboardLayout>
  );
}
