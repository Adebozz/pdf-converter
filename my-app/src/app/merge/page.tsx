"use client";

import { useState } from "react";
import { VStack, Heading, Button } from "@chakra-ui/react";
import FileUploader from "@/components/ui/FileUploader";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import usePdfAction from "@/hooks/usePdfAction";

export default function MergePage() {
  const [file, setFile] = useState<File | null>(null);
  const { handlePdfAction, loading } = usePdfAction("merge", "PDFs merged!");

  return (
    <DashboardLayout>
      <VStack spacing={6}>
        <Heading>Merge PDFs</Heading>
        <FileUploader onFileAccepted={setFile} />
        <Button
          onClick={() => handlePdfAction(file, "merged")}
          colorScheme="teal"
          isDisabled={!file}
          isLoading={loading}
        >
          Merge
        </Button>
      </VStack>
    </DashboardLayout>
  );
}
