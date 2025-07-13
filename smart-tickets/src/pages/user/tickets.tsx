"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Ticket {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  createdBy: string
}
interface User {
  _id: string
  email: string
  name?: string
}


export default function UserTicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [rawUser, setRawUser] = useState<string | null>(null)

  const statusFilter = router.query.status?.toString()

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    const tokenStr = localStorage.getItem("token")
    setRawUser(userStr)

    let parsedUser: User | null = null
    try {
      parsedUser = userStr ? JSON.parse(userStr) : null
    } catch (err) {
      setError("Could not parse user JSON from localStorage.")
      setLoading(false)
      return
    }

    if (!tokenStr || !parsedUser?._id)
 {
      setError("Missing token or user ID.")
      setLoading(false)
      return
    }

    setToken(tokenStr)
    setUserId(parsedUser._id)

    const fetchTickets = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/tickets", {
          headers: {
            Authorization: `Bearer ${tokenStr}`,
          },
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.message || "Failed to fetch tickets.")
        }

        const data: Ticket[] = await res.json()

        const userTickets = data.filter(
          (ticket) => String(ticket.createdBy) === String(parsedUser!._id)
        )
        
        

        const filtered = statusFilter
          ? userTickets.filter((ticket) => ticket.status === statusFilter)
          : userTickets

        setTickets(filtered)
      } catch (err: any) {
        setError("Could not load tickets: " + err.message) 
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [statusFilter])

  if (loading) return <p className="text-center mt-10">Loading your tickets...</p>

  if (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        <p>{error}</p>
        <div className="text-xs text-gray-500 mt-4">
          <div><strong>Raw user:</strong> {rawUser || "null"}</div>
          <div><strong>Token:</strong> {token || "null"}</div>
          <div><strong>User ID:</strong> {userId || "null"}</div>
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">
        {statusFilter ? `${statusFilter[0].toUpperCase()}${statusFilter.slice(1)} Tickets` : "All Tickets"}
      </h1>

      {tickets.length === 0 ? (
        <p className="text-muted-foreground">You have no {statusFilter || ""} tickets.</p>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="p-4 shadow">
              <h3 className="font-semibold">{ticket.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
              <div className="text-xs text-gray-500">Status: {ticket.status}</div>
              <div className="text-xs text-gray-500">Created: {new Date(ticket.createdAt).toLocaleString()}</div>
              <div className="text-xs text-gray-400">User ID: {ticket.createdBy}</div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <Link href="/user/tickets?status=open">
          <Button variant="outline">Open Tickets</Button>
        </Link>
        <Link href="/user/tickets?status=closed">
          <Button variant="outline">Closed Tickets</Button>
        </Link>
        <Link href="/user">
          <Button variant="ghost">Back to Dashboard</Button>
        </Link>
      </div>
    </main>
  )
}
