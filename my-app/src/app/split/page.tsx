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
  HStack,
  Input,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FileUploader from "@/components/ui/FileUploader";
import PdfPreview from "@/components/ui/PDFPreview";
import usePdfAction from "@/hooks/usePdfAction";
import { FadeInUp, ScaleIn } from "@/components/ui/animations";

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState("range");
  const [from, setFrom] = useState("1");
  const [to, setTo] = useState("");
  const { handlePdfAction, loading } = usePdfAction("split", "PDF split!");
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

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
            bg={isDark ? "orange.900" : "orange.50"}
            color={isDark ? "orange.100" : "orange.700"}
            border="1px solid"
            borderColor={isDark ? "orange.700" : "orange.100"}
          >
            <Box w={2} h={2} rounded="full" bg={isDark ? "orange.200" : "orange.500"} />
            Split tool
          </Badge>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
          <Box gridColumn={{ lg: "span 2" }} display="flex" flexDirection="column" gap={6}>
            <FadeInUp>
              <Box>
                <Heading size="lg" color={isDark ? "white" : "gray.900"}>
                  Split PDF
                </Heading>
                <Text mt={2} fontSize="sm" color={isDark ? "gray.200" : "gray.500"}>
                  Extract pages from a PDF or split it into multiple smaller files.
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
                <FileUploader onFileAccepted={setFile} />
                <Text mt={2} fontSize="xs" textAlign="center" color={isDark ? "gray.400" : "gray.400"}>
                  Upload a PDF to split
                </Text>
                <PdfPreview file={file} />
              </Box>
            </ScaleIn>

            <FadeInUp delay={0.08}>
              <HStack spacing={4} align="flex-end" flexWrap="wrap">
                <Box>
                  <FormLabel fontSize="sm" mb={1}>Split mode</FormLabel>
                  <Select size="sm" value={mode} onChange={(e) => setMode(e.target.value)} w="56">
                    <option value="range">Extract page range (one PDF)</option>
                    <option value="pages">Every page separately (ZIP)</option>
                  </Select>
                </Box>
                {mode === "range" && (
                  <>
                    <Box>
                      <FormLabel fontSize="sm" mb={1}>From page</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        min={1}
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        w="28"
                      />
                    </Box>
                    <Box>
                      <FormLabel fontSize="sm" mb={1}>To page</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        min={1}
                        placeholder="last"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        w="28"
                      />
                    </Box>
                  </>
                )}
              </HStack>
            </FadeInUp>

            <FadeInUp delay={0.1}>
              <Button
                onClick={() =>
                  handlePdfAction(file, "split", {
                    mode,
                    from: from || "1",
                    ...(to ? { to } : {}),
                  })
                }
                colorScheme="orange"
                isDisabled={!file || loading}
                isLoading={loading}
                alignSelf={{ base: "stretch", sm: "flex-start" }}
              >
                Split
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
                Range mode extracts the selected pages into one PDF (leave &quot;To page&quot; empty
                for everything through the end). Every-page mode gives you a ZIP with one PDF
                per page.
              </Text>
            </Box>
          </FadeInUp>
        </SimpleGrid>
      </Box>
    </DashboardLayout>
  );
}
