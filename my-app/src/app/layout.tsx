"use client";

import { ChakraProvider, Box } from "@chakra-ui/react";
import "./globals.css";
import { SparklesCore } from "../../components/ui/Sparkles";
import ColorToggle from "../../components/ui/ColorToggle";
import { motion, AnimatePresence } from "framer-motion";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <Box position="relative" minH="100vh" overflow="hidden">
            {/* Toggle dark mode */}
            <Box position="absolute" top={4} right={4} zIndex={20}>
              {/* <ColorToggle /> */}
            </Box>

            {/* Background sparkles */}
            <Box
              position="absolute"
              top={0}
              left={0}
              height="100vh"
              width="200vw"
              zIndex={0}
            >
              <SparklesCore
                id="tsparticlesfullpage"
                background="transparent"
                minSize={0.6}
                maxSize={1.4}
                particleDensity={100}
                className="w-full h-full"
                particleColor="#ffffff"
              />
            </Box>

            {/* Page transition wrapper */}
            <AnimatePresence mode="wait">
              <motion.div
                key={typeof window !== "undefined" ? location.pathname : "page"}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                style={{ position: "relative", zIndex: 10 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </Box>
        </ChakraProvider>
      </body>
    </html>
  );
}
