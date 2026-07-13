"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Flex,
  useColorMode,
  Badge,
  Select,
  FormLabel,
  List,
  ListItem,
} from "@chakra-ui/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FileUploader from "@/components/ui/FileUploader";
import PdfPreview from "@/components/ui/PDFPreview";
import usePdfAction from "@/hooks/usePdfAction";
import { FadeInUp, ScaleIn } from "@/components/ui/animations";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const ACCEPT = {
  "application/pdf": [],
  "image/png": [],
  "image/jpeg": [],
  [DOCX_MIME]: [".docx"],
  "application/msword": [".doc"],
};

type Kind = "none" | "pdf" | "images" | "word";

const FORMAT_OPTIONS: Record<Exclude<Kind, "none">, { value: string; label: string }[]> = {
  pdf: [
    { value: "png", label: "PNG images" },
    { value: "jpeg", label: "JPEG images" },
    { value: "txt", label: "Text (.txt)" },
    { value: "docx", label: "Word (.docx)" },
  ],
  images: [{ value: "pdf", label: "PDF" }],
  word: [{ value: "pdf", label: "PDF" }],
};

export default function ConvertPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState("png");
  const { handlePdfAction, loading } = usePdfAction("convert", "Converted!");
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const kind: Kind = useMemo(() => {
    if (files.length === 0) return "none";
    const f = files[0];
    if (f.type === "application/pdf") return "pdf";
    if (f.type === "image/png" || f.type === "image/jpeg") return "images";
    return "word";
  }, [files]);

  useEffect(() => {
    if (kind !== "none") setFormat(FORMAT_OPTIONS[kind][0].value);
  }, [kind]);

  const options = kind === "none" ? [] : FORMAT_OPTIONS[kind];

  return (
    <DashboardLayout>
      <Box maxW="5xl" mx="auto" px={4} py={10}>
        <Flex mb={6}>
          <Badge
            px={3}
            py={1}
            rounded="full"
            fontSize="xs"
            display="inline-flex"
            alignItems="center"
            gap={2}
            bg={isDark ? "purple.900" : "purple.50"}
            color={isDark ? "purple.100" : "purple.700"}
            border="1px solid"
            borderColor={isDark ? "purple.700" : "purple.100"}
          >
            <Box w={2} h={2} rounded="full" bg={isDark ? "purple.200" : "purple.500"} />
            Convert tool
          </Badge>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
          <Box gridColumn={{ lg: "span 2" }} display="flex" flexDirection="column" gap={6}>
            <FadeInUp>
              <Box>
                <Heading size="lg" color={isDark ? "white" : "gray.900"}>
                  Convert
                </Heading>
                <Text mt={2} fontSize="sm" color={isDark ? "gray.200" : "gray.500"}>
                  PDF → images, text, or Word. Images or Word → PDF.
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
                <FileUploader
                  multiple
                  accept={ACCEPT}
                  label="Drag & drop a PDF, images (PNG/JPG), or a Word file"
                  onFilesAccepted={setFiles}
                />
                <Text mt={2} fontSize="xs" textAlign="center" color={isDark ? "gray.400" : "gray.400"}>
                  PDF, PNG, JPG, DOC, DOCX
                </Text>

                {files.length > 0 && kind !== "pdf" && (
                  <List spacing={1} mt={4} fontSize="sm">
                    {files.map((f, i) => (
                      <ListItem key={`${f.name}-${i}`}>
                        {i + 1}. {f.name}
                      </ListItem>
                    ))}
                  </List>
                )}

                {kind === "pdf" && <PdfPreview file={files[0]} />}
              </Box>
            </ScaleIn>

            {kind !== "none" && (
              <FadeInUp delay={0.08}>
                <Box>
                  <FormLabel fontSize="sm" mb={1}>Convert to</FormLabel>
                  <Select value={format} onChange={(e) => setFormat(e.target.value)} w="56">
                    {options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </Box>
              </FadeInUp>
            )}

            <FadeInUp delay={0.1}>
              <Button
                onClick={() => handlePdfAction(files, "converted", { format })}
                colorScheme="purple"
                isDisabled={files.length === 0 || loading}
                isLoading={loading}
                alignSelf={{ base: "stretch", sm: "flex-start" }}
              >
                Convert
              </Button>
            </FadeInUp>
          </Box>

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
                Upload a PDF to convert it to PNG/JPEG images (one per page, ZIP for multi-page),
                plain text, or Word. Upload images to combine them into a PDF, or a Word document
                to turn it into a PDF. Word conversion requires LibreOffice on the server.
              </Text>
            </Box>
          </FadeInUp>
        </SimpleGrid>
      </Box>
    </DashboardLayout>
  );
}
