"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  Users,
  LogOut,
  ChevronDown,
  Upload,
  CheckSquare,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

export function Sidebar() {
  const { user, logout, switchRole } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  if (!user) return null

  const menuItems = {
    hospital: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Submit Data", icon: FileText, href: "/data/submit" },
      { label: "Submit Scheme", icon: FileText, href: "/scheme/submit" },
      { label: "My Uploads", icon: Upload, href: "/uploads" },
      { label: "History", icon: BarChart3, href: "/analytics" },
    ],
    district: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Review Queue", icon: CheckSquare, href: "/review/queue" },
      { label: "Facilities", icon: Users, href: "/facilities" },
      { label: "Analytics", icon: BarChart3, href: "/analytics" },
    ],
    state: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "District Comparison", icon: BarChart3, href: "/analytics" },
      { label: "KPI Reports", icon: FileText, href: "/reports" },
    ],
    admin: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Users", icon: Users, href: "/admin/users" },
      { label: "Facilities", icon: Settings, href: "/admin/facilities" },
      { label: "System Logs", icon: FileText, href: "/logs" },
      { label: "Analytics", icon: BarChart3, href: "/analytics" },
    ],
  }

  const currentMenu = menuItems[user.currentRole] || []

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsMobileOpen(false)
  }

  const isActive = (href: string) => pathname === href

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 bg-sidebar text-sidebar-foreground z-50 flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg hover:bg-sidebar-accent/20 transition-colors duration-200"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-sidebar-accent rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-sidebar-accent-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="font-bold text-sm">HealthMetrics</span>
        </div>
        <div className="w-9" />
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40 transition-opacity duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen flex flex-col z-40 transition-all duration-300 transform md:transform-none md:mt-0 mt-16 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="hidden md:block p-4 border-b border-sidebar-border hover:bg-sidebar-accent/5 transition-colors duration-200">
          <div className="flex items-center gap-2 mb-2 hover:scale-105 transition-transform duration-300">
            <div className="w-8 h-8 bg-sidebar-accent rounded-lg flex items-center justify-center hover:shadow-lg transition-all duration-300">
              <svg
                className="w-5 h-5 text-sidebar-accent-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-lg font-bold">HealthMetrics</h1>
          </div>
          <p className="text-xs text-sidebar-foreground/60">Performance Data</p>
        </div>

        {/* User Info & Role Switcher */}
        <div className="px-3 py-3 border-b border-sidebar-border hover:bg-sidebar-accent/5 transition-colors duration-200">
          <div className="bg-sidebar-accent/10 rounded-lg p-2.5 mb-2 hover:bg-sidebar-accent/20 transition-all duration-200">
            <p className="text-xs font-medium text-sidebar-foreground/70 mb-1">Current Role</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold capitalize">{user.currentRole}</span>
              {user.roles.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1 text-sidebar-accent-foreground hover:bg-sidebar-accent/20 transition-all duration-200 btn-micro"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {user.roles.map((role) => (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => switchRole(role)}
                        className={`transition-all duration-150 cursor-pointer ${
                          user.currentRole === role ? "bg-accent/10" : "hover:bg-secondary/30"
                        }`}
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {currentMenu.map((item, idx) => (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              style={{ animationDelay: `${idx * 30}ms` }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 btn-micro fade-in ${
                isActive(item.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground active:scale-95"
              }`}
            >
              <item.icon className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-sidebar-border space-y-1.5">
          <Button
            variant="outline"
            className="w-full justify-start text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent/10 bg-transparent transition-all duration-200 btn-micro text-sm py-2 h-auto"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Settings</span>
          </Button>
          <Button
            variant="outline"
            onClick={logout}
            className="w-full justify-start text-sidebar-foreground border-sidebar-border hover:bg-destructive/10 hover:text-destructive bg-transparent transition-all duration-200 btn-micro text-sm py-2 h-auto"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>
    </>
  )
}
