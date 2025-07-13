"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  const router = useRouter()

  const handleRedirect = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (user?.role === "admin") router.push("/admin")
    else if (user?.role === "moderator") router.push("/moderator")
    else if (user?.role === "user") router.push("/user")
    else router.push("/login")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-lg text-muted-foreground mb-6">
        You are not authorized to view this page.
      </p>
      <Button onClick={handleRedirect} variant="outline">
        ← Go to Dashboard
      </Button>
    </div>
  )
}
