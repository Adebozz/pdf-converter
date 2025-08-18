"use client";

import { useState } from "react";
import { VStack, Heading, Button } from "@chakra-ui/react";
import FileUploader from "@/components/ui/FileUploader";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import usePdfAction from "@/hooks/usePdfAction";

export default function ConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const { handlePdfAction, loading } = usePdfAction("convert", "PDF converted!");

  return (
    <DashboardLayout>
      <VStack spacing={6}>
        <Heading>Convert PDF</Heading>
        <FileUploader onFileAccepted={setFile} />
        <Button
          onClick={() => handlePdfAction(file, "converted")}
          colorScheme="teal"
          isDisabled={!file}
          isLoading={loading}
        >
          Convert
        </Button>
      </VStack>
    </DashboardLayout>
  );
}
