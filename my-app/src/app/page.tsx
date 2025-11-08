"use client";

import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  VStack,
  useColorMode,
  Flex,
} from "@chakra-ui/react";
import Link from "next/link";
import { FadeInUp, ScaleIn } from "@/components/ui/animations";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FaCompress, FaFilePdf, FaLayerGroup, FaSearch, FaLock } from "react-icons/fa";

export default function DashboardPage() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <DashboardLayout>
      <Box maxW="6xl" mx="auto" px={4} py={20} textAlign="center">
        <FadeInUp>
          <Heading
            size="2xl"
            color={isDark ? "white" : "gray.800"}
            fontWeight="bold"
          >
            Welcome to PDF Toolkit
          </Heading>
          <Text
            mt={4}
            fontSize="lg"
            color={isDark ? "gray.300" : "gray.600"}
            maxW="3xl"
            mx="auto"
          >
            A powerful all-in-one platform to manage, compress, convert, and secure your PDF
            documents — right in your browser.
          </Text>
        </FadeInUp>

        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3 }}
          spacing={8}
          mt={16}
          justifyItems="center"
        >
          {/* Compress */}
          <ScaleIn delay={0.1}>
            <FeatureCard
              icon={<FaCompress size="28" />}
              title="Compress PDF"
              desc="Reduce file size for faster sharing and uploading."
              href="/compress"
              colorScheme="teal"
            />
          </ScaleIn>

          {/* Convert */}
          <ScaleIn delay={0.15}>
            <FeatureCard
              icon={<FaFilePdf size="28" />}
              title="Convert PDF"
              desc="Convert PDFs into other formats and vice versa."
              href="/convert"
              colorScheme="purple"
            />
          </ScaleIn>

          {/* Merge */}
          <ScaleIn delay={0.2}>
            <FeatureCard
              icon={<FaLayerGroup size="28" />}
              title="Merge PDFs"
              desc="Combine multiple PDFs into one organized file."
              href="/merge"
              colorScheme="blue"
            />
          </ScaleIn>

          {/* Split */}
          <ScaleIn delay={0.25}>
            <FeatureCard
              icon={<FaLayerGroup size="28" />}
              title="Split PDF"
              desc="Extract specific pages or sections into new files."
              href="/split"
              colorScheme="orange"
            />
          </ScaleIn>

          {/* OCR */}
          <ScaleIn delay={0.3}>
            <FeatureCard
              icon={<FaSearch size="28" />}
              title="OCR & Extract"
              desc="Recognize and extract text from scanned documents."
              href="/ocr"
              colorScheme="pink"
            />
          </ScaleIn>

          {/* Secure */}
          <ScaleIn delay={0.35}>
            <FeatureCard
              icon={<FaLock size="28" />}
              title="Secure PDF"
              desc="Add password protection to keep your documents safe."
              href="/protect"
              colorScheme="green"
            />
          </ScaleIn>
        </SimpleGrid>

        <FadeInUp delay={0.45}>
          <VStack mt={20} spacing={4}>
            <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>
              Need a quick action?
            </Text>
            <Link href="/compress">
              <Button colorScheme="teal" size="lg">
                Start with Compress
              </Button>
            </Link>
          </VStack>
        </FadeInUp>
      </Box>
    </DashboardLayout>
  );
}

// ✅ Reusable feature card
function FeatureCard({
  icon,
  title,
  desc,
  href,
  colorScheme,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
  colorScheme: string;
}) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Link href={href}>
      <Box
        w="100%"
        maxW="sm"
        bg={isDark ? "whiteAlpha.100" : "white"}
        borderWidth="1px"
        borderColor={isDark ? "whiteAlpha.200" : "gray.200"}
        rounded="xl"
        p={6}
        textAlign="center"
        transition="all 0.2s ease"
        _hover={{
          transform: "translateY(-5px)",
          shadow: isDark ? "xl" : "md",
          borderColor: `${colorScheme}.400`,
        }}
      >
        <Flex
          align="center"
          justify="center"
          bg={`${colorScheme}.500`}
          color="white"
          rounded="full"
          w={12}
          h={12}
          mx="auto"
          mb={4}
        >
          {icon}
        </Flex>
        <Heading size="md" mb={2} color={isDark ? "white" : "gray.800"}>
          {title}
        </Heading>
        <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>
          {desc}
        </Text>
      </Box>
    </Link>
  );
}
