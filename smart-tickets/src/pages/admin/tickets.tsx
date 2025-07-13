"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"


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

type AssignedUser = {
  _id: string
  email: string
}

type Ticket = {
  _id: string
  title: string
  description?: string
  status?: string
  priority?: string
  helpfulNotes?: string
  relatedSkills?: string[]
  assignedTo?: string | AssignedUser | null
  createdAt?: string
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get("status") // e.g., "open", "closed"

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

  const closeTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`https://modmatch-ai.onrender.com/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: "CLOSED" }), // also use uppercase to match your backend logic
      });
  
      if (!res.ok) throw new Error("Failed to close ticket");
  
      await fetchTickets(); // refresh ticket list
    } catch (err) {
      console.error("Error closing ticket:", err);
    }
  };
  

  useEffect(() => {
    fetchTickets()
  }, [])

  const filteredTickets = tickets.filter((ticket) => {
    const normalizedStatus = ticket.status?.toLowerCase() ?? ""

    if (statusFilter === "closed") {
      return normalizedStatus === "closed"
    }

    if (statusFilter === "open") {
      return normalizedStatus !== "closed"
    }

    return true // No filter applied, show all
  })

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Tickets</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <h2 className="text-2xl font-bold">
            {statusFilter === "closed"
              ? "Closed Tickets"
              : statusFilter === "open"
              ? "Open Tickets"
              : "All Tickets"}
          </h2>

          {loading ? (
            <p>Loading tickets...</p>
          ) : filteredTickets.length === 0 ? (
            <p>No tickets found.</p>
          ) : (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTickets.map((ticket) => (
                <li
                  key={ticket._id}
                  className="rounded-xl bg-muted/50 p-5 shadow hover:bg-muted transition"
                >
                  <h3 className="font-semibold text-lg mb-1">{ticket.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {ticket.description}
                  </p>

                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Status:</strong>{" "}
                      {ticket.status?.toLowerCase() === "in process"
                        ? "In Process"
                        : ticket.status?.toUpperCase() ?? "Unknown"}
                    </p>
                    <p>
                      <strong>Priority:</strong>{" "}
                      {ticket.priority ?? "Not set"}
                    </p>
                    <p>
                      <strong>Related Skills:</strong>{" "}
                      {ticket.relatedSkills?.join(", ") || "None"}
                    </p>
                    <p>
                      <strong>Helpful Notes:</strong>{" "}
                      {ticket.helpfulNotes || "—"}
                    </p>
                    <p>
                      <strong>Assigned To:</strong>{" "}
                      {typeof ticket.assignedTo === "object" &&
                      ticket.assignedTo !== null
                        ? ticket.assignedTo.email
                        : ticket.assignedTo ?? "Unassigned"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created At:{" "}
                      {ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>

                  {ticket.status?.toLowerCase() !== "closed" && (
                    <button
                      onClick={() => closeTicket(ticket._id)}
                      className="mt-4 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Close Ticket
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
