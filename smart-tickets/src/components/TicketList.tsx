import { Card } from "@/components/ui/card"

export default function TicketList({ tickets }: { tickets: any[] }) {
  if (!Array.isArray(tickets)) {
    return <p className="text-red-500">Invalid data: Tickets not available</p>
  }

  if (tickets.length === 0) {
    return <p className="text-gray-500">No tickets found.</p>
  }

  return (
    <div className="space-y-4 mt-6">
      {tickets.map((ticket) => (
        <Card key={ticket._id} className="p-4">
          <h2 className="text-xl font-semibold">{ticket.title}</h2>
          <p className="text-gray-600">{ticket.description}</p>
        </Card>
      ))}
    </div>
  )
}
