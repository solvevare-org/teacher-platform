"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

// Mock worksheet data
const mockWorksheet = {
  id: 11,
  title: "Algebraic Thinking",
  course: "Mathematics Grade 5",
  type: "Quiz",
  difficulty: "Hard",
  timeLimit: 30, // minutes
  totalQuestions: 5,
  description: "Test your understanding of basic algebraic concepts and problem-solving skills.",
}

const mockQuestions = [
  {
    id: 1,
    question: "If x + 5 = 12, what is the value of x?",
    options: ["5", "7", "17", "12"],
    correctAnswer: "7",
    explanation: "To solve x + 5 = 12, subtract 5 from both sides: x = 12 - 5 = 7",
  },
  {
    id: 2,
    question: "What is 3 × (4 + 2)?",
    options: ["14", "18", "12", "24"],
    correctAnswer: "18",
    explanation: "Following order of operations: 3 × (4 + 2) = 3 × 6 = 18",
  },
  {
    id: 3,
    question: "If y = 2x + 3 and x = 4, what is y?",
    options: ["11", "9", "8", "10"],
    correctAnswer: "11",
    explanation: "Substitute x = 4 into y = 2x + 3: y = 2(4) + 3 = 8 + 3 = 11",
  },
  {
    id: 4,
    question: "Simplify: 2a + 3a",
    options: ["5a", "6a", "2a", "3a"],
    correctAnswer: "5a",
    explanation: "Combine like terms: 2a + 3a = (2 + 3)a = 5a",
  },
  {
    id: 5,
    question: "What is the next number in the pattern: 2, 5, 8, 11, ?",
    options: ["13", "14", "15", "16"],
    correctAnswer: "14",
    explanation: "The pattern increases by 3 each time: 2 + 3 = 5, 5 + 3 = 8, 8 + 3 = 11, 11 + 3 = 14",
  },
]

export default function WorksheetPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(25 * 60) // 25 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    setShowResults(true)
  }

  const calculateScore = () => {
    let correct = 0
    mockQuestions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / mockQuestions.length) * 100)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const currentQ = mockQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100

  if (showResults) {
    const score = calculateScore()
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student/courses/1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Quiz Results</h1>
              <p className="text-sm text-muted-foreground">{mockWorksheet.title}</p>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {score >= 80 ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : (
                  <AlertCircle className="h-16 w-16 text-yellow-500" />
                )}
              </div>
              <CardTitle className="text-3xl">{score >= 80 ? "Great Job!" : "Good Effort!"}</CardTitle>
              <CardDescription>
                You scored {score}% on {mockWorksheet.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-primary">{score}%</div>
                <p className="text-muted-foreground">
                  You got {mockQuestions.filter((q) => answers[q.id] === q.correctAnswer).length} out of{" "}
                  {mockQuestions.length} questions correct
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild>
                    <Link href="/student/courses/1">Continue Course</Link>
                  </Button>
                  <Button variant="outline" onClick={() => setShowResults(false)}>
                    Review Answers
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student/courses/1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{mockWorksheet.title}</h1>
              <p className="text-sm text-muted-foreground">{mockWorksheet.course}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
            <Badge variant="secondary">
              Question {currentQuestion + 1} of {mockQuestions.length}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Question {currentQuestion + 1}</CardTitle>
            <CardDescription className="text-base font-medium">{currentQ.question}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQ.id] || ""}
              onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
            Previous
          </Button>

          <div className="flex gap-2">
            {currentQuestion === mockQuestions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={!answers[currentQ.id]}>
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!answers[currentQ.id]}>
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
