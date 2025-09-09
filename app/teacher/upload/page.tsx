"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, FileText, ImageIcon, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  preview?: string
}

export default function UploadWorksheetPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState("")
  const [progress, setProgress] = useState(0)
  const [conversionSettings, setConversionSettings] = useState({
    course: "",
    difficulty: "",
    questionTypes: "",
    instructions: "",
  })
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const router = useRouter()

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])

    selectedFiles.forEach((file) => {
      const fileId = Math.random().toString(36).substr(2, 9)
      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
      }

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, preview: e.target?.result as string } : f)))
        }
        reader.readAsDataURL(file)
      }

      setFiles((prev) => [...prev, uploadedFile])
    })
  }, [])

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleConvertToInteractive = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    setProgress(0)

    // Simulate AI processing steps
    const steps = [
      { message: "Analyzing uploaded files...", duration: 2000 },
      { message: "Extracting text and content...", duration: 3000 },
      { message: "Generating interactive questions...", duration: 4000 },
      { message: "Creating quiz structure...", duration: 2000 },
      { message: "Finalizing interactive worksheet...", duration: 1000 },
    ]

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i].message)
      setProgress(((i + 1) / steps.length) * 100)
      await new Promise((resolve) => setTimeout(resolve, steps[i].duration))
    }

    // Mock generated content
    const mockGeneratedContent = {
      title: "Interactive Math Worksheet: Fractions",
      description: "AI-generated interactive exercises based on your uploaded worksheet",
      questions: [
        {
          id: 1,
          type: "multiple-choice",
          question: "What is 1/2 + 1/4?",
          options: ["1/6", "2/6", "3/4", "1/8"],
          correct: "3/4",
        },
        {
          id: 2,
          type: "multiple-choice",
          question: "Which fraction is equivalent to 0.5?",
          options: ["1/3", "1/2", "2/3", "3/4"],
          correct: "1/2",
        },
        {
          id: 3,
          type: "short-answer",
          question: "Simplify the fraction 6/8",
          correct: "3/4",
        },
      ],
      estimatedTime: "15 minutes",
      difficulty: conversionSettings.difficulty || "Medium",
    }

    setGeneratedContent(mockGeneratedContent)
    setIsProcessing(false)
  }

  const handlePublishWorksheet = async () => {
    // Simulate publishing process
    setIsProcessing(true)
    setProcessingStep("Publishing worksheet...")

    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Redirect to course management or success page
    router.push("/teacher/dashboard?published=true")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teacher/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Upload & Convert Worksheet</h1>
            <p className="text-sm text-muted-foreground">Transform static worksheets into interactive exercises</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!generatedContent ? (
          <div className="space-y-8">
            {/* File Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Worksheet Files</CardTitle>
                <CardDescription>
                  Upload PDF files or images of worksheets to convert them into interactive exercises
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Drop files here or click to upload</h3>
                    <p className="text-muted-foreground mb-4">Supports PDF, PNG, JPG files up to 10MB each</p>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer bg-transparent">
                        Choose Files
                      </Button>
                    </Label>
                  </div>

                  {/* Uploaded Files */}
                  {files.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Uploaded Files ({files.length})</h4>
                      {files.map((file) => (
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
                          <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Conversion Settings */}
            {files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Settings</CardTitle>
                  <CardDescription>Configure how AI should convert your worksheet</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="course">Target Course</Label>
                      <Select
                        value={conversionSettings.course}
                        onValueChange={(value) => setConversionSettings((prev) => ({ ...prev, course: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="math-grade-5">Mathematics Grade 5</SelectItem>
                          <SelectItem value="science-grade-4">Science Grade 4</SelectItem>
                          <SelectItem value="english-lit">English Literature</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select
                        value={conversionSettings.difficulty}
                        onValueChange={(value) => setConversionSettings((prev) => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="questionTypes">Question Types</Label>
                      <Select
                        value={conversionSettings.questionTypes}
                        onValueChange={(value) => setConversionSettings((prev) => ({ ...prev, questionTypes: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select question types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mixed">Mixed (Multiple Choice + Short Answer)</SelectItem>
                          <SelectItem value="multiple-choice">Multiple Choice Only</SelectItem>
                          <SelectItem value="short-answer">Short Answer Only</SelectItem>
                          <SelectItem value="true-false">True/False Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                      <Textarea
                        id="instructions"
                        placeholder="Any specific requirements or focus areas for the AI conversion..."
                        value={conversionSettings.instructions}
                        onChange={(e) => setConversionSettings((prev) => ({ ...prev, instructions: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Convert Button */}
            {files.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  {isProcessing ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="font-medium">{processingStep}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        This may take a few minutes depending on the complexity of your worksheet...
                      </p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <h3 className="text-lg font-medium">Ready to Convert</h3>
                      <p className="text-muted-foreground">
                        AI will analyze your worksheet and create interactive questions
                      </p>
                      <Button size="lg" onClick={handleConvertToInteractive} className="px-8">
                        Convert to Interactive Worksheet
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Generated Content Preview */
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <CardTitle>Conversion Complete!</CardTitle>
                    <CardDescription>Your interactive worksheet has been generated</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{generatedContent.title}</h3>
                    <p className="text-muted-foreground">{generatedContent.description}</p>
                  </div>

                  <div className="flex gap-4 text-sm">
                    <Badge variant="secondary">{generatedContent.questions.length} Questions</Badge>
                    <Badge variant="secondary">{generatedContent.estimatedTime}</Badge>
                    <Badge variant="secondary">{generatedContent.difficulty}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Questions Preview</CardTitle>
                <CardDescription>Review the AI-generated questions before publishing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {generatedContent.questions.map((question: any, index: number) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium mb-2">{question.question}</p>
                          {question.type === "multiple-choice" && (
                            <div className="space-y-1">
                              {question.options.map((option: string, optIndex: number) => (
                                <div
                                  key={optIndex}
                                  className={`text-sm p-2 rounded ${
                                    option === question.correct ? "bg-green-100 text-green-800 font-medium" : "bg-muted"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                  {option === question.correct && " ✓"}
                                </div>
                              ))}
                            </div>
                          )}
                          {question.type === "short-answer" && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Correct answer: </span>
                              <span className="font-medium text-green-600">{question.correct}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Publish Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => setGeneratedContent(null)}>
                    Generate Again
                  </Button>
                  <Button onClick={handlePublishWorksheet} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish Worksheet"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
