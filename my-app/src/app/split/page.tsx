"use client";

import { useState } from "react";
import { VStack, Heading, Button } from "@chakra-ui/react";
import { motion } from "framer-motion";
import FileUploader from "@/components/ui/FileUploader";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import usePdfAction from "@/hooks/usePdfAction";

const MotionVStack = motion(VStack);

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const { handlePdfAction, loading } = usePdfAction("split", "PDF split successfully!");

  return (
    <DashboardLayout>
      <MotionVStack
        spacing={6}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Heading>Split PDF</Heading>
        <FileUploader onFileAccepted={setFile} />
        <Button
          onClick={() => handlePdfAction(file, "split")}
          colorScheme="teal"
          isDisabled={!file || loading}
          isLoading={loading}
        >
          Split
        </Button>
      </MotionVStack>
    </DashboardLayout>
  );
}
