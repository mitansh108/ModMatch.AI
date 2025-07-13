import * as React from "react"
import {
  Bot,
  LifeBuoy,
  Send,
  Settings2,
  SquareTerminal,
  Ticket,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"



import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type User = {
  name: string
  email: string
  avatar: string
  role: "user" | "admin" | "moderator" | ""
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<User>({
    name: "Loading...",
    email: "Loading...",
    avatar: "/avatars/shadcn.jpg",
    role: "",
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    fetch("https://modmatch-ai.onrender.com/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(`HTTP ${res.status}: ${text}`)
        }
        return res.json()
      })
      .then((data) => {
        const u = Array.isArray(data) ? data[0] : data
        if (u?.email) {
          setUser({
            email: u.email,
            role: u.role || "user",
            name: u.name || "User",
            avatar: "/avatars/shadcn.jpg",
          })
        }
      })
      .catch((err) => {
        console.error("Failed to load user", err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const navByRole: Record<string, any[]> = {
    user: [
      { title: "Dashboard", url: "/user", icon: SquareTerminal },
      { title: "My Tickets", url: "/user/tickets", icon: Ticket },
      { title: "Create Ticket", url: "/user/create", icon: Send },
      { title: "Help Center", url: "/user/resources", icon: Bot },
      { title: "Announcements", url: "/user/updates", icon: LifeBuoy },
      { title: "Settings", url: "/user/settings", icon: Settings2 },
    ],
    moderator: [
      { title: "Dashboard", url: "/moderator", icon: SquareTerminal },
      { title: "Assigned Tickets", url: "/moderator/tickets", icon: Ticket },
      { title: "My Skills", url: "/moderator/skills", icon: Bot },
    ],
    admin: [
      { title: "Dashboard", url: "/admin", icon: SquareTerminal },
      { title: "All Tickets", url: "/admin/tickets", icon: Ticket },
      { title: "Manage Users", url: "/admin/manage", icon: Users },
    ],
  }

  const navSecondary = [
    { title: "Support", url: "#", icon: LifeBuoy },
    { title: "Feedback", url: "#", icon: Send },
  ]

  // ✨ Loading shimmer UI while user loads
  if (loading || !user.role) {
    return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <div className="animate-pulse px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300" />
            <div className="space-y-1">
              <div className="w-24 h-3 rounded bg-gray-300" />
              <div className="w-16 h-3 rounded bg-gray-200" />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-4 py-2">
          <div className="space-y-3 animate-pulse">
            <div className="w-40 h-4 bg-gray-300 rounded" />
            <div className="w-32 h-4 bg-gray-300 rounded" />
            <div className="w-36 h-4 bg-gray-200 rounded" />
            <div className="w-28 h-4 bg-gray-300 rounded" />
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <SidebarFooter>
                <NavUser user={user} />
              </SidebarFooter>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navByRole[user.role] || navByRole["user"]} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
