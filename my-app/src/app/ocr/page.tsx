"use client";

import { useState } from "react";
import { VStack, Heading, Button } from "@chakra-ui/react";
import { motion } from "framer-motion";
import FileUploader from "@/components/ui/FileUploader";
import DashboardLayout from "@/components/layout/DashboardLayout";
import usePdfAction from "@/hooks/usePdfAction";

const MotionVStack = motion(VStack);

export default function OcrPage() {
  const [file, setFile] = useState<File | null>(null);
  const { handlePdfAction, loading } = usePdfAction("ocr", "OCR applied to PDF!");

  return (
    <DashboardLayout>
      <MotionVStack
        spacing={6}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Heading>OCR PDF</Heading>
        <FileUploader onFileAccepted={setFile} />
        <Button
          onClick={() => handlePdfAction(file, "ocr")}
          colorScheme="teal"
          isDisabled={!file || loading}
          isLoading={loading}
        >
          Apply OCR
        </Button>
      </MotionVStack>
    </DashboardLayout>
  );
}
