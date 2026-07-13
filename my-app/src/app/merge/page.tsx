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
  List,
  ListItem,
  IconButton,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FileUploader from "@/components/ui/FileUploader";
import PdfPreview from "@/components/ui/PDFPreview";
import usePdfAction from "@/hooks/usePdfAction";
import { FadeInUp, ScaleIn } from "@/components/ui/animations";

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const { handlePdfAction, loading } = usePdfAction("merge", "PDFs merged!");
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewIndex((prev) => (index < prev ? prev - 1 : Math.min(prev, files.length - 2)));
  };

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
            bg={isDark ? "blue.900" : "blue.50"}
            color={isDark ? "blue.100" : "blue.700"}
            border="1px solid"
            borderColor={isDark ? "blue.700" : "blue.100"}
          >
            <Box w={2} h={2} rounded="full" bg={isDark ? "blue.200" : "blue.500"} />
            Merge tool
          </Badge>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
          <Box gridColumn={{ lg: "span 2" }} display="flex" flexDirection="column" gap={6}>
            <FadeInUp>
              <Box>
                <Heading size="lg" color={isDark ? "white" : "gray.900"}>
                  Merge PDFs
                </Heading>
                <Text mt={2} fontSize="sm" color={isDark ? "gray.200" : "gray.500"}>
                  Combine multiple PDFs into a single file. Upload two or more PDFs — they are
                  merged in the order listed.
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
                  onFilesAccepted={(newFiles) => setFiles((prev) => [...prev, ...newFiles])}
                />
                <Text mt={2} fontSize="xs" textAlign="center" color={isDark ? "gray.400" : "gray.400"}>
                  Upload 2+ PDFs to merge
                </Text>

                {files.length > 0 && (
                  <List spacing={2} mt={4}>
                    {files.map((f, i) => (
                      <ListItem
                        key={`${f.name}-${i}`}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        fontSize="sm"
                        px={3}
                        py={1.5}
                        rounded="md"
                        cursor="pointer"
                        onClick={() => setPreviewIndex(i)}
                        bg={
                          i === previewIndex
                            ? isDark ? "blue.900" : "blue.50"
                            : isDark ? "whiteAlpha.100" : "white"
                        }
                        border="1px solid"
                        borderColor={
                          i === previewIndex
                            ? isDark ? "blue.500" : "blue.300"
                            : isDark ? "whiteAlpha.200" : "gray.200"
                        }
                      >
                        <Text noOfLines={1}>
                          {i + 1}. {f.name}
                        </Text>
                        <IconButton
                          aria-label={`Remove ${f.name}`}
                          icon={<CloseIcon boxSize={2.5} />}
                          size="xs"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(i);
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}

                {files.length > 0 && (
                  <Text mt={4} fontSize="xs" textAlign="center" color={isDark ? "gray.400" : "gray.500"}>
                    Previewing: {files[Math.min(previewIndex, files.length - 1)]?.name} — click a
                    file above to preview it
                  </Text>
                )}
                <PdfPreview file={files[Math.min(previewIndex, files.length - 1)] ?? null} />
              </Box>
            </ScaleIn>

            <FadeInUp delay={0.1}>
              <Button
                onClick={() => handlePdfAction(files, "merged")}
                colorScheme="blue"
                isDisabled={files.length < 2 || loading}
                isLoading={loading}
                alignSelf={{ base: "stretch", sm: "flex-start" }}
              >
                Merge {files.length > 0 ? `${files.length} file${files.length === 1 ? "" : "s"}` : ""}
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
                Combines your uploaded PDFs into one document, in the order shown. Click any file
                in the list to preview it before merging.
              </Text>
            </Box>
          </FadeInUp>
        </SimpleGrid>
      </Box>
    </DashboardLayout>
  );
}
