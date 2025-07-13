"use client"

import { AppSidebar } from "@/components/app-sidebar"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"


import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

type Ticket = {
  id: string
  title: string
  status?: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(true) // prevent render until auth is checked

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user || user.role !== "admin") {
      router.push("/unauthorized")
    } else {
      setChecking(false)
    }
  }, [router])

  useEffect(() => {
    if (checking) return
    const fetchTickets = async () => {
      try {
        const res = await fetch("https://modmatch-ai.onrender.com/api/tickets", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch tickets")
        const data = await res.json()
        setTickets(data)
      } catch (err) {
        console.error("Error fetching tickets:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [checking])

  const totalTickets = tickets.length
  const inProgressTickets = tickets.filter((t) =>
    ["in_progress", "todo"].includes(t.status?.toLowerCase() ?? "")
  ).length
  const closedTickets = tickets.filter((t) =>
    t.status?.toLowerCase() === "closed"
  ).length

  if (checking) return null // prevents UI from flashing before redirect

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Admin Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <h2 className="text-xl font-semibold">Welcome, Admin</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/admin/tickets"
              className="rounded-xl bg-muted/50 p-6 shadow hover:bg-muted transition"
            >
              <h3 className="text-lg font-medium">Total Tickets</h3>
              <p className="text-2xl mt-2">{loading ? "…" : totalTickets}</p>
            </Link>

            <Link
              href="/admin/tickets?status=open"
              className="rounded-xl bg-muted/50 p-6 shadow hover:bg-muted transition"
            >
              <h3 className="text-lg font-medium">Tickets In Progress</h3>
              <p className="text-2xl mt-2">
                {loading ? "…" : inProgressTickets}
              </p>
            </Link>

            <Link
              href="/admin/tickets?status=closed"
              className="rounded-xl bg-muted/50 p-6 shadow hover:bg-muted transition"
            >
              <h3 className="text-lg font-medium">Closed Tickets</h3>
              <p className="text-2xl mt-2">
                {loading ? "…" : closedTickets}
              </p>
            </Link>
          </div>

          {/* Placeholder for future dashboard widgets */}
          <div className="rounded-xl bg-muted/50 p-6 shadow">
            <h3 className="text-lg font-medium">Recent Activity</h3>
            <p className="text-sm text-muted-foreground mt-2">No recent updates.</p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
