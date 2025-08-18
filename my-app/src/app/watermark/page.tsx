"use client";

import { useState } from "react";
import { VStack, Heading, Button } from "@chakra-ui/react";
import FileUploader from "@/components/ui/FileUploader";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import usePdfAction from "@/hooks/usePdfAction";
import { FadeInUp, ScaleIn } from "@/components/ui/animations";

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
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

        <FadeInUp delay={0.2}>
          <Button
            onClick={() => handlePdfAction(file, "watermarked")}
            colorScheme="red"
            isDisabled={!file || loading}
            isLoading={loading}
          >
            Add Watermark
          </Button>
        </FadeInUp>
      </VStack>
    </DashboardLayout>
  );
}
