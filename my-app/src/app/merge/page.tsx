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
import usePdfAction from "@/hooks/usePdfAction";
import { FadeInUp, ScaleIn } from "@/components/ui/animations";

export default function MergePage() {
  const [file, setFile] = useState<File | null>(null);
  const { handlePdfAction, loading } = usePdfAction("merge", "PDFs merged!");
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
                  Combine multiple PDFs into a single file. (You can adjust the backend later to
                  accept multiple files.)
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
                  Upload a PDF to merge
                </Text>
              </Box>
            </ScaleIn>

            <FadeInUp delay={0.1}>
              <Button
                onClick={() => handlePdfAction(file, "merged")}
                colorScheme="blue"
                isDisabled={!file || loading}
                isLoading={loading}
                alignSelf={{ base: "stretch", sm: "flex-start" }}
              >
                Merge
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
                This will return a single PDF that combines your uploaded document(s). To support
                multiple files, extend the FileUploader and API to accept an array.
              </Text>
            </Box>
          </FadeInUp>
        </SimpleGrid>
      </Box>
    </DashboardLayout>
  );
}
