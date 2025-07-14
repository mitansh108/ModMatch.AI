"use client"

import { useEffect, useState } from "react"
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

type Ticket = {
  _id: string
  title: string
  description?: string
  status?: string
  priority?: string
  helpfulNotes?: string
  relatedSkills?: string[]
  assignedTo: { email: string }
  createdAt?: string
}

export default function ModeratorTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [activeReply, setActiveReply] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [sendingReply, setSendingReply] = useState(false)

  const fetchTickets = async () => {
    try {
      const res = await fetch("https://modmatch-ai.onrender.com/api/tickets", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (!res.ok) throw new Error("Failed to fetch tickets")
      const data = await res.json()

      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const email = user.email

      const assignedTickets = data.filter(
        (ticket: Ticket) =>
          typeof ticket.assignedTo === "object" &&
          ticket.assignedTo?.email === email &&
          ticket.status?.toLowerCase() !== "closed"
      )

      setTickets(assignedTickets)
    } catch (err) {
      console.error("Error fetching tickets:", err)
    } finally {
      setLoading(false)
    }
  }

  const sendReply = async (ticketId: string) => {
    try {
      setSendingReply(true)
      const res = await fetch(`https://modmatch-ai.onrender.com/api/tickets/${ticketId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: replyMessage }),
      })
      if (!res.ok) throw new Error("Failed to send reply")

      setReplyMessage("")
      setActiveReply(null)
      await fetchTickets()
    } catch (err) {
      console.error("Error sending reply:", err)
    } finally {
      setSendingReply(false)
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
        body: JSON.stringify({ status: "CLOSED" }),
      })
      if (!res.ok) throw new Error("Failed to close ticket")
      await fetchTickets()
    } catch (err) {
      console.error("Error closing ticket:", err)
    }
  }

  const flagToAdmin = async (ticketId: string) => {
    try {
      const res = await fetch(`https://modmatch-ai.onrender.com/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ flagged: true }),
      })
      if (!res.ok) throw new Error("Failed to flag ticket")
      await fetchTickets()
    } catch (err) {
      console.error("Error flagging ticket:", err)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

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
                <BreadcrumbLink href="/moderator">Moderator</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Tickets</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <h2 className="text-2xl font-bold">Assigned Tickets</h2>

          {loading ? (
            <p>Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p>No tickets assigned to you.</p>
          ) : (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tickets.map((ticket) => (
                <li
                  key={ticket._id}
                  className="rounded-xl bg-muted/50 p-5 shadow hover:bg-muted transition"
                >
                  <h3 className="font-semibold text-lg mb-1">{ticket.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {ticket.description}
                  </p>

                  <div className="text-sm space-y-1">
                    <p><strong>Status:</strong> {ticket.status?.toUpperCase() ?? "Unknown"}</p>
                    <p><strong>Priority:</strong> {ticket.priority ?? "Not set"}</p>
                    <p><strong>Related Skills:</strong> {ticket.relatedSkills?.join(", ") || "None"}</p>
                    <p><strong>Helpful Notes:</strong> {ticket.helpfulNotes || "—"}</p>
                    <p><strong>Assigned To:</strong> {ticket.assignedTo?.email || "Unassigned"}</p>
                    <p className="text-xs text-muted-foreground">
                      Created At:{" "}
                      {ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>

                  {ticket.status?.toLowerCase() !== "closed" && (
                    <>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            setActiveReply((prev) =>
                              prev === ticket._id ? null : ticket._id
                            )
                          }
                          className="text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {activeReply === ticket._id ? "Cancel Reply" : "Reply"}
                        </button>

                        <button
                          onClick={() => closeTicket(ticket._id)}
                          className="text-sm px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                        >
                          Close
                        </button>

                        <button
                          onClick={() => flagToAdmin(ticket._id)}
                          className="text-sm px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                          Flag to Admin
                        </button>
                      </div>

                      {activeReply === ticket._id && (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                            rows={3}
                            placeholder="Type your reply..."
                          />
                          <button
                            onClick={() => sendReply(ticket._id)}
                            disabled={sendingReply || replyMessage.trim() === ""}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          >
                            {sendingReply ? "Sending..." : "Send Reply"}
                          </button>
                        </div>
                      )}
                    </>
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
