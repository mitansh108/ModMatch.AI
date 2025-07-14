"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface Ticket {
  _id: string
  title: string
  description: string
  status: string
  priority?: string
  helpfulNotes?: string
  relatedSkills?: string[]
  createdAt?: string
}

interface Comment {
  _id: string
  message: string
  createdAt: string
  user: {
    email: string
    role: string
  }
}

export default function TicketDetailPage() {
  const router = useRouter()
  const { id } = router.query

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTicketData = async () => {
    const token = localStorage.getItem("token")
    if (!token || !id) return
  
    try {
      // ✅ Fetch ticket details
      const resTicket = await fetch(`https://modmatch-ai.onrender.com/api/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
  
      // ✅ Fetch ticket comments (use plural: /comments)
      const resComments = await fetch(`https://modmatch-ai.onrender.com/api/tickets/${id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
  
      if (resTicket.ok) {
        const ticketData = await resTicket.json()
        setTicket(ticketData)
      }
  
      if (resComments.ok) {
        const commentData = await resComments.json()
        setComments(commentData)
      }
    } catch (err) {
      console.error("Error loading ticket details:", err)
    } finally {
      setLoading(false)
    }
  }
  

  useEffect(() => {
    if (id) fetchTicketData()
  }, [id])

  if (loading || !ticket) {
    return <p className="p-6">Loading...</p>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <h2 className="text-xl font-semibold">Ticket Details</h2>
        </header>

        <div className="p-6 space-y-6">
          {/* Ticket Info */}
          <div className="bg-white rounded shadow p-4">
            <h3 className="text-xl font-semibold">{ticket.title}</h3>
            <p className="text-gray-700 mt-2">{ticket.description}</p>
            <div className="text-sm text-gray-500 mt-3 space-y-1">
              <p>Status: {ticket.status}</p>
              <p>Priority: {ticket.priority || "Not set"}</p>
              <p>Helpful Notes: {ticket.helpfulNotes || "—"}</p>
              <p>
                Related Skills: {ticket.relatedSkills?.join(", ") || "None"}
              </p>
              <p>
                Created At:{" "}
                {ticket.createdAt
                  ? new Date(ticket.createdAt).toLocaleString()
                  : "Unknown"}
              </p>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded shadow p-4">
            <h4 className="text-lg font-semibold mb-4">
              Comments ({comments.length})
            </h4>

            {comments.length === 0 ? (
              <p className="text-sm text-gray-500">No replies yet.</p>
            ) : (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div
                    key={c._id}
                    className="border-l-4 border-blue-500 bg-gray-50 p-3 rounded"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {c.user.email}{" "}
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                          {c.user.role}
                        </span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{c.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
