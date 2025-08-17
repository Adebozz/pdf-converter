import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Box, Text, useToast } from '@chakra-ui/react'

export default function FileUploader({ onFileAccepted }: { onFileAccepted: (file: File) => void }) {
  const toast = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type === 'application/pdf') {
      onFileAccepted(file)
    } else {
      toast({
        title: 'Only PDF files are allowed.',
        status: 'error',
        duration: 3000,
      })
    }
  }, [onFileAccepted, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': [] } })

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
        {isDragActive ? 'Drop the PDF here...' : 'Drag & drop a PDF here, or click to browse'}
      </Text>
    </Box>
  )
}
