import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, FileText, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">EduWorksheet</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Transform Static Worksheets into Interactive Learning
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Upload any worksheet and watch AI convert it into engaging, interactive exercises. Track student progress
            and create personalized learning experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup?role=teacher">Start as Teacher</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signup?role=student">Join as Student</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Powerful Features for Modern Education
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI Worksheet Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Upload PDFs or images and let AI transform them into interactive quizzes and exercises.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Student Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Organize students into courses, assign worksheets, and manage access with ease.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Monitor student performance with detailed analytics and long-term progress storage.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Interactive Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Students can practice, save progress, and resume anytime with persistent data storage.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="text-3xl font-bold text-foreground mb-6">Ready to Transform Your Teaching?</h3>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of educators already using EduWorksheet to create engaging learning experiences.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/signup?role=teacher">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">© 2024 EduWorksheet. Built for modern education.</p>
        </div>
      </footer>
    </div>
  )
}
