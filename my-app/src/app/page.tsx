"use client";

import Link from "next/link";
import { VStack, Heading, Button, Text } from "@chakra-ui/react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function HomePage() {
  return (
    <DashboardLayout>
      <VStack spacing={8}>
        <Heading>PDF Tools Dashboard</Heading>
        <Text>Select a tool to get started:</Text>

        <VStack spacing={4}>
          <Link href="/compress">
            <Button colorScheme="teal" width="200px">
              Compress PDF
            </Button>
          </Link>

          <Link href="/convert">
            <Button colorScheme="blue" width="200px">
              Convert PDF
            </Button>
          </Link>

          <Link href="/merge">
            <Button colorScheme="purple" width="200px">
              Merge PDFs
            </Button>
          </Link>
        </VStack>
      </VStack>
    </DashboardLayout>
  );
}
