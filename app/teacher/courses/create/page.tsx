"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"

export default function CreateCoursePage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    grade: "",
    status: "active",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [allStudents, setAllStudents] = useState<string[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [studentQuery, setStudentQuery] = useState("")
  const [studentsOpen, setStudentsOpen] = useState(false)
  const router = useRouter()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://31.97.41.27:4002'
  const getApiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`
  const authToken = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || '') : ''
  const getTeacherIdFromToken = (token: string): string => {
    try {
      const payload = JSON.parse(atob((token || '').split('.')[1] || ''))
      return String(payload?.sub || payload?.id || payload?.teacherId || '')
    } catch {
      return ''
    }
  }
  const teacherId = authToken ? getTeacherIdFromToken(authToken) : (typeof window !== 'undefined' ? (localStorage.getItem('teacherId') || '') : '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch(getApiUrl('/api/courses'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          grade: formData.grade,
          status: formData.status,
          teacherId,
          students: selectedStudents,
        }),
      })
      const data = await res.json().catch(() => ({} as any))
      if (!res.ok) {
        alert(data?.error || 'Failed to create course')
        setIsLoading(false)
        return
      }
      router.push("/teacher/dashboard")
    } catch {
      alert('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    let ignore = false
    const loadStudents = async () => {
      try {
        const path = `/api/students${teacherId ? `?teacherId=${encodeURIComponent(teacherId)}` : ''}`
        const res = await fetch(getApiUrl(path), { headers: { ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) } })
        const data = await res.json().catch(() => ({} as any))
        if (!ignore) {
          const emails: string[] = Array.isArray(data?.users) ? data.users.map((u: any) => u?.email).filter(Boolean) : (Array.isArray(data?.students) ? data.students.map((s: any) => s?.email).filter(Boolean) : [])
          setAllStudents(emails)
        }
      } catch {
        if (!ignore) setAllStudents([])
      }
    }
    loadStudents()
    return () => { ignore = true }
  }, [])

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase()
    if (!q) return allStudents
    return allStudents.filter(e => String(e).toLowerCase().includes(q))
  }, [allStudents, studentQuery])

  const toggleStudent = (email: string) => {
    setSelectedStudents(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email])
  }

  const allSelected = selectedStudents.length > 0 && selectedStudents.length === allStudents.length
  const toggleSelectAll = () => {
    setSelectedStudents(prev => (allSelected ? [] : [...allStudents]))
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
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Create New Course</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>Fill in the details to create a new course for your students</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Course Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Mathematics Grade 5"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the course content and objectives"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade Level *</Label>
                  <Select value={formData.grade} onValueChange={(value) => updateFormData("grade", value)}>
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
                  <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
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

              <div className="space-y-2">
                <Label>Students</Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setStudentsOpen((v) => !v)}
                    className="w-full text-left rounded-md border bg-transparent px-3 py-2 text-sm"
                  >
                    {selectedStudents.length > 0 ? `${selectedStudents.length} selected` : 'Select students'}
                  </button>
                  {studentsOpen && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-2 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          placeholder="Search students..."
                          value={studentQuery}
                          onChange={(e) => setStudentQuery(e.target.value)}
                        />
                        <Button type="button" variant="outline" onClick={toggleSelectAll} className="bg-transparent">
                          {allSelected ? 'Clear all' : 'Select all'}
                        </Button>
                      </div>
                      <div className="max-h-48 overflow-auto space-y-1">
                        {filteredStudents.length === 0 && (
                          <div className="text-xs text-muted-foreground px-1 py-2">No students</div>
                        )}
                        {filteredStudents.map((email) => (
                          <label key={email} className="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              className="border"
                              checked={selectedStudents.includes(email)}
                              onChange={() => toggleStudent(email)}
                            />
                            <span className="truncate">{email}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 bg-transparent" asChild>
                  <Link href="/teacher/dashboard">Cancel</Link>
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
