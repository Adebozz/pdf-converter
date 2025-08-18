"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Box, Flex, Button, Text, Spinner } from "@chakra-ui/react";

// Tell pdfjs where to get worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfPreviewProps {
  file: File | null;
}

export default function PdfPreview({ file }: PdfPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  // Convert File -> Object URL for react-pdf
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFileUrl(null);
    }
  }, [file]);

  if (!fileUrl) {
    return (
      <Box textAlign="center" color="gray.500" mt={4}>
        <Text>No PDF selected.</Text>
      </Box>
    );
  }

  const handleNext = () => {
    if (pageNumber < numPages) setPageNumber(pageNumber + 1);
  };

  const handlePrev = () => {
    if (pageNumber > 1) setPageNumber(pageNumber - 1);
  };

  return (
    <Box mt={6} textAlign="center">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<Spinner size="lg" />}
      >
        <Page pageNumber={pageNumber} width={500} />
      </Document>

      <Flex justify="center" align="center" gap={4} mt={4}>
        <Button size="sm" onClick={handlePrev} isDisabled={pageNumber <= 1}>
          Prev
        </Button>
        <Text>
          Page {pageNumber} of {numPages}
        </Text>
        <Button size="sm" onClick={handleNext} isDisabled={pageNumber >= numPages}>
          Next
        </Button>
      </Flex>
    </Box>
  );
}
