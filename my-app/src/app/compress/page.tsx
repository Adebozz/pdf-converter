"use client";

import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Flex,
  useColorMode,
  Badge,
} from "@chakra-ui/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FileUploader from "@/components/ui/FileUploader";
import PdfPreview from "@/components/ui/PDFPreview";
import usePdfAction from "@/hooks/usePdfAction";
import { FadeInUp, ScaleIn } from "@/components/ui/animations";

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const { handlePdfAction, loading } = usePdfAction(
    "compress",
    "PDF compressed!"
  );
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <DashboardLayout>
      <Box maxW="5xl" mx="auto" px={4} py={10}>
        {/* badge */}
        <Flex mb={6}>
          <Badge
            px={3}
            py={1}
            rounded="full"
            fontSize="xs"
            display="inline-flex"
            alignItems="center"
            gap={2}
            bg={isDark ? "green.900" : "green.50"}
            color={isDark ? "green.100" : "green.700"}
            border="1px solid"
            borderColor={isDark ? "green.700" : "green.100"}
          >
            <Box w={2} h={2} rounded="full" bg={isDark ? "green.200" : "green.500"} />
            Compress tool
          </Badge>
        </Flex>

        {/* main layout */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
          {/* left side: header + uploader + button */}
          <Box as="section" gridColumn={{ lg: "span 2" }} display="flex" flexDirection="column" gap={6}>
            <FadeInUp>
              <Box>
                <Heading size="lg" color={isDark ? "white" : "gray.900"}>
                  Compress PDF
                </Heading>
                <Text mt={2} fontSize="sm" color={isDark ? "gray.200" : "gray.500"} maxW="2xl">
                  Reduce the size of your PDF for easier sharing and faster uploads.
                  Your file stays on the server only for processing.
                </Text>
              </Box>
            </FadeInUp>

            <ScaleIn delay={0.05}>
              <Box
                bg={isDark ? "whiteAlpha.50" : "gray.50"}
                border="1px dashed"
                borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
                rounded="xl"
                p={6}
              >
                {/* your existing uploader */}
                <FileUploader onFileAccepted={setFile} />
                <Text
                  mt={2}
                  fontSize="xs"
                  textAlign="center"
                  color={isDark ? "gray.400" : "gray.400"}
                >
                  Max 10MB • PDF only
                </Text>
                <PdfPreview file={file} />
              </Box>
            </ScaleIn>

            <FadeInUp delay={0.1}>
              <Button
                onClick={() => handlePdfAction(file, "compressed")}
                colorScheme="teal"
                isDisabled={!file || loading}
                isLoading={loading}
                alignSelf={{ base: "stretch", sm: "flex-start" }}
              >
                Compress PDF
              </Button>
            </FadeInUp>
          </Box>

          {/* right side: info panel */}
          <FadeInUp delay={0.15}>
            <Box
              bg={isDark ? "whiteAlpha.50" : "white"}
              border="1px solid"
              borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
              rounded="xl"
              p={4}
              h="fit-content"
            >
              <Heading as="h2" size="sm" mb={3} color={isDark ? "white" : "gray.900"}>
                About this tool
              </Heading>
              <Text fontSize="xs" color={isDark ? "gray.200" : "gray.600"}>
                This tool reduces your PDF size. Depending on the PDF content, compression level may
                vary.
              </Text>

              <Box mt={4}>
                <Text fontWeight="semibold" fontSize="xs" mb={1} color={isDark ? "gray.100" : "gray.800"}>
                  Tips
                </Text>
                <Box as="ul" pl={4} display="grid" gap={1}>
                  <Text as="li" fontSize="xs" color={isDark ? "gray.300" : "gray.500"}>
                    Best results on image-heavy PDFs
                  </Text>
                  <Text as="li" fontSize="xs" color={isDark ? "gray.300" : "gray.500"}>
                    Try to keep files under 10MB
                  </Text>
                  <Text as="li" fontSize="xs" color={isDark ? "gray.300" : "gray.500"}>
                    You can run it again on the result
                  </Text>
                </Box>
              </Box>

              <Box mt={4}>
                <Text fontWeight="semibold" fontSize="xs" mb={1} color={isDark ? "gray.100" : "gray.800"}>
                  Output
                </Text>
                <Text fontSize="xs" color={isDark ? "gray.300" : "gray.500"}>
                  PDF, auto-downloaded as <code>compressed.pdf</code>
                </Text>
              </Box>
            </Box>
          </FadeInUp>
        </SimpleGrid>
      </Box>
    </DashboardLayout>
  );
}
