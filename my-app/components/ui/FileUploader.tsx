import { useCallback } from 'react'
import { useDropzone, Accept, FileRejection } from 'react-dropzone'
import { Box, Text, useToast } from '@chakra-ui/react'

const PDF_ONLY: Accept = { 'application/pdf': [] }

interface FileUploaderProps {
  onFileAccepted?: (file: File) => void
  onFilesAccepted?: (files: File[]) => void
  multiple?: boolean
  accept?: Accept
  label?: string
}

export default function FileUploader({
  onFileAccepted,
  onFilesAccepted,
  multiple = false,
  accept = PDF_ONLY,
  label,
}: FileUploaderProps) {
  const toast = useToast()

  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      if (acceptedFiles.length === 0) {
        if (rejections.length > 0) {
          toast({
            title: 'File type not allowed.',
            status: 'error',
            duration: 3000,
          })
        }
        return
      }
      if (multiple) {
        onFilesAccepted?.(acceptedFiles)
      } else {
        onFileAccepted?.(acceptedFiles[0])
      }
    },
    [onFileAccepted, onFilesAccepted, multiple, toast]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
  })

  const idleLabel =
    label ?? `Drag & drop ${multiple ? 'PDFs' : 'a PDF'} here, or click to browse`

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
      <Text fontSize="lg">{isDragActive ? 'Drop the file here...' : idleLabel}</Text>
    </Box>
  )
}
