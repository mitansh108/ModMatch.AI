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
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

type Ticket = {
  id: string
  title: string
  status?: string
  assignedTo: { email: string }
}

export default function ModeratorDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [checking, setChecking] = useState(true) // prevent render until auth is checked

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user || user.role !== "moderator") {
      router.push("/unauthorized")
    } else {
      setChecking(false)
    }
  }, [router])


  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/tickets", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!res.ok) throw new Error("Failed to fetch tickets")
        const data = await res.json()

        const user = JSON.parse(localStorage.getItem("user") || "{}")
        const email = user.email

        // Only keep tickets assigned to the current moderator
        const assigned = data.filter(
            (ticket: Ticket) =>
              typeof ticket.assignedTo === "object" &&
              ticket.assignedTo !== null &&
              "email" in ticket.assignedTo &&
              ticket.assignedTo.email === email
          )

        setTickets(assigned)
      } catch (err) {
        console.error("Error fetching moderator tickets:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  const totalTickets = tickets.length
  const closedTickets = tickets.filter((t) => t.status === "closed").length

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
                  <BreadcrumbPage>Moderator Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <h2 className="text-xl font-semibold">Welcome, Moderator</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/moderator/tickets"
              className="rounded-xl bg-muted/50 p-6 shadow hover:bg-muted transition"
            >
              <h3 className="text-lg font-medium">Your Assigned Tickets</h3>
              <p className="text-2xl mt-2">{loading ? "…" : totalTickets}</p>
            </Link>

            <Link
              href="/moderator/tickets?status=closed"
              className="rounded-xl bg-muted/50 p-6 shadow hover:bg-muted transition"
            >
              <h3 className="text-lg font-medium">Your Closed Tickets</h3>
              <p className="text-2xl mt-2">{loading ? "…" : closedTickets}</p>
            </Link>
          </div>

          <div className="rounded-xl bg-muted/50 p-6 shadow">
            <h3 className="text-lg font-medium">Recent Activity</h3>
            <p className="text-sm text-muted-foreground mt-2">No recent updates.</p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
