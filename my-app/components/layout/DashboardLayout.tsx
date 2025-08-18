"use client";

import Link from "next/link";
import { ReactNode } from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Button,
  Spacer,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <Flex direction="column" minH="100vh">
      {/* Navbar */}
      <Flex
        as="nav"
        bg="gray.800"
        color="white"
        px={8}
        py={4}
        align="center"
        shadow="md"
      >
        <Heading size="md">PDF Toolkit</Heading>
        <Spacer />
        <HStack spacing={6}>
          <Link href="/">
            <Button variant="ghost" color="white">
              Dashboard
            </Button>
          </Link>
          <Link href="/compress">
            <Button variant="ghost" color="white">
              Compress
            </Button>
          </Link>
          <Link href="/convert">
            <Button variant="ghost" color="white">
              Convert
            </Button>
          </Link>
          <Link href="/merge">
            <Button variant="ghost" color="white">
              Merge
            </Button>
          </Link>
        </HStack>
      </Flex>

      {/* Animated Page Content */}
      <Box flex="1" p={8} overflow="hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname} // re-animate when path changes
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Flex>
  );
}
