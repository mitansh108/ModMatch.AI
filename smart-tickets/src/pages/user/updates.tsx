"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Update = {
  title: string
  date: string // ISO date string
  description: string
}

export default function UpdatesPage() {
  const [mounted, setMounted] = useState(false)
  const [updates, setUpdates] = useState<Update[]>([
    {
      title: "Moderator System Improvements",
      date: "2025-07-10",
      description:
        "We've enhanced the moderator assignment logic to better match ticket skills. Moderators now receive more relevant tickets automatically.",
    },
    {
      title: "User Dashboard UI Update",
      date: "2025-07-08",
      description:
        "The user dashboard has been revamped for easier ticket tracking and faster submission.",
    },
    {
      title: "Skill-Based Routing Added",
      date: "2025-07-05",
      description:
        "Tickets are now routed to moderators based on their skills. You can update your skills from the moderator dashboard.",
    },
    {
      title: "AI Ticket Suggestions Launched",
      date: "2025-07-03",
      description:
        "Our new AI system suggests related skills, priority, and helpful notes based on your ticket content.",
    },
  ])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null // prevent hydration mismatch

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <h2 className="text-xl font-semibold">Latest Updates</h2>
        </header>

        <main className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {updates.map((update, index) => (
            <Card key={index} className="hover:shadow transition">
              <CardHeader>
                <CardTitle>{update.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(update.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{update.description}</p>
              </CardContent>
            </Card>
          ))}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
