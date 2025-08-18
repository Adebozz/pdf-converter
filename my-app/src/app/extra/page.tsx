"use client";

import { useState } from "react";
import { VStack, Heading, Button } from "@chakra-ui/react";
import FileUploader from "@/components/ui/FileUploader";
import DashboardLayout from "@/components/layout/DashboardLayout";
import usePdfAction from "@/hooks/usePdfAction";
import { FadeInUp, ScaleIn } from "@/components/ui/animations";

export default function ExtractPage() {
  const [file, setFile] = useState<File | null>(null);
  const { handlePdfAction, loading } = usePdfAction("extract", "Content extracted!");

  return (
    <DashboardLayout>
      <VStack spacing={6}>
        <FadeInUp>
          <Heading>Extract Content</Heading>
        </FadeInUp>

        <ScaleIn delay={0.1}>
          <FileUploader onFileAccepted={setFile} />
        </ScaleIn>

        <FadeInUp delay={0.2}>
          <Button
            onClick={() => handlePdfAction(file, "extracted")}
            colorScheme="green"
            isDisabled={!file || loading}
            isLoading={loading}
          >
            Extract
          </Button>
        </FadeInUp>
      </VStack>
    </DashboardLayout>
  );
}
