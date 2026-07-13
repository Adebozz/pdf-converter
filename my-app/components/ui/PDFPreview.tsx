"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Box, Flex, Button, Text, Spinner } from "@chakra-ui/react";

// Worker copied from react-pdf's bundled pdfjs-dist into /public.
// If you upgrade react-pdf, re-copy:
//   cp node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfPreviewProps {
  file: File | null;
  width?: number;
}

export default function PdfPreview({ file, width = 420 }: PdfPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Convert File -> Object URL for react-pdf; reset state on file change
  useEffect(() => {
    setPageNumber(1);
    setNumPages(0);
    setError(null);
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setFileUrl(null);
  }, [file]);

  if (!fileUrl) return null;

  return (
    <Box mt={6} textAlign="center">
      <Box display="inline-block" maxW="100%" overflow="auto" rounded="md" boxShadow="md">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={() => setError("Could not load this PDF.")}
          loading={<Spinner size="lg" />}
          error={<Text color="red.400" p={4}>{error ?? "Could not load this PDF."}</Text>}
        >
          <Page
            pageNumber={pageNumber}
            width={width}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </Box>

      {numPages > 0 && (
        <Flex justify="center" align="center" gap={4} mt={4}>
          <Button
            size="sm"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            isDisabled={pageNumber <= 1}
          >
            Prev
          </Button>
          <Text fontSize="sm">
            Page {pageNumber} of {numPages}
          </Text>
          <Button
            size="sm"
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            isDisabled={pageNumber >= numPages}
          >
            Next
          </Button>
        </Flex>
      )}
    </Box>
  );
}
