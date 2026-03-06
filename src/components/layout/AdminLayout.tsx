import { useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard"
import { useSignOut } from "@/hooks/useAuth"

const adminNavItems = [
  { to: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: FileText },
  { to: "/admin/data-replay", label: "Data Replay", icon: RotateCcw },
  { to: "/admin/user-management", label: "User Management", icon: Users },
]

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const signOut = useSignOut()

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => navigate("/auth"),
    })
  }

  return (
    <AdminRouteGuard>
      <div className="flex min-h-screen bg-[rgb(var(--page-bg))]">
        {/* Sidebar - desktop */}
        <aside
          className={cn(
            "hidden border-r border-border bg-card transition-[width] duration-300 md:flex md:flex-col",
            collapsed ? "w-[4rem]" : "w-56"
          )}
        >
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            {!collapsed && (
              <Link to="/admin" className="flex items-center gap-2 font-display text-lg font-semibold">
                <Shield className="h-5 w-5 text-primary" />
                Admin
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
          </div>
          <ScrollArea className="flex-1 py-4">
            <nav className="flex flex-col gap-1 px-2" aria-label="Admin navigation">
              {(adminNavItems ?? []).map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>
          <div className="border-t border-border p-2">
            <Link to="/dashboard" className="mb-2 block">
              <Button variant="ghost" className={cn("w-full justify-start gap-3", collapsed && "justify-center px-2")}>
                <LayoutDashboard className="h-5 w-5 shrink-0" />
                {!collapsed && <span>Back to App</span>}
              </Button>
            </Link>
            <Button
              variant="ghost"
              className={cn("w-full justify-start gap-3", collapsed && "justify-center px-2")}
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Sign out</span>}
            </Button>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/admin" className="flex items-center gap-2 font-display text-lg font-semibold">
            <Shield className="h-5 w-5 text-primary" />
            Admin
          </Link>
          <div className="w-10" />
        </div>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        )}
        {/* Mobile drawer */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-56 border-r border-border bg-card transition-transform duration-300 md:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-14 items-center justify-end border-b border-border px-4">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-col gap-1 p-4" aria-label="Admin navigation">
            {(adminNavItems ?? []).map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="mt-4 w-full justify-start gap-3">
                <LayoutDashboard className="h-5 w-5" />
                Back to App
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
              <LogOut className="h-5 w-5" />
              Sign out
            </Button>
          </nav>
        </aside>

        <main className="flex-1 pt-14 md:pt-0 md:pl-0">
          <div className="min-h-screen p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </AdminRouteGuard>
  )
}
