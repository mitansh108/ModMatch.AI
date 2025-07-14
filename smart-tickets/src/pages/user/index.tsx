"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

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
  createdAt: string
  commentCount?: number 
}

export default function UserDashboardPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
    if (storedUser?.name) setUserName(storedUser.name)

    fetchTickets()

    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchTickets, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchTickets = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const res = await fetch("https://modmatch-ai.onrender.com/api/tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (res.ok) {
        setTickets(data)
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const token = localStorage.getItem("token")
    if (!token) {
      setError("You must be logged in to create a ticket.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("https://modmatch-ai.onrender.com/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Failed to create ticket.")
      } else {
        setSuccess("Ticket created!")
        setTitle("")
        setDescription("")
        fetchTickets()
      }
    } catch (err) {
      setError("Something went wrong.")
    }

    setLoading(false)
  }

  const openTickets = tickets.filter((t) => t.status.toLowerCase() !== "closed")
const closedTickets = tickets.filter((t) => t.status.toLowerCase() === "closed")


return (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header className="flex h-16 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <h2 className="text-xl font-semibold">Welcome, {userName || "User"}</h2>
      </header>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Ticket */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Create New Ticket</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Ticket"}
              </Button>
            </form>
          </div>

          {/* Open Tickets */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Open Tickets</h3>
            {openTickets.length === 0 ? (
              <p className="text-sm text-gray-500">No open tickets.</p>
            ) : (
              <div className="space-y-4">
                {openTickets.map((ticket) => (
                  <a
                    key={ticket._id}
                    href={`/user/ticket/${ticket._id}`}
                    className="block rounded-lg border p-4 bg-white shadow-sm hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{ticket.title}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          ticket.status === "TODO"
                            ? "bg-yellow-100 text-yellow-800"
                            : ticket.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : ticket.status === "CLOSED"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {ticket.commentCount ?? 0} comment{ticket.commentCount === 1 ? "" : "s"}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Closed Tickets */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Closed Tickets</h3>
            {closedTickets.length === 0 ? (
              <p className="text-sm text-gray-500">No closed tickets.</p>
            ) : (
              <div className="space-y-4">
                {closedTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="rounded-lg border p-4 bg-gray-100 shadow-sm"
                  >
                    <h4 className="font-medium">{ticket.title}</h4>
                    <p className="text-sm text-gray-600">{ticket.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
)

}
