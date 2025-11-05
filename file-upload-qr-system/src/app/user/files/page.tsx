"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/src/components/layout/navbar"
import Sidebar from "@/src/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Eye, Trash2, QrCode, Download, Edit } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface File {
  _id: string
  name: string
  size: number
  uploadedAt?: string
  createdAt?: string
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
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedQr, setSelectedQr] = useState<string>("")
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "USER") {
      router.push("/login")
      return
    }
    fetchFiles()
  }, [session, status, router])

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: session?.user.email ? JSON.stringify({ email: session.user.email }) : null,
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/files/${fileId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setFiles(files.filter((f) => f._id !== fileId))
      }
    } catch (err) {
      console.error("Failed to delete file:", err)
    }
  }

  const handleViewQr = (qr: string) => {
    setSelectedQr(qr)
    setQrModalOpen(true)
  }

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={userName} userRole="user" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="user" />

        <main className="flex-1 lg:ml-64 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
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
                          <tr key={file._id} className="border-b border-border hover:bg-secondary/50">
                            <td className="py-3 px-4">{file.name}</td>
                            <td className="py-3 px-4">{(file.size / 1024).toFixed(2)} KB</td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {file.uploadedAt
                                ? new Date(file.uploadedAt).toLocaleDateString()
                                : new Date(file.createdAt ?? "").toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                {/* QR Code View */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="View QR Code"
                                  onClick={() => handleViewQr(file.qrCode)}
                                >
                                  <QrCode className="w-4 h-4" />
                                </Button>

                                {/* Download QR Code Button */}
                                <a
                                  href={file.qrCode}
                                  download={`QR_${file.name}.png`}
                                  title="Download QR Code"
                                >
                                  <Button variant="ghost" size="sm">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </a>

                                {/* View File */}
                                <Link
                                  href={`/TRADELICENCE/${file._id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="View File"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </Link>

                                {/* update file */}
                                <Link
                                  href={`/user/files/upload/${file._id}`}
                                  rel="noopener noreferrer"
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Update File"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </Link>

                                {/* Delete File */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(file._id)}
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

          {/* QR Code Modal */}
          {qrModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-sm w-full text-center">
                <h3 className="text-lg font-semibold mb-4">QR Code</h3>
                <img src={selectedQr} alt="QR Code" className="w-64 h-64 mx-auto" />
                <Button onClick={() => setQrModalOpen(false)} className="mt-4 w-full">
                  Close
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
