"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select } from "@/components/ui/select"

// ** rest of code here **

interface PageProps {
  params: {
    worksheetId: string
  }
}

const Page = ({ params }: PageProps) => {
  const { worksheetId } = params
  const [worksheet, setWorksheet] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Fetch worksheet data based on worksheetId
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3004';
    const getApiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
    fetch(getApiUrl(`/api/worksheet/${worksheetId}`))
      .then((response) => response.json())
      .then((data) => setWorksheet(data))
      .catch((error) => console.error("Error fetching worksheet:", error))
  }, [worksheetId])

  if (!worksheet) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Publish Worksheet</CardTitle>
          <CardDescription>Review and publish your worksheet</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Badge variant="outline">Worksheet ID: {worksheetId}</Badge>
          </div>
          <div>
            <Checkbox id="publishCheckbox" />
            <label htmlFor="publishCheckbox">Confirm to publish</label>
          </div>
          <div>
            <Select>{/* Options for select component */}</Select>
          </div>
          <Button onClick={() => router.push(`/teacher/worksheet/${worksheetId}`)}>Publish</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Page
