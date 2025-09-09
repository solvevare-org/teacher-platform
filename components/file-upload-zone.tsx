"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, ImageIcon, X, CheckCircle, AlertCircle } from "lucide-react"

interface FileUploadZoneProps {
  onFilesUploaded: (files: any[]) => void
  maxFiles?: number
  maxSize?: number
  acceptedTypes?: string[]
}

export function FileUploadZone({
  onFilesUploaded,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = [".pdf", ".png", ".jpg", ".jpeg"],
}: FileUploadZoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      setIsUploading(true)
      setUploadProgress(0)

      try {
        const formData = new FormData()
        acceptedFiles.forEach((file) => {
          formData.append("files", file)
        })

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 200)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://31.97.41.27:4002';
        const getApiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;

        const response = await fetch(getApiUrl("/api/upload-file"), {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        if (response.ok) {
          const result = await response.json()
          setUploadedFiles(result.files)
          onFilesUploaded(result.files)
        } else {
          throw new Error("Upload failed")
        }
      } catch (error) {
        console.error("Upload error:", error)
      } finally {
        setIsUploading(false)
        setTimeout(() => setUploadProgress(0), 1000)
      }
    },
    [onFilesUploaded],
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
  })

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter((f) => f.id !== fileId)
    setUploadedFiles(updatedFiles)
    onFilesUploaded(updatedFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {isDragActive ? "Drop files here" : "Drop files here or click to upload"}
        </h3>
        <p className="text-muted-foreground mb-4">Supports PDF, PNG, JPG files up to {formatFileSize(maxSize)} each</p>
        <Button variant="outline" type="button">
          Choose Files
        </Button>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading files...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>
                {file.name}: {errors[0]?.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Uploaded Files ({uploadedFiles.length})</h4>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex-shrink-0">
                {file.type.startsWith("image/") ? (
                  <ImageIcon className="h-8 w-8 text-blue-500" />
                ) : (
                  <FileText className="h-8 w-8 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
