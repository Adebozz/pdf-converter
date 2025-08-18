"use client";

import { useState } from "react";
import { VStack, Heading, Button } from "@chakra-ui/react";
import FileUploader from "@/components/ui/FileUploader";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import usePdfAction from "@/hooks/usePdfAction";

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const { handlePdfAction, loading } = usePdfAction("compress", "PDF compressed!");

  return (
    <DashboardLayout>
      <VStack spacing={6}>
        <Heading>Compress PDF</Heading>
        <FileUploader onFileAccepted={setFile} />
        <Button
          onClick={() => handlePdfAction(file, "compressed")}
          colorScheme="teal"
          isDisabled={!file}
          isLoading={loading}
        >
          Compress
        </Button>
      </VStack>
    </DashboardLayout>
  );
}
