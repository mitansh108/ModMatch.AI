"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ResourcesPage() {
  const resources = [
    {
      title: "JavaScript Info",
      url: "https://javascript.info/",
      description: "Deep modern JavaScript knowledge, from basics to advanced.",
    },
    {
      title: "FreeCodeCamp",
      url: "https://www.freecodecamp.org/",
      description: "Free coding tutorials and projects with certification.",
    },
    {
      title: "MDN Web Docs",
      url: "https://developer.mozilla.org/",
      description: "Official documentation for HTML, CSS, JavaScript, and more.",
    },
    {
      title: "Frontend Masters (Free Courses)",
      url: "https://frontendmasters.com/learn/",
      description: "Free expert-led courses on modern web development.",
    },
    {
      title: "Oracle Java Tutorials",
      url: "https://docs.oracle.com/javase/tutorial/",
      description: "Official learning resources for Java programming.",
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <h2 className="text-xl font-semibold">Resources</h2>
        </header>

        <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <Card key={res.title} className="hover:shadow-md transition">
              <CardHeader>
                <CardTitle>{res.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{res.description}</p>
                <Link
                  href={res.url}
                  target="_blank"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Visit Resource →
                </Link>
              </CardContent>
            </Card>
          ))}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
