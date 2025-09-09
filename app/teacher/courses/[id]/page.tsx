"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Users, FileText, Plus, Search, MoreVertical, Upload, Settings } from "lucide-react"
import Link from "next/link"

// Mock data
const mockCourse = {
  id: 1,
  name: "Mathematics Grade 5",
  subject: "Mathematics",
  grade: "5",
  description: "Comprehensive mathematics course covering algebra, geometry, and problem-solving skills.",
  students: 24,
  worksheets: 12,
  active: true,
}

const mockStudents = [
  { id: 1, name: "Alice Johnson", email: "alice@school.edu", progress: 85, lastActive: "2 hours ago" },
  { id: 2, name: "Bob Smith", email: "bob@school.edu", progress: 72, lastActive: "1 day ago" },
  { id: 3, name: "Carol Davis", email: "carol@school.edu", progress: 94, lastActive: "30 minutes ago" },
]

const mockWorksheets = [
  { id: 1, title: "Fractions and Decimals", type: "Quiz", students: 18, avgScore: 78, created: "2 days ago" },
  { id: 2, title: "Geometry Basics", type: "Exercise", students: 22, avgScore: 85, created: "1 week ago" },
  { id: 3, title: "Word Problems", type: "Practice", students: 15, avgScore: 71, created: "3 days ago" },
]

export default function CourseDetailPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/teacher/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{mockCourse.name}</h1>
              <p className="text-sm text-muted-foreground">
                {mockCourse.subject} • Grade {mockCourse.grade}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={mockCourse.active ? "default" : "secondary"}>
              {mockCourse.active ? "Active" : "Inactive"}
            </Badge>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students ({mockStudents.length})</TabsTrigger>
            <TabsTrigger value="worksheets">Worksheets ({mockWorksheets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Course Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockCourse.students}</div>
                  <p className="text-xs text-muted-foreground">Active learners</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Worksheets</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockCourse.worksheets}</div>
                  <p className="text-xs text-muted-foreground">Interactive exercises</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                  <Badge variant="secondary">78%</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Good</div>
                  <p className="text-xs text-muted-foreground">Class performance</p>
                </CardContent>
              </Card>
            </div>

            {/* Course Description */}
            <Card>
              <CardHeader>
                <CardTitle>Course Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{mockCourse.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>Manage student access and track their progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{student.progress}% Complete</p>
                          <p className="text-xs text-muted-foreground">Last active: {student.lastActive}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="worksheets" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Course Worksheets</h3>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload New Worksheet
              </Button>
            </div>

            <div className="grid gap-4">
              {mockWorksheets.map((worksheet) => (
                <Card key={worksheet.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{worksheet.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Type: {worksheet.type}</span>
                            <span>•</span>
                            <span>{worksheet.students} students completed</span>
                            <span>•</span>
                            <span>Avg score: {worksheet.avgScore}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{worksheet.created}</span>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
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
