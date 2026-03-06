import { useState } from "react"
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  Shield,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSignOut } from "@/hooks/useAuth"
import { useCurrentUser } from "@/hooks/useAuth"
import { QuickCompanySelector, CompactFilterBar } from "@/components/dashboard"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/companies", label: "Companies", icon: Building2 },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/subscription-management", label: "Subscription", icon: CreditCard },
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const signOut = useSignOut()
  const { isAdmin, user } = useCurrentUser()
  const isDashboardRoute = location.pathname.startsWith("/dashboard")

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => navigate("/auth"),
    })
  }

  return (
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
            <Link to="/dashboard" className="font-display text-lg font-semibold">
              Gbox360
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex"
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="flex flex-col gap-1 px-2">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = to === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(to)
              return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                  isActive ? "bg-muted text-foreground" : "text-muted-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            )})}
            {isAdmin && (
              <Link
                to="/admin-dashboard"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10",
                  collapsed && "justify-center px-2"
                )}
              >
                <Shield className="h-5 w-5 shrink-0" />
                {!collapsed && <span>Admin</span>}
              </Link>
            )}
          </nav>
        </ScrollArea>
        <div className="border-t border-border p-2">
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link to="/dashboard" className="font-display text-lg font-semibold">
          Gbox360
        </Link>
        <div className="w-10" />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-56 border-r border-border bg-card transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-end border-b border-border px-4">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map(({ to, label, icon: Icon }) => (
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
          {isAdmin && (
            <Link
              to="/admin-dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
              onClick={() => setMobileOpen(false)}
            >
              <Shield className="h-5 w-5" />
              Admin
            </Link>
          )}
          <Button
            variant="ghost"
            className="mt-4 w-full justify-start gap-3"
            onClick={() => {
              handleSignOut()
              setMobileOpen(false)
            }}
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </Button>
        </nav>
      </aside>

      <main className="flex-1 pt-14 md:pt-0 md:pl-0">
        {isDashboardRoute && (
          <div className="sticky top-14 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-4 md:top-0 md:px-6">
            <div className="flex flex-1 flex-wrap items-center gap-4">
              <QuickCompanySelector placeholder="Search companies..." className="max-w-[280px]" />
              <CompactFilterBar />
            </div>
            <div className="flex items-center gap-2">
              <Link to="/dashboard/profile">
                <Avatar className="h-8 w-8 transition-transform hover:scale-105">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {user?.email?.slice(0, 2).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        )}
        <div className="min-h-screen p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
