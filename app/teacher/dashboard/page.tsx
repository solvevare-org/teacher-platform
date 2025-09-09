"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Users, FileText, BarChart3, Plus, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import dynamic from 'next/dynamic';

const TeacherChatInterface = dynamic(() => import('@/components/teacher-chat-interface'), { ssr: false });

// Remove mock courses; keep recent activity (static)
const mockRecentActivity = [
  { id: 1, action: "New worksheet uploaded", course: "Mathematics Grade 5", time: "2 hours ago" },
  { id: 2, action: "Student completed quiz", course: "Science Grade 4", time: "4 hours ago" },
  { id: 3, action: "Course created", course: "English Literature", time: "1 day ago" },
]

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [courses, setCourses] = useState<any[]>([])
  const [stats, setStats] = useState({ totalCourses: 0, activeCourses: 0, totalStudents: 0, worksheets: 0, completionRate: null as number | null })
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    grade: "",
    status: "active"
  })
  const [isAddingStudent, setIsAddingStudent] = useState(false)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3004';
  const getApiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`
  useEffect(() => {
    // Client guard: allow when token exists; derive teacherId from token/localStorage
    try {
      const token = localStorage.getItem('auth_token') || ''
      if (!token) {
        window.location.href = '/auth/login'
        return
      }
      let teacherId = localStorage.getItem('teacherId') || ''
      try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''))
        const derivedId = payload?.sub || payload?.id || payload?.teacherId
        if (derivedId) teacherId = String(derivedId)
      } catch {}
      if (teacherId) {
        localStorage.setItem('teacherId', teacherId)
        // Fetch courses for this teacher
        fetch(getApiUrl(`/api/courses?teacherId=${encodeURIComponent(teacherId)}`), {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        })
          .then(r => r.json())
          .then(d => {
            const list = Array.isArray(d?.courses) ? d.courses : []
            setCourses(list)
            const totalCourses = list.length
            const activeCourses = list.filter((c: any) => (c?.active === true) || (String(c?.status).toLowerCase() === 'active')).length
            // Aggregate unique students from courses if available; otherwise fall back to /users length
            const aggregated = new Set<string>()
            for (const c of list) {
              const arr = Array.isArray(c?.students) ? c.students : []
              for (const s of arr) {
                const email = typeof s === 'string' ? s : (s?.email)
                if (email) aggregated.add(String(email))
              }
            }
            const baseStats = { totalCourses, activeCourses, totalStudents: aggregated.size, worksheets: 0, completionRate: null as number | null }
            setStats(baseStats)
            if (aggregated.size === 0) {
              const studentsPath = `/api/students${teacherId ? `?teacherId=${encodeURIComponent(teacherId)}` : ''}`
              fetch(getApiUrl(studentsPath), { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json())
                .then(u => setStats(prev => ({ ...prev, totalStudents: Array.isArray(u?.users) ? u.users.length : 0 })))
                .catch(() => {})
            }
            // Try to get worksheets/quizzes count
            fetch(getApiUrl(`/api/quizzes?teacherId=${encodeURIComponent(teacherId)}`), { headers: { Authorization: `Bearer ${token}` } })
              .then(r => r.ok ? r.json() : Promise.reject())
              .then(q => setStats(prev => ({ ...prev, worksheets: Array.isArray(q?.quizzes) ? q.quizzes.length : (Array.isArray(q) ? q.length : 0) })))
              .catch(() => {})
          })
          .catch(() => setCourses([]))
      }
      // No role enforcement here; server will authorize per-route
    } catch {
      window.location.href = '/auth/login'
    }
  }, [])

  const handleAddStudent = async () => {
    if (!studentForm.firstName || !studentForm.lastName || !studentForm.email) {
      alert('Please fill in all required fields')
      return
    }
    
    setIsAddingStudent(true)
    try {
      const token = localStorage.getItem('auth_token') || ''
      const res = await fetch(getApiUrl('/api/students'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          firstName: studentForm.firstName,
          lastName: studentForm.lastName,
          email: studentForm.email,
          grade: studentForm.grade,
          status: studentForm.status,
          role: 'student'
        }),
      })
      
      const data = await res.json()
      if (res.ok) {
        alert('Student added successfully!')
        setStudentForm({ firstName: "", lastName: "", email: "", grade: "", status: "active" })
        setShowAddStudent(false)
        // Refresh stats
        window.location.reload()
      } else {
        alert(data?.error || 'Failed to add student')
      }
    } catch (error) {
      alert('Network error adding student')
    } finally {
      setIsAddingStudent(false)
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
              Teacher
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => alert('Settings functionality - connect to your external API')}>
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
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back, Teacher!</h2>
          <p className="text-muted-foreground">Manage your courses and track student progress</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCourses}</div>
                  <p className="text-xs text-muted-foreground">{stats.activeCourses} active courses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">{stats.totalStudents > 0 ? '—' : 'No students yet'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Worksheets Created</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.worksheets}</div>
                  <p className="text-xs text-muted-foreground">{stats.worksheets > 0 ? '—' : 'No worksheets yet'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completionRate !== null ? `${stats.completionRate}%` : '—'}</div>
                  <p className="text-xs text-muted-foreground">{stats.completionRate !== null ? 'Last 7 days' : 'Not available'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.course}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">My Courses</h3>
              <Button asChild>
                <Link href="/teacher/courses/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="py-8 text-center text-muted-foreground">No courses yet.</CardContent>
                </Card>
              )}
              {courses.map((course: any) => (
                <Card key={course._id || course.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{course.name || course.title || 'Untitled course'}</CardTitle>
                      {(() => { const isActive = (course?.active === true) || (String(course?.status).toLowerCase() === 'active'); return (
                        <Badge variant={isActive ? "default" : "secondary"}>
                          {isActive ? "Active" : "Inactive"}
                        </Badge>
                      ); })()}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Students:</span>
                        <span className="font-medium">{Array.isArray(course.students) ? course.students.length : (course.studentCount ?? 0)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Worksheets:</span>
                        <span className="font-medium">{course.worksheetsCount ?? 0}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent" onClick={() => alert('Manage course functionality - connect to your external API')}>
                        Manage
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => alert('View course details functionality - connect to your external API')}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>


          <TabsContent value="students" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Student Management</h3>
              <Button onClick={() => setShowAddStudent(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Course Assignments</CardTitle>
                <CardDescription>Assign students to courses and manage access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">No students assigned yet</h4>
                  <p className="text-muted-foreground mb-4">Start by creating a course and adding students</p>
                  <Button variant="outline" onClick={() => alert('Invite Students functionality - connect to your external API')}>Invite Students</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <h3 className="text-2xl font-bold">Chat with AI</h3>
            <div className="flex justify-center">
              <TeacherChatInterface />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={studentForm.firstName}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={studentForm.lastName}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade Level</Label>
                <Select value={studentForm.grade} onValueChange={(value) => setStudentForm(prev => ({ ...prev, grade: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="k">Kindergarten</SelectItem>
                    <SelectItem value="1">Grade 1</SelectItem>
                    <SelectItem value="2">Grade 2</SelectItem>
                    <SelectItem value="3">Grade 3</SelectItem>
                    <SelectItem value="4">Grade 4</SelectItem>
                    <SelectItem value="5">Grade 5</SelectItem>
                    <SelectItem value="6">Grade 6</SelectItem>
                    <SelectItem value="7">Grade 7</SelectItem>
                    <SelectItem value="8">Grade 8</SelectItem>
                    <SelectItem value="9">Grade 9</SelectItem>
                    <SelectItem value="10">Grade 10</SelectItem>
                    <SelectItem value="11">Grade 11</SelectItem>
                    <SelectItem value="12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={studentForm.status} onValueChange={(value) => setStudentForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStudent(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStudent} disabled={isAddingStudent}>
              {isAddingStudent ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
