"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/src/components/layout/navbar"
import Sidebar from "@/src/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Upload, CheckCircle } from "lucide-react"
import { useSession } from "next-auth/react"

export default function UploadFile() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState("")
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return 
    if (!session) {
      router.push("/login")
      return
    }

    setUserName(session.user.name || "User")
  }, [router])
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type (PDF and Images only)
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!validTypes.includes(selectedFile.type)) {
        setError("Only PDF and image files are allowed")
        return
      }
      setFile(selectedFile)
      setError("")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!validTypes.includes(droppedFile.type)) {
        setError("Only PDF and image files are allowed")
        return
      }
      setFile(droppedFile)
      setError("")
    }
  }

const handleUpload = async () => {
  if (!file) {
    setError("Please select a file");
    return;
  }

  if (!session?.user?.email) {
    setError("User email not found");
    return;
  }

  setIsUploading(true);
  setError("");

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", session.user.email); // <-- Add email here

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.message || "Upload failed");
      return;
    }

    setUploadSuccess(true);
    setFile(null);
    setTimeout(() => {
      router.push("/user/files");
    }, 2000);
  } catch (err) {
    setError("An error occurred during upload");
    console.error(err);
  } finally {
    setIsUploading(false);
  }
};


  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={userName} userRole="user" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="user" />

        <main className="flex-1 lg:ml-64 p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Upload File</h1>
              <p className="text-muted-foreground">Upload a PDF or image file</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Select File</CardTitle>
                <CardDescription>Drag and drop or click to select a file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {uploadSuccess ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Upload Successful!</h3>
                    <p className="text-muted-foreground">Redirecting to your files...</p>
                  </div>
                ) : (
                  <>
                    {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">{error}</div>}

                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
                    >
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="font-medium mb-2">Drag and drop your file here</p>
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

                    <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
                      {isUploading ? "Uploading..." : "Upload File"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
