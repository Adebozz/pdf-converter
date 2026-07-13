import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Box, Text, useToast } from '@chakra-ui/react'

interface FileUploaderProps {
  onFileAccepted?: (file: File) => void
  onFilesAccepted?: (files: File[]) => void
  multiple?: boolean
}

export default function FileUploader({ onFileAccepted, onFilesAccepted, multiple = false }: FileUploaderProps) {
  const toast = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfs = acceptedFiles.filter((f) => f.type === 'application/pdf')
    if (pdfs.length === 0) {
      toast({
        title: 'Only PDF files are allowed.',
        status: 'error',
        duration: 3000,
      })
      return
    }
    if (multiple) {
      onFilesAccepted?.(pdfs)
    } else {
      onFileAccepted?.(pdfs[0])
    }
  }, [onFileAccepted, onFilesAccepted, multiple, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': [] },
    multiple,
  })

  return (
    <Box
      {...getRootProps()}
      border="2px dashed"
      borderColor={isDragActive ? 'teal.500' : 'gray.300'}
      borderRadius="md"
      p={10}
      textAlign="center"
      cursor="pointer"
      bg={isDragActive ? 'teal.50' : 'white'}
      _dark={{ bg: isDragActive ? 'teal.900' : 'gray.800' }}
    >
      <input {...getInputProps()} />
      <Text fontSize="lg">
        {isDragActive
          ? `Drop the PDF${multiple ? 's' : ''} here...`
          : `Drag & drop ${multiple ? 'PDFs' : 'a PDF'} here, or click to browse`}
      </Text>
    </Box>
  )
}
