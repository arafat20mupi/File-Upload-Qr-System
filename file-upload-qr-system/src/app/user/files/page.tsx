"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/src/components/layout/navbar"
import Sidebar from "@/src/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Eye, Trash2, QrCode, LinkIcon } from "lucide-react"
import Link from "next/link"

interface File {
  id: string
  name: string
  size: number
  uploadedAt: string
  qrCode: string
  shortUrl: string
}

export default function UserFiles() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const role = localStorage.getItem("userRole")
    const name = localStorage.getItem("userName")

    if (!token || role !== "user") {
      router.push("/login")
      return
    }

    setUserName(name || "User")
    fetchFiles()
  }, [router])

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/files`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (err) {
      console.error("Failed to fetch files:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setFiles(files.filter((f) => f.id !== fileId))
      }
    } catch (err) {
      console.error("Failed to delete file:", err)
    }
  }

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={userName} userRole="user" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="user" />

        <main className="flex-1 lg:ml-64 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Files</h1>
                <p className="text-muted-foreground">Manage your uploaded files</p>
              </div>
              <Link href="/user/files/upload">
                <Button>Upload New File</Button>
              </Link>
            </div>

            {/* Search */}
            <div className="mb-6">
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Files Table */}
            <Card>
              <CardHeader>
                <CardTitle>Files ({filteredFiles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading files...</div>
                ) : filteredFiles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No files found.{" "}
                    <Link href="/user/files/upload" className="text-primary hover:underline">
                      Upload one now
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium">Name</th>
                          <th className="text-left py-3 px-4 font-medium">Size</th>
                          <th className="text-left py-3 px-4 font-medium">Uploaded</th>
                          <th className="text-right py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFiles.map((file) => (
                          <tr key={file.id} className="border-b border-border hover:bg-secondary/50">
                            <td className="py-3 px-4">{file.name}</td>
                            <td className="py-3 px-4">{(file.size / 1024).toFixed(2)} KB</td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(file.uploadedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="View QR Code"
                                  onClick={() => window.open(`/file/${file.id}/qr`, "_blank")}
                                >
                                  <QrCode className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Copy Short URL"
                                  onClick={() => {
                                    navigator.clipboard.writeText(file.shortUrl)
                                  }}
                                >
                                  <LinkIcon className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="View File"
                                  onClick={() => window.open(`/file/${file.id}`, "_blank")}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(file.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
