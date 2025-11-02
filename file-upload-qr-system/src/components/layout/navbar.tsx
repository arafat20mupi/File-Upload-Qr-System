"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { LogOut, Menu } from "lucide-react"
import { useState } from "react"

interface NavbarProps {
  userName?: string
  userRole?: string
  onMenuClick?: () => void
}

export default function Navbar({ userName, userRole, onMenuClick }: NavbarProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    router.push("/login")
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-secondary rounded-md">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-primary">FileQR</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
