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
import { Button } from "@/components/ui/button"

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

  const handleReplyAndClose = async (ticketId: string) => {
    if (!replyMessage.trim()) return
    setSendingReply(true)
    try {
      const token = localStorage.getItem("token")

      // Step 1: Send reply
      const commentRes = await fetch(`https://modmatch-ai.onrender.com/api/tickets/${ticketId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: replyMessage }),
      })

      if (!commentRes.ok) throw new Error("Failed to post comment")

      // Step 2: Close the ticket
      const closeRes = await fetch(`https://modmatch-ai.onrender.com/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "CLOSED" }),
      })

      if (!closeRes.ok) throw new Error("Failed to close ticket")

      setReplyMessage("")
      setActiveReply(null)
      await fetchTickets()
    } catch (err) {
      console.error("Reply & Close failed:", err)
    } finally {
      setSendingReply(false)
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
                  <div className="text-sm space-y-1 mt-3">
  <p>
    <strong>Status:</strong>{" "}
    {ticket.status?.toUpperCase() || "Unknown"}
  </p>
  <p>
    <strong>Priority:</strong> {ticket.priority || "Not set"}
  </p>
  <p>
    <strong>Helpful Notes:</strong>{" "}
    {ticket.helpfulNotes || "—"}
  </p>
  <p>
    <strong>Related Skills:</strong>{" "}
    {ticket.relatedSkills?.join(", ") || "None"}
  </p>
  <p>
    <strong>Assigned To:</strong>{" "}
    {ticket.assignedTo?.email || "Unassigned"}
  </p>
  <p className="text-xs text-muted-foreground">
    Created At:{" "}
    {ticket.createdAt
      ? new Date(ticket.createdAt).toLocaleString()
      : "Unknown"}
  </p>
</div>


                  {ticket.status?.toLowerCase() !== "closed" && (
                    <>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setActiveReply((prev) =>
                              prev === ticket._id ? null : ticket._id
                            )
                          }
                        >
                          {activeReply === ticket._id ? "Cancel" : "Reply & Close"}
                        </Button>
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
                          <Button
                            onClick={() => handleReplyAndClose(ticket._id)}
                            disabled={sendingReply}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {sendingReply ? "Sending..." : "Send & Close"}
                          </Button>
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
