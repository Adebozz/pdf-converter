"use client";

import { useState } from "react";
import { VStack, Heading, Button } from "@chakra-ui/react";
import { motion } from "framer-motion";
import FileUploader from "@/components/ui/FileUploader";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import usePdfAction from "@/hooks/usePdfAction";

const MotionVStack = motion(VStack);

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const { handlePdfAction, loading } = usePdfAction("convert", "PDF converted!");

  return (
    <DashboardLayout>
      <MotionVStack
        spacing={6}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Heading>PDF Converter</Heading>
        <FileUploader onFileAccepted={setFile} />
        <Button
          onClick={() => handlePdfAction(file, "converted")}
          colorScheme="teal"
          isDisabled={!file || loading}
          isLoading={loading}
        >
          Convert PDF
        </Button>
      </MotionVStack>
    </DashboardLayout>
  );
}
