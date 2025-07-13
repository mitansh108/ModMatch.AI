"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { API_BASE_URL } from "@/utils/api"
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
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"

type Ticket = {
  _id: string
  title: string
  description?: string
  status?: string
  assignedTo: { email: string }
  createdAt?: string
}

export default function ModeratorTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!res.ok) throw new Error("Failed to fetch tickets")
      const data = await res.json()

      // Get current user's email from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const email = user.email

      // Filter tickets assigned to current moderator
      const assignedTickets = data.filter(
        (ticket: Ticket) =>
          typeof ticket.assignedTo === "object" &&
          ticket.assignedTo !== null &&
          "email" in ticket.assignedTo &&
          ticket.assignedTo.email === email
      )
      

      setTickets(assignedTickets)
    } catch (err) {
      console.error("Error fetching tickets:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleReplyAndClose = (ticketId: string) => {
    console.log("Reply & Close clicked for", ticketId)
    // TODO: Show reply modal or handle ticket update
  }

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!res.ok) throw new Error("Failed to delete ticket")

      setTickets((prev) => prev.filter((t) => t._id !== ticketId))
    } catch (err) {
      console.error("Error deleting ticket:", err)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/moderator">Moderator</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Tickets</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Ticket list */}
        <div className="flex flex-1 flex-col gap-6 p-6">
          <h2 className="text-2xl font-bold">Your Tickets</h2>

          {loading ? (
            <p>Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p>No tickets found.</p>
          ) : (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tickets.map((ticket) => (
                <li
                  key={ticket._id}
                  className="rounded-xl bg-muted/50 p-4 shadow transition"
                >
                  <h3 className="font-medium text-lg">{ticket.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Status: <span className="font-medium">{ticket.status}</span>
                    <br />
                    Created:{" "}
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleString()
                      : "Unknown"}
                  </p>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleReplyAndClose(ticket._id)}
                    >
                      Reply & Close
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTicket(ticket._id)}
                    >
                      Close
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
