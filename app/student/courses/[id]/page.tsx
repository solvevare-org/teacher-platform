"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Play, CheckCircle, Clock, FileText, Award } from "lucide-react"
import Link from "next/link"

// Mock data for course detail
const mockCourse = {
  id: 1,
  name: "Mathematics Grade 5",
  teacher: "Ms. Smith",
  description: "Comprehensive mathematics course covering algebra, geometry, and problem-solving skills.",
  progress: 85,
  totalWorksheets: 12,
  completedWorksheets: 10,
}

const mockWorksheets = [
  { id: 1, title: "Basic Addition", status: "completed", score: 95, type: "Practice", difficulty: "Easy" },
  { id: 2, title: "Subtraction Skills", status: "completed", score: 88, type: "Quiz", difficulty: "Easy" },
  { id: 3, title: "Multiplication Tables", status: "completed", score: 92, type: "Practice", difficulty: "Medium" },
  { id: 4, title: "Division Basics", status: "completed", score: 85, type: "Exercise", difficulty: "Medium" },
  { id: 5, title: "Fractions Introduction", status: "completed", score: 78, type: "Quiz", difficulty: "Medium" },
  { id: 6, title: "Decimal Numbers", status: "completed", score: 90, type: "Practice", difficulty: "Medium" },
  { id: 7, title: "Geometry Shapes", status: "completed", score: 87, type: "Exercise", difficulty: "Easy" },
  { id: 8, title: "Area and Perimeter", status: "completed", score: 83, type: "Quiz", difficulty: "Hard" },
  { id: 9, title: "Word Problems", status: "completed", score: 79, type: "Practice", difficulty: "Hard" },
  { id: 10, title: "Advanced Fractions", status: "completed", score: 91, type: "Exercise", difficulty: "Hard" },
  { id: 11, title: "Algebraic Thinking", status: "in-progress", score: null, type: "Quiz", difficulty: "Hard" },
  { id: 12, title: "Final Assessment", status: "locked", score: null, type: "Test", difficulty: "Hard" },
]

export default function StudentCoursePage() {
  const [selectedWorksheet, setSelectedWorksheet] = useState<number | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "locked":
        return <div className="h-5 w-5 rounded-full bg-gray-300" />
      default:
        return <FileText className="h-5 w-5 text-gray-400" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{mockCourse.name}</h1>
              <p className="text-sm text-muted-foreground">Teacher: {mockCourse.teacher}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {mockCourse.progress}% Complete
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Course Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Course Progress
            </CardTitle>
            <CardDescription>{mockCourse.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{mockCourse.progress}%</span>
                </div>
                <Progress value={mockCourse.progress} className="h-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-primary">{mockCourse.completedWorksheets}</p>
                  <p className="text-muted-foreground">Completed</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">1</p>
                  <p className="text-muted-foreground">In Progress</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-gray-500">1</p>
                  <p className="text-muted-foreground">Remaining</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Worksheets List */}
        <Card>
          <CardHeader>
            <CardTitle>Course Worksheets</CardTitle>
            <CardDescription>Complete worksheets to progress through the course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockWorksheets.map((worksheet, index) => (
                <div
                  key={worksheet.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    worksheet.status === "locked"
                      ? "bg-gray-50 border-gray-200"
                      : "hover:bg-muted cursor-pointer border-border"
                  }`}
                  onClick={() => worksheet.status !== "locked" && setSelectedWorksheet(worksheet.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </div>
                    {getStatusIcon(worksheet.status)}
                    <div>
                      <h4 className={`font-medium ${worksheet.status === "locked" ? "text-gray-400" : ""}`}>
                        {worksheet.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {worksheet.type}
                        </Badge>
                        <Badge variant="secondary" className={`text-xs ${getDifficultyColor(worksheet.difficulty)}`}>
                          {worksheet.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {worksheet.score && (
                      <div className="text-right">
                        <p className={`font-bold ${getScoreColor(worksheet.score)}`}>{worksheet.score}%</p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                    )}

                    {worksheet.status === "completed" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/student/worksheet/${worksheet.id}`}>Review</Link>
                      </Button>
                    )}

                    {worksheet.status === "in-progress" && (
                      <Button size="sm" asChild>
                        <Link href={`/student/worksheet/${worksheet.id}`}>
                          <Play className="h-4 w-4 mr-2" />
                          Continue
                        </Link>
                      </Button>
                    )}

                    {worksheet.status === "locked" && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                        Locked
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
