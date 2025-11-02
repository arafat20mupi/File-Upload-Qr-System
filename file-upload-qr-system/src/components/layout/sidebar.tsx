"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/src/lib/utils"
import { LayoutDashboard, Users, FileText, Settings, X } from "lucide-react"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  userRole?: string
}

export default function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname()

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/files", label: "All Files", icon: FileText },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  const userLinks = [
    { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/user/files", label: "My Files", icon: FileText },
    { href: "/user/settings", label: "Settings", icon: Settings },
  ]

  const links = userRole === "admin" ? adminLinks : userLinks

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0 z-40",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center lg:hidden mb-4">
            <h2 className="font-semibold">Menu</h2>
            <button onClick={onClose} className="p-1 hover:bg-sidebar-accent rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
