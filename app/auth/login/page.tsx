"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"teacher" | "student">("teacher")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3004';
      const getApiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
      const res = await fetch(getApiUrl('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      let data: any = null
      try {
        data = await res.json()
      } catch {
        data = {}
      }
      const token: string | undefined = data?.token || data?.jwt || data?.accessToken || data?.idToken
      if (!res.ok || !token) {
        alert(data?.error || 'Login failed')
        setIsLoading(false)
        return
      }
      // Persist token for authenticated API calls and derive teacher id from JWT (sub)
      if (typeof window !== 'undefined' && token) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('userEmail', data.user?.email || email)
        try {
          const payload = JSON.parse(atob((token as string).split('.')[1] || ''))
          const derivedId = payload?.sub || payload?.id || payload?.teacherId || data.user?._id
          if (derivedId) {
            localStorage.setItem('teacherId', String(derivedId))
          }
          if (payload?.email && !data.user?.email) {
            localStorage.setItem('userEmail', String(payload.email))
          }
        } catch {
          if (data.user?._id) {
            localStorage.setItem('teacherId', String(data.user._id))
          }
        }
      }
      let userRole: 'teacher' | 'student' = 'teacher'
      try {
        const payload = JSON.parse(atob((token as string).split('.')[1] || ''))
        if (payload?.role === 'student' || payload?.role === 'teacher') {
          userRole = payload.role
        }
      } catch {}
      // Redirect teacher using JWT-derived id (dashboard route is shared)
      router.push(userRole === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
    } catch (err) {
      alert('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your EduWorksheet account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">I am a</Label>
                <Select value={role} onValueChange={(value: "teacher" | "student") => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
