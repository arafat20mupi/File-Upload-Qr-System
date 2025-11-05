"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Navbar from "@/src/components/layout/navbar"
import Sidebar from "@/src/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Upload, FileText } from "lucide-react"
import Link from "next/link"

export default function UserDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({ totalFiles: 0, totalSize: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return // session এখনো লোড হচ্ছে
    if (!session) {
      router.push("/login")
      return
    }

    // ✅ শুধুমাত্র user role check করো
    if (session.user.role !== "USER") {
      router.push("/login")
      return
    }

    fetchStats()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/stats`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={session?.user?.name || "User"} userRole="user" onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="user" />
        <main className="flex-1 lg:ml-64 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {session?.user?.name}!</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalFiles}</div>
                  <p className="text-xs text-muted-foreground mt-1">Files uploaded</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{(stats.totalSize / 1024 / 1024).toFixed(2)} MB</div>
                  <p className="text-xs text-muted-foreground mt-1">Storage used</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with your files</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4">
                <Link href="/user/files/upload" className="flex-1">
                  <Button className="w-full gap-2">
                    <Upload className="w-4 h-4" />
                    Upload File
                  </Button>
                </Link>
                <Link href="/user/files" className="flex-1">
                  <Button variant="outline" className="w-full gap-2 bg-transparent">
                    <FileText className="w-4 h-4" />
                    View My Files
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
