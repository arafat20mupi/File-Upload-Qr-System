"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/src/components/layout/navbar"
import Sidebar from "@/src/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Upload, CheckCircle, Edit } from "lucide-react"
import { useSession } from "next-auth/react"

interface FileData {
  _id: string
  name: string
  size: number
  url: string
}

const EditFilePage = () => {
  const params = useParams()
  const id = params.id
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [existingFile, setExistingFile] = useState<FileData | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState("")
  const { data: session, status } = useSession()

  // Session check
  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login")
      return
    }
    setUserName(session.user?.name || "User")
  }, [status, session, router])

  // Fetch existing file data
  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/${id}`, {
          credentials: "include",
        })
        if (!response.ok) throw new Error("Failed to fetch file")
        const data = await response.json()
        setExistingFile(data)
      } catch (err) {
        console.error(err)
        setError("Could not load existing file")
      }
    }
    if (id) fetchFile()
  }, [id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(selectedFile.type)) {
      setError("Only PDF and image files are allowed")
      return
    }
    setFile(selectedFile)
    setError("")
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (!droppedFile) return

    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(droppedFile.type)) {
      setError("Only PDF and image files are allowed")
      return
    }
    setFile(droppedFile)
    setError("")
  }

  const handleUpdate = async () => {
    if (!session?.user?.email) {
      setError("User email not found")
      return
    }

    if (!file) {
      setError("Please select a file to update")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("email", session.user.email)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/${id}`, {
        method: "PUT", // Update existing file
        body: formData,
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || "Update failed")
        return
      }

      setUploadSuccess(true)
      setFile(null)
      setTimeout(() => {
        router.push("/user/files")
      }, 2000)
    } catch (err) {
      setError("An error occurred during update")
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={userName} userRole="user" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="user" />

        <main className="flex-1 lg:ml-64 p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Edit File</h1>
              <p className="text-muted-foreground">View current file and upload a new one</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Existing File</CardTitle>
                <CardDescription>Preview your current file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {existingFile ? (
                  <div className="mb-4 p-4 bg-secondary/10 rounded-lg">
                    <p className="font-medium">{existingFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(existingFile.size / 1024).toFixed(2)} KB</p>
                    <a
                      href={existingFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      View File
                    </a>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Loading existing file...</p>
                )}

                {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">{error}</div>}

                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
                >
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium mb-2">Drag and drop a new file here</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>Select File</span>
                    </Button>
                  </label>
                </div>

                {file && (
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                )}

                <Button onClick={handleUpdate} disabled={!file || isUploading} className="w-full">
                  {isUploading ? "Updating..." : "Update File"}
                </Button>

                {uploadSuccess && (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-green-600">File updated successfully! Redirecting...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

export default EditFilePage
