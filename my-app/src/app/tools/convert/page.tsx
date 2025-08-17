"use client";

import { useState } from 'react'
import {
  Box,
  Button,
  Heading,
  useToast,
  VStack,
  useColorMode,
} from '@chakra-ui/react'
import FileUploader from '../../components/ui/FileUploader'
import { SparklesCore } from '../../components/ui/Sparkles'
import ColorToggle from '../../components/ui/ColorToggle'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const toast = useToast()
  const { colorMode } = useColorMode() // Detect current theme

  const handleConvert = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/convert', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      toast({ title: 'PDF converted!', status: 'success' })
    } else {
      toast({ title: 'Conversion failed.', status: 'error' })
    }
  }

  return (
    <Box position="relative" minH="100vh" overflow="hidden">
      {/* Toggle dark mode */}
      <Box position="absolute" top={4} right={4} zIndex={20}>
        <ColorToggle />
      </Box>

      {/* Background sparkles */}
      <Box position="absolute" top={0} left={0} height="100vh" width="200vw" zIndex={0}>
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor={colorMode === 'dark' ? '#FFFFFF' : '#000000'}
        />
      </Box>

      {/* Foreground content */}
      <Box
        position="relative"
        zIndex={10}
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="100vh"
        px={4}
      >
        <VStack spacing={6} textAlign="center">
          <Heading color={colorMode === 'dark' ? 'white' : 'gray.800'}>
            PDF Converter
          </Heading>
          <FileUploader onFileAccepted={setFile} />
          <Button
            onClick={handleConvert}
            colorScheme="teal"
            isDisabled={!file}
          >
            Convert PDF
          </Button>
        </VStack>
      </Box>
    </Box>
  )
}
