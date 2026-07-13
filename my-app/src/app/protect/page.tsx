"use client";

import { useState } from "react";
import { VStack, Heading, Button, Input, FormLabel, Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import FileUploader from "@/components/ui/FileUploader";
import PdfPreview from "@/components/ui/PDFPreview";
import DashboardLayout from "@/components/layout/DashboardLayout";
import usePdfAction from "@/hooks/usePdfAction";

const MotionVStack = motion(VStack);

export default function ProtectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const { handlePdfAction, loading } = usePdfAction("protect", "PDF protected!");

  return (
    <DashboardLayout>
      <MotionVStack
        spacing={6}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Heading>Protect PDF</Heading>
        <FileUploader onFileAccepted={setFile} />
        <Box>
          <FormLabel fontSize="sm" mb={1}>Password (min 4 characters)</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a password"
            w="72"
          />
        </Box>
        <Button
          onClick={() => handlePdfAction(file, "protected", { password })}
          colorScheme="teal"
          isDisabled={!file || password.length < 4 || loading}
          isLoading={loading}
        >
          Protect
        </Button>

        <PdfPreview file={file} />
      </MotionVStack>
    </DashboardLayout>
  );
}
