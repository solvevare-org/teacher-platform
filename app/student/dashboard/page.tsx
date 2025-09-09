"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, CheckCircle, AlertCircle, Play, Settings, LogOut } from "lucide-react"
import Link from "next/link"

// Mock data for student dashboard
const mockStudent = {
  name: "Alice Johnson",
  id: "STU001",
  courses: [
    { id: 1, name: "Mathematics Grade 5", progress: 85, worksheets: 12, completed: 10, teacher: "Ms. Smith" },
    { id: 2, name: "Science Grade 4", progress: 72, worksheets: 8, completed: 6, teacher: "Mr. Davis" },
    { id: 3, name: "English Literature", progress: 94, worksheets: 15, completed: 14, teacher: "Mrs. Johnson" },
  ],
}

const mockRecentWorksheets = [
  {
    id: 1,
    title: "Fractions and Decimals",
    course: "Mathematics Grade 5",
    score: 88,
    status: "completed",
    dueDate: "2 days ago",
  },
  { id: 2, title: "Plant Biology", course: "Science Grade 4", score: null, status: "in-progress", dueDate: "Tomorrow" },
  {
    id: 3,
    title: "Poetry Analysis",
    course: "English Literature",
    score: 95,
    status: "completed",
    dueDate: "1 week ago",
  },
  { id: 4, title: "Geometry Basics", course: "Mathematics Grade 5", score: null, status: "pending", dueDate: "3 days" },
]

const mockUpcoming = [
  { id: 1, title: "Chemical Reactions", course: "Science Grade 4", dueDate: "Tomorrow", type: "Quiz" },
  { id: 2, title: "Essay Writing", course: "English Literature", dueDate: "Friday", type: "Assignment" },
  { id: 3, title: "Word Problems", course: "Mathematics Grade 5", dueDate: "Next Monday", type: "Practice" },
]

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-gray-400" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            In Progress
          </Badge>
        )
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">EduWorksheet</h1>
            <Badge variant="secondary" className="ml-2">
              Student
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Welcome, {mockStudent.name}</span>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back, {mockStudent.name}!</h2>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="worksheets">Worksheets</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStudent.courses.length}</div>
                  <p className="text-xs text-muted-foreground">Active learning</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Worksheets</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">30</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Badge variant="secondary">87%</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Excellent</div>
                  <p className="text-xs text-muted-foreground">Keep it up!</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Worksheets</CardTitle>
                  <CardDescription>Your latest worksheet activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRecentWorksheets.slice(0, 3).map((worksheet) => (
                      <div key={worksheet.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(worksheet.status)}
                          <div>
                            <p className="font-medium text-sm">{worksheet.title}</p>
                            <p className="text-xs text-muted-foreground">{worksheet.course}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {worksheet.score && <p className="text-sm font-medium">{worksheet.score}%</p>}
                          <p className="text-xs text-muted-foreground">{worksheet.dueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Assignments</CardTitle>
                  <CardDescription>Don't miss these deadlines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockUpcoming.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.course}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{item.dueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <h3 className="text-2xl font-bold">My Courses</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockStudent.courses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription>Teacher: {course.teacher}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completed:</span>
                        <span className="font-medium">
                          {course.completed}/{course.worksheets} worksheets
                        </span>
                      </div>

                      <Button className="w-full" asChild>
                        <Link href={`/student/courses/${course.id}`}>Enter Course</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="worksheets" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">All Worksheets</h3>
            </div>

            <div className="space-y-4">
              {mockRecentWorksheets.map((worksheet) => (
                <Card key={worksheet.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(worksheet.status)}
                        <div>
                          <h4 className="font-medium">{worksheet.title}</h4>
                          <p className="text-sm text-muted-foreground">{worksheet.course}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(worksheet.status)}
                        {worksheet.score && <Badge variant="secondary">{worksheet.score}%</Badge>}
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{worksheet.dueDate}</p>
                        </div>
                        {worksheet.status !== "completed" && (
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            {worksheet.status === "in-progress" ? "Continue" : "Start"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <h3 className="text-2xl font-bold">Learning Progress</h3>

            <div className="grid gap-6">
              {mockStudent.courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription>Detailed progress breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Overall Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-3" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Completed Worksheets:</span>
                          <p className="font-medium">
                            {course.completed} of {course.worksheets}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Remaining:</span>
                          <p className="font-medium">{course.worksheets - course.completed} worksheets</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
