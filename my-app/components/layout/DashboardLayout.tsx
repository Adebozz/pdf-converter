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
  IconButton,
  VStack,
  Collapse,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/compress", label: "Compress" },
    { href: "/convert", label: "Convert" },
    { href: "/merge", label: "Merge" },
  ];

  return (
    <Flex direction="column" minH="100vh">
      {/* Navbar */}
      <Flex
        as="nav"
        bg="gray.800"
        color="white"
        px={6}
        py={4}
        align="center"
        shadow="md"
      >
        <Heading size="md">PDF Toolkit</Heading>
        <Spacer />

        {/* Desktop Nav */}
        <HStack spacing={6} display={{ base: "none", md: "flex" }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={pathname === link.href ? "solid" : "ghost"}
                colorScheme="teal"
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </HStack>

        {/* Right Side Controls */}
        <HStack spacing={2}>
          {/* Color Mode Toggle (always visible, not duplicated) */}
          <IconButton
            aria-label="Toggle Color Mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="outline"
            color="white"
            borderColor="white"
          />

          {/* Mobile Menu Button */}
          <IconButton
            aria-label="Toggle Menu"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            display={{ base: "flex", md: "none" }}
            onClick={onToggle}
            variant="outline"
            color="white"
            borderColor="white"
          />
        </HStack>
      </Flex>

      {/* Mobile Menu */}
      <Collapse in={isOpen} animateOpacity>
        <VStack
          bg="gray.700"
          color="white"
          spacing={4}
          px={6}
          py={4}
          display={{ md: "none" }}
          align="stretch"
        >
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                w="full"
                variant={pathname === link.href ? "solid" : "ghost"}
                colorScheme="teal"
                onClick={onToggle}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </VStack>
      </Collapse>

      {/* Animated Page Content */}
      <Box flex="1" p={8} overflow="hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
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
